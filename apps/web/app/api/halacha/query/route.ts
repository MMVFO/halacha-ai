import { NextRequest, NextResponse } from "next/server";
import type { SearchMode, CorpusTier, Community } from "@halacha-ai/db";
import { getUserProfile, insertAnswer } from "@halacha-ai/db";
import { search, getSystemPrompt, buildUserPrompt, generate, embedQuestion } from "@halacha-ai/lib";

interface QueryRequest {
  question: string;
  community?: Community;
  corpusTiers?: CorpusTier[];
  mode?: SearchMode;
  userId?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QueryRequest;

    if (!body.question || typeof body.question !== "string" || body.question.trim().length === 0) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const question = body.question.trim();
    const mode: SearchMode = body.mode ?? "practical";
    const community: Community = body.community ?? "General";
    const corpusTiers: CorpusTier[] = body.corpusTiers ?? ["canonical"];

    // Validate corpus tiers
    const validTiers: CorpusTier[] = ["canonical", "apocrypha", "pseudepigrapha", "academic", "private"];
    for (const tier of corpusTiers) {
      if (!validTiers.includes(tier)) {
        return NextResponse.json({ error: `Invalid corpus tier: ${tier}` }, { status: 400 });
      }
    }

    // Look up user profile if provided
    let userCommunity = community;
    if (body.userId) {
      const profile = await getUserProfile(body.userId);
      if (profile) {
        userCommunity = profile.primary_community;
      }
    }

    // Run hybrid search
    let searchResult;
    try {
      searchResult = await search({
        question,
        community: userCommunity,
        corpusTiers,
        mode,
      });
    } catch (searchErr: unknown) {
      const msg = searchErr instanceof Error ? searchErr.message : String(searchErr);
      if (msg.includes("Embedding API error") || msg.includes("placeholder")) {
        return NextResponse.json({
          answer: "The embedding API is not configured yet. Set a valid EMBEDDING_API_KEY in .env and restart the server.",
          sources: [],
          setup_required: true,
        });
      }
      throw searchErr;
    }

    if (searchResult.sources.length === 0) {
      return NextResponse.json({
        answer: "No relevant sources found. The corpus may not be ingested yet \u2014 run the ingestion scripts to load halakhic texts into the database.",
        sources: [],
        setup_required: true,
      });
    }

    // Generate answer via LLM
    const systemPrompt = getSystemPrompt(mode);
    const userPrompt = buildUserPrompt(question, searchResult.sources);

    let llmResponse;
    try {
      llmResponse = await generate([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);
    } catch (llmErr: unknown) {
      const msg = llmErr instanceof Error ? llmErr.message : String(llmErr);
      if (msg.includes("placeholder") || msg.includes("401") || msg.includes("authentication")) {
        return NextResponse.json({
          answer: "The LLM API key is not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env.",
          sources: searchResult.sources,
          setup_required: true,
        });
      }
      throw llmErr;
    }

    // Log answer (best-effort)
    try {
      const questionEmbedding = await embedQuestion(question);
      await insertAnswer({
        question,
        question_embedding: questionEmbedding,
        answer: llmResponse.content,
        cited_chunk_ids: searchResult.sources.map((s) => s.id),
        user_id: body.userId,
        user_community: userCommunity,
        corpus_tiers_used: corpusTiers,
        mode,
      });
    } catch (logErr) {
      console.warn("Failed to log answer:", logErr);
    }

    return NextResponse.json({
      answer: llmResponse.content,
      sources: searchResult.sources,
    });
  } catch (err) {
    console.error("Query error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
