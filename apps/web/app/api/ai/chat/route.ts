import { NextRequest } from "next/server";
import {
  search,
  getSystemPrompt,
  buildUserPrompt,
  generate,
} from "@halacha-ai/lib";
import {
  createResearchSession,
  appendSessionMessage,
  getSession,
} from "@halacha-ai/db";
import type { SearchMode, CorpusTier, Community } from "@halacha-ai/db";

const MODE_MAP: Record<string, SearchMode> = {
  practical: "practical",
  deep_analytic: "deep_research",
  posek_view: "posek_view",
};

const TASK_MAP: Record<string, "practical" | "deep_analysis" | "posek_view"> = {
  practical: "practical",
  deep_analytic: "deep_analysis",
  posek_view: "posek_view",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      mode = "practical",
      community = "General",
      corpusTiers = ["canonical"],
      context,
      sessionId,
    } = body as {
      question: string;
      mode?: string;
      community?: Community;
      corpusTiers?: CorpusTier[];
      context?: { work?: string; section?: string; text?: string };
      sessionId?: number;
    };

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const searchMode = MODE_MAP[mode] || "practical";
    const taskType = TASK_MAP[mode] || "practical";

    // 1. Search the corpus
    const { sources } = await search({
      question: question.trim(),
      community,
      corpusTiers,
      mode: searchMode,
    });

    // 2. Build prompts
    let systemPrompt = getSystemPrompt(searchMode);

    // Inject passage context if provided
    if (context?.text) {
      systemPrompt += `\n\nThe user is currently reading the following passage and asking about it:\n`;
      if (context.work) systemPrompt += `Work: ${context.work}\n`;
      if (context.section) systemPrompt += `Section: ${context.section}\n`;
      systemPrompt += `\nPassage text:\n${context.text}\n`;
    }

    const userPrompt = buildUserPrompt(question.trim(), sources);

    // 3. Build message history from session if available
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (sessionId) {
      const session = await getSession(sessionId);
      if (session?.messages) {
        for (const msg of session.messages as { role: string; content: string }[]) {
          if (msg.role === "user" || msg.role === "assistant") {
            messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
          }
        }
      }
    }

    messages.push({ role: "user", content: userPrompt });

    // 4. Generate response
    const llmResponse = await generate(messages, { taskType });

    // 5. Save to research session if requested
    let activeSessionId = sessionId;
    if (sessionId) {
      await appendSessionMessage(sessionId, { role: "user", content: question.trim() });
      await appendSessionMessage(sessionId, {
        role: "assistant",
        content: llmResponse.content,
        model: llmResponse.model,
        provider: llmResponse.provider,
        citations: llmResponse.citations,
      });
    }

    // 6. Stream the response using ReadableStream
    const citedSources = sources.slice(0, 10).map((s) => ({
      id: s.id,
      work: s.work,
      sectionRef: s.sectionRef,
      community: s.community,
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the full response in chunks to simulate streaming
        const content = llmResponse.content;
        const chunkSize = 80;
        let pos = 0;

        function pushChunk() {
          if (pos >= content.length) {
            // Final metadata event
            const meta = JSON.stringify({
              type: "meta",
              model: llmResponse.model,
              provider: llmResponse.provider,
              citations: llmResponse.citations || [],
              sources: citedSources,
              sessionId: activeSessionId,
            });
            controller.enqueue(encoder.encode(`\n\ndata: ${meta}\n\n`));
            controller.close();
            return;
          }

          const slice = content.slice(pos, pos + chunkSize);
          const data = JSON.stringify({ type: "text", content: slice });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          pos += chunkSize;

          // Small delay between chunks is not needed in server context;
          // the browser will receive them as they arrive
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
    console.error("AI chat error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";

    if (message.includes("credit") || message.includes("quota")) {
      return new Response(
        JSON.stringify({ error: "LLM quota exceeded. Check your API billing." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
