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
    const searchResult = await search({
      question,
      community: userCommunity,
      corpusTiers,
      mode,
    });

    if (searchResult.sources.length === 0) {
      return NextResponse.json({
        answer: "No relevant sources were found for this question in the selected corpus tiers. Try broadening your search or adjusting corpus tier settings.",
        sources: [],
      });
    }

    // Generate answer via LLM
    const systemPrompt = getSystemPrompt(mode);
    const userPrompt = buildUserPrompt(question, searchResult.sources);

    const llmResponse = await generate([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Log the answer
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
