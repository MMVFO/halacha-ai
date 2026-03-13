import { NextRequest } from "next/server";
import { search, generate } from "@halacha-ai/lib";

const ANALYSIS_SYSTEM_PROMPT = `You are a scholarly halakhic analysis engine. Your task is to trace how understanding of a given topic evolved across different eras of Jewish scholarship.

IMPORTANT FRAMING: Always use respectful "building upon" language. Later authorities refine, clarify, and build upon earlier positions — they do not "correct errors." This reflects the traditional understanding of Torah scholarship development.

When given a topic, analyze it across eras (Tannaim, Amoraim, Geonim, Rishonim, Acharonim, Modern) and identify:
1. How the understanding evolved over time
2. Where later authorities offered different interpretations or rulings
3. The reasoning behind each position

For each development chain, provide:
- The original position (author, era, source, summary)
- The later development (author, era, source, summary, how they built upon the original)
- A confidence level: "established" (widely accepted), "debated" (multiple positions exist), or "uncertain" (limited sources)

Respond ONLY with valid JSON in this exact format:
{
  "topic": "the analyzed topic",
  "summary": "brief overview of how this topic's understanding evolved",
  "chains": [
    {
      "id": 1,
      "original": {
        "author": "name",
        "era": "era name",
        "source": "source reference",
        "position": "summary of the original position"
      },
      "development": {
        "author": "name",
        "era": "era name",
        "source": "source reference",
        "position": "summary of how they built upon or refined the original",
        "relationship": "clarifies|extends|reinterprets|limits|expands"
      },
      "confidence": "established|debated|uncertain",
      "significance": "why this development matters"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body as { topic: string };

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Search the corpus for relevant sources
    const { sources } = await search({
      question: topic.trim(),
      corpusTiers: ["canonical"],
      mode: "deep_research",
    });

    const sourcesContext = sources
      .slice(0, 15)
      .map((s, i) => `[${i + 1}] ${s.work} (${s.sectionRef}) [${s.era || "Unknown era"}]:\n${s.text}`)
      .join("\n\n");

    const userPrompt = `Analyze the historical development of this halakhic topic: "${topic.trim()}"

Here are relevant sources from the corpus:
${sourcesContext}

Trace how the understanding of this topic evolved across eras. Identify correction/development chains where later authorities built upon or refined earlier positions. Return your analysis as JSON.`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const llmResponse = await generate(messages, { taskType: "deep_analysis" });

    // Stream the response
    const citedSources = sources.slice(0, 10).map((s) => ({
      id: s.id,
      work: s.work,
      sectionRef: s.sectionRef,
      era: s.era,
      author: s.author,
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const content = llmResponse.content;
        const chunkSize = 120;
        let pos = 0;

        function pushChunk() {
          if (pos >= content.length) {
            const meta = JSON.stringify({
              type: "meta",
              model: llmResponse.model,
              provider: llmResponse.provider,
              sources: citedSources,
            });
            controller.enqueue(encoder.encode(`\n\ndata: ${meta}\n\n`));
            controller.close();
            return;
          }

          const slice = content.slice(pos, pos + chunkSize);
          const data = JSON.stringify({ type: "text", content: slice });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          pos += chunkSize;
          pushChunk();
        }

        pushChunk();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Analysis API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
