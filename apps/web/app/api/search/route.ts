import { NextRequest, NextResponse } from "next/server";
import { search } from "@halacha-ai/lib";
import type { CorpusTier, Community } from "@halacha-ai/db";

/**
 * GET /api/search
 * Search the halacha corpus using hybrid search (pgvector + tsvector + RRF).
 *
 * Query params:
 *   q           - search query (required)
 *   work        - filter by work name (optional)
 *   era         - filter by era (optional)
 *   community   - filter by community (optional)
 *   corpusTier  - comma-separated corpus tiers (optional, default: canonical)
 *   limit       - max results (optional, default: 40)
 *   author      - filter by author name (optional)
 *   offset      - pagination offset (optional, default: 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "q (search query) parameter is required" },
        { status: 400 },
      );
    }

    const work = searchParams.get("work") || undefined;
    const era = searchParams.get("era") || undefined;
    const author = searchParams.get("author") || undefined;
    const community = (searchParams.get("community") || "General") as Community;
    const corpusTierParam = searchParams.get("corpusTier");
    const corpusTiers: CorpusTier[] = corpusTierParam
      ? (corpusTierParam.split(",") as CorpusTier[])
      : ["canonical"];
    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await search({
      question: q,
      community,
      corpusTiers,
    });

    let filtered = result.sources;

    // Apply post-search filters
    if (work) {
      filtered = filtered.filter((s) =>
        s.work.toLowerCase().includes(work.toLowerCase()),
      );
    }
    if (era) {
      filtered = filtered.filter((s) => s.era === era);
    }
    if (author) {
      filtered = filtered.filter(
        (s) => s.author && s.author.toLowerCase().includes(author.toLowerCase()),
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginated,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
