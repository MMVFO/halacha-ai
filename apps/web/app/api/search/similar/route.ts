import { NextRequest, NextResponse } from "next/server";
import { pool, getChunksByIds, semanticSearch } from "@halacha-ai/db";

/**
 * GET /api/search/similar?chunk_id=123&limit=10
 * Find semantically similar passages to a given chunk.
 * Gets the chunk's embedding and runs a vector similarity search.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chunkIdStr = searchParams.get("chunk_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    if (!chunkIdStr) {
      return NextResponse.json(
        { error: "chunk_id parameter is required" },
        { status: 400 },
      );
    }

    const chunkId = parseInt(chunkIdStr, 10);
    if (isNaN(chunkId)) {
      return NextResponse.json(
        { error: "chunk_id must be a valid number" },
        { status: 400 },
      );
    }

    // Get the source chunk and its embedding
    const sourceChunks = await getChunksByIds([chunkId]);
    if (sourceChunks.length === 0) {
      return NextResponse.json(
        { error: "Chunk not found" },
        { status: 404 },
      );
    }

    const source = sourceChunks[0];
    if (!source.embedding) {
      return NextResponse.json(
        { error: "Chunk has no embedding" },
        { status: 400 },
      );
    }

    // Run semantic search with the chunk's embedding
    const similarResults = await semanticSearch(
      source.embedding,
      ["canonical", "apocrypha", "pseudepigrapha", "academic"],
      limit + 1, // +1 to account for the source chunk itself
    );

    // Filter out the source chunk
    const filteredIds = similarResults
      .filter((r) => r.id !== chunkId)
      .slice(0, limit)
      .map((r) => r.id);

    // Load full chunk data
    const chunks = await getChunksByIds(filteredIds);

    // Build distance map for sorting
    const distanceMap = new Map(
      similarResults.map((r) => [r.id, r.distance]),
    );

    // Sort by distance (similarity)
    chunks.sort(
      (a, b) => (distanceMap.get(a.id) ?? 999) - (distanceMap.get(b.id) ?? 999),
    );

    const results = chunks.map((c) => ({
      id: c.id,
      work: c.work,
      sectionRef: c.section_ref,
      parentRef: c.parent_ref,
      community: c.community,
      corpusTier: c.corpus_tier,
      author: c.author,
      era: c.era,
      text: c.text,
      distance: distanceMap.get(c.id) ?? null,
    }));

    return NextResponse.json({
      source: {
        id: source.id,
        work: source.work,
        sectionRef: source.section_ref,
      },
      results,
    });
  } catch (err) {
    console.error("Similar search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
