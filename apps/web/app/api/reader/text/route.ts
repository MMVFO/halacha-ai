import { NextRequest, NextResponse } from "next/server";
import { getWorkText, getChunkWithRelations, findCrossReferences, getRelationsForSection } from "@halacha-ai/db";

/**
 * GET /api/reader/text
 * Fetch text content for reading.
 *
 * Query params:
 *   work - work name (required)
 *   section - section_ref prefix to filter
 *   language - language filter
 *   limit - chunks per page (default 50)
 *   offset - pagination offset
 *   chunkId - get single chunk with relations
 *   crossRef - get cross-references for a section_ref
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Single chunk with relations
    const chunkId = searchParams.get("chunkId");
    if (chunkId) {
      const result = await getChunkWithRelations(parseInt(chunkId, 10));
      if (!result.chunk) {
        return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // Cross-references lookup — use relations table first, fall back to ILIKE
    const crossRef = searchParams.get("crossRef");
    const crossRefWork = searchParams.get("crossRefWork");
    if (crossRef && crossRefWork) {
      // Try relations table first (1.4M+ structural links)
      const relResults = await getRelationsForSection(crossRef, crossRefWork, 50);
      if (relResults.length > 0) {
        return NextResponse.json({
          references: relResults.map(r => r.chunk),
          source: "relations",
          count: relResults.length,
        });
      }
      // Fall back to naive ILIKE section_ref matching
      const refs = await findCrossReferences(crossRef, crossRefWork, 10);
      return NextResponse.json({ references: refs, source: "ilike", count: refs.length });
    }

    // Main text reading
    const work = searchParams.get("work");
    if (!work) {
      return NextResponse.json({ error: "work parameter is required" }, { status: 400 });
    }

    const sectionPrefix = searchParams.get("section") ?? undefined;
    const language = searchParams.get("language") ?? undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getWorkText(work, { sectionPrefix, language, limit, offset });
    return NextResponse.json({
      work,
      chunks: result.chunks,
      total: result.total,
      limit,
      offset,
      hasMore: offset + result.chunks.length < result.total,
    });
  } catch (err) {
    console.error("Reader text error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
