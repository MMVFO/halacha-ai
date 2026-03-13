import { NextRequest } from "next/server";
import { search, generate } from "@halacha-ai/lib";

type DiscoveryMode = "connections" | "consensus" | "whatif" | "cross_community" | "unanswerable" | "patterns" | "lost_context" | "paper";

const MODE_PROMPTS: Record<DiscoveryMode, string> = {
  connections: `You are a halakhic discovery engine specializing in finding UNDISCOVERED CONNECTIONS between distant texts.

Given a topic, identify thematic parallels across works that are separated by era, genre, or community. Look for:
- Shared concepts expressed in different terminology
- Parallel logical structures across different halakhic domains
- Surprising thematic echoes between aggadic and halakhic material
- Conceptual bridges between seemingly unrelated sugyot

Respond with valid JSON:
{
  "mode": "connections",
  "query": "the query",
  "summary": "overview of discovered connections",
  "discoveries": [
    {
      "title": "connection title",
      "description": "detailed explanation of the connection",
      "source_a": { "work": "name", "ref": "reference", "era": "era", "excerpt": "key quote" },
      "source_b": { "work": "name", "ref": "reference", "era": "era", "excerpt": "key quote" },
      "insight": "what this connection reveals",
      "novelty": "high|medium|low"
    }
  ]
}`,

  consensus: `You are a halakhic discovery engine specializing in CONSENSUS MAPPING.

Given a halakhic question, map the full spectrum of opinions from the most lenient to the most stringent. For each position, identify:
- The key authorities who hold this position
- The primary reasoning (sevara)
- Whether this is the majority or minority view
- Which communities follow this position

Respond with valid JSON:
{
  "mode": "consensus",
  "query": "the question",
  "summary": "overview of the spectrum",
  "spectrum": [
    {
      "position": "description of this position",
      "stance": "most_lenient|lenient|moderate|stringent|most_stringent",
      "authorities": ["name (era)"],
      "reasoning": "the sevara behind this position",
      "communities": ["which communities follow this"],
      "is_majority": true/false,
      "sources": ["source references"]
    }
  ],
  "practical_note": "how this plays out in practice today"
}`,

  whatif: `You are a halakhic discovery engine specializing in "WHAT IF?" analysis.

Given a hypothetical modern situation, trace the halakhic precedents that would apply and show how existing principles extend to new cases. Follow the traditional method of:
1. Identify the closest existing halakhic categories
2. Apply reasoning by analogy (hekkesh, kal va-chomer, gezerah shavah)
3. Consider multiple approaches different authorities might take
4. Note where existing precedent is insufficient

Respond with valid JSON:
{
  "mode": "whatif",
  "query": "the scenario",
  "summary": "overview of the analysis",
  "precedents": [
    {
      "principle": "the halakhic principle",
      "source": "where it comes from",
      "application": "how it applies to this scenario",
      "authority": "who established this",
      "reasoning_type": "kal_vachomer|hekkesh|svara|gezera_shava|direct"
    }
  ],
  "approaches": [
    {
      "perspective": "approach name",
      "ruling": "what this approach would say",
      "basis": "reasoning",
      "likely_authorities": ["who might rule this way"]
    }
  ],
  "unresolved": "what remains unclear"
}`,

  cross_community: `You are a halakhic discovery engine specializing in CROSS-COMMUNITY SYNTHESIS.

Given a topic, analyze how Ashkenazi and Sephardi traditions converge and diverge. Identify:
- Shared foundations and where paths diverge
- The historical reasons for divergence
- Cases of surprising convergence
- Modern trends toward unification or further divergence

Respond with valid JSON:
{
  "mode": "cross_community",
  "query": "the topic",
  "summary": "overview of cross-community analysis",
  "comparisons": [
    {
      "aspect": "specific aspect being compared",
      "ashkenazi": {
        "position": "the Ashkenazi position",
        "key_authority": "primary authority",
        "source": "source reference"
      },
      "sephardi": {
        "position": "the Sephardi position",
        "key_authority": "primary authority",
        "source": "source reference"
      },
      "relationship": "convergent|divergent|parallel|unique",
      "reason_for_difference": "historical/textual reason",
      "modern_trend": "description of current trajectory"
    }
  ],
  "synthesis": "what we learn from comparing these traditions"
}`,

  unanswerable: `You are analyzing an unresolved question (teku or open machloket) in Jewish law. Search the full corpus for any combination of sources that might provide a resolution. Consider overlooked opinions, tangential sugyot, and novel combinations of principles.

Respond with valid JSON:
{
  "mode": "unanswerable",
  "query": "the question",
  "summary": "overview of the analysis",
  "question": "the unresolved question restated",
  "proposed_resolution": "your proposed resolution based on source analysis",
  "source_chain": [
    {
      "source": "source reference",
      "text": "relevant text or paraphrase",
      "relevance": "how this source contributes to the resolution"
    }
  ],
  "confidence": "low|medium|high",
  "caveats": ["caveat 1", "caveat 2"],
  "remaining_uncertainties": ["uncertainty 1"]
}`,

  patterns: `You are a halakhic discovery engine specializing in identifying recurring halakhic reasoning PATTERNS across centuries and communities. Look for structural similarities in how different poskim approach problems, shared methodological frameworks, and evolving patterns of legal reasoning.

Respond with valid JSON:
{
  "mode": "patterns",
  "query": "the pattern query",
  "summary": "overview of the detected pattern",
  "pattern_name": "name for this reasoning pattern",
  "description": "detailed description of the pattern",
  "instances": [
    {
      "source": "source reference",
      "era": "Tannaic|Amoraic|Gaonic|Rishon|Acharon|Contemporary",
      "community": "community name",
      "excerpt": "relevant excerpt",
      "reasoning_type": "type of reasoning used"
    }
  ],
  "frequency": "description of how common this pattern is",
  "evolution": "how the pattern changed over time"
}`,

  lost_context: `You are a halakhic discovery engine specializing in reconstructing LOST CONTEXT. Given a cryptic or terse passage, use surrounding sources, historical context, and parallel texts to reconstruct the likely original meaning and reasoning. Consider the conventions of the era, the author's other works, and contemporary discourse.

Respond with valid JSON:
{
  "mode": "lost_context",
  "query": "the passage",
  "summary": "overview of the reconstruction",
  "original_passage": "the passage as given",
  "historical_context": "the historical and literary context",
  "likely_reasoning": "the reconstructed reasoning behind the passage",
  "supporting_sources": [
    {
      "source": "source reference",
      "text": "relevant text",
      "connection": "how this source illuminates the passage"
    }
  ],
  "alternative_interpretations": ["interpretation 1", "interpretation 2"],
  "confidence": "low|medium|high"
}`,

  paper: `You are a Torah scholarship assistant generating structured research paper drafts. Create an academically rigorous outline with proper source citations, following the methodology of traditional Torah scholarship combined with modern academic standards.

Respond with valid JSON:
{
  "mode": "paper",
  "query": "the thesis/question",
  "summary": "overview of the paper",
  "title": "proposed paper title",
  "abstract": "paper abstract (150-250 words)",
  "methodology_note": "brief note on methodology used",
  "sections": [
    {
      "heading": "section heading",
      "content": "section content",
      "citations": [
        { "source": "source reference", "text": "cited text" }
      ]
    }
  ],
  "conclusion": "paper conclusion",
  "bibliography": ["source 1", "source 2"]
}`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, query } = body as { mode: string; query: string };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discoveryMode = (["connections", "consensus", "whatif", "cross_community", "unanswerable", "patterns", "lost_context", "paper"].includes(mode) ? mode : "connections") as DiscoveryMode;

    // Search the corpus
    const { sources } = await search({
      question: query.trim(),
      corpusTiers: ["canonical"],
      mode: "deep_research",
    });

    const sourcesContext = sources
      .slice(0, 15)
      .map((s, i) => `[${i + 1}] ${s.work} (${s.sectionRef}) [${s.era || "Unknown"}, ${s.community}]:\n${s.text}`)
      .join("\n\n");

    const systemPrompt = MODE_PROMPTS[discoveryMode];
    const userPrompt = `Query: "${query.trim()}"

Relevant sources from the corpus:
${sourcesContext}

Analyze these sources and any broader knowledge to provide discovery insights. Return your analysis as JSON.`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const llmResponse = await generate(messages, { taskType: "deep_analysis" });

    const citedSources = sources.slice(0, 10).map((s) => ({
      id: s.id,
      work: s.work,
      sectionRef: s.sectionRef,
      era: s.era,
      community: s.community,
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
    console.error("Discovery API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
