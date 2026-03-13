import { NextRequest, NextResponse } from "next/server";
import {
  buildExplanationPrompt,
  buildComparisonPrompt,
  parseExplanationResponse,
  generate,
} from "@halacha-ai/lib";
import type {
  ExplanationLevel,
  ExplanationContext,
  ExplanationRequest,
} from "@halacha-ai/lib";

// Simple in-memory cache (concept+level+context → response)
const cache = new Map<string, { data: ReturnType<typeof parseExplanationResponse>; ts: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function cacheKey(concept: string, level: ExplanationLevel, context: ExplanationContext): string {
  return `${concept.toLowerCase().trim()}::${level}::${context}`;
}

const VALID_LEVELS: ExplanationLevel[] = ["eli5", "simple", "intermediate", "technical", "expert"];
const VALID_CONTEXTS: ExplanationContext[] = [
  "talmud", "mishnah", "halacha", "kabbalah", "tanakh",
  "midrash", "mussar", "philosophy", "history", "general",
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplanationRequest & { fromLevel?: ExplanationLevel };

    if (!body.concept || typeof body.concept !== "string" || body.concept.trim().length === 0) {
      return NextResponse.json({ error: "concept is required" }, { status: 400 });
    }
    if (!body.level || !VALID_LEVELS.includes(body.level)) {
      return NextResponse.json({ error: `level must be one of: ${VALID_LEVELS.join(", ")}` }, { status: 400 });
    }
    if (!body.context || !VALID_CONTEXTS.includes(body.context)) {
      return NextResponse.json({ error: `context must be one of: ${VALID_CONTEXTS.join(", ")}` }, { status: 400 });
    }

    const concept = body.concept.trim();
    const key = cacheKey(concept, body.level, body.context);

    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // Build prompt — comparison (level change) or fresh explanation
    let promptPair: { system: string; user: string };
    if (body.fromLevel && body.fromLevel !== body.level) {
      promptPair = buildComparisonPrompt(concept, body.fromLevel, body.level, body.context);
    } else {
      promptPair = buildExplanationPrompt({
        concept,
        level: body.level,
        context: body.context,
        surroundingText: body.surroundingText,
        sourceWork: body.sourceWork,
      });
    }

    const llmResponse = await generate([
      { role: "system", content: promptPair.system },
      { role: "user", content: promptPair.user },
    ]);

    const parsed = parseExplanationResponse(llmResponse.content, body.level, body.context);

    // Cache the result
    cache.set(key, { data: parsed, ts: Date.now() });

    // Prune old cache entries periodically
    if (cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of cache) {
        if (now - v.ts > CACHE_TTL) cache.delete(k);
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Explain error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("credit") || message.includes("quota")) {
      return NextResponse.json(
        { error: "LLM quota exceeded. Check your Anthropic billing at console.anthropic.com." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
