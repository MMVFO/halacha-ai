import { NextRequest, NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const section = url.searchParams.get("section"); // optional: "totals", "tiers", "languages", "works"

    // Always fetch totals
    const totalsQuery = pool.query(`
      SELECT
        COUNT(DISTINCT work)::int AS total_works,
        COUNT(*)::int AS total_chunks,
        COUNT(embedding)::int AS total_embedded
      FROM halacha_chunks
    `);

    // Tier breakdown
    const tierQuery = pool.query(`
      SELECT
        corpus_tier,
        COUNT(DISTINCT work)::int AS work_count,
        COUNT(*)::int AS chunk_count,
        COUNT(embedding)::int AS embedded_count
      FROM halacha_chunks
      GROUP BY corpus_tier
      ORDER BY chunk_count DESC
    `);

    // Language breakdown
    const langQuery = pool.query(`
      SELECT language, COUNT(*)::int AS chunk_count
      FROM halacha_chunks
      GROUP BY language
      ORDER BY chunk_count DESC
    `);

    // Community breakdown
    const communityQuery = pool.query(`
      SELECT community, COUNT(*)::int AS chunk_count
      FROM halacha_chunks
      GROUP BY community
      ORDER BY chunk_count DESC
    `);

    // Top 20 largest works
    const topWorksQuery = pool.query(`
      SELECT
        work,
        corpus_tier,
        language,
        community,
        MIN(author) AS author,
        MIN(era) AS era,
        COUNT(*)::int AS chunk_count,
        COUNT(embedding)::int AS embedded_count
      FROM halacha_chunks
      GROUP BY work, corpus_tier, language, community
      ORDER BY chunk_count DESC
      LIMIT 20
    `);

    // If a specific section is requested, only return that
    if (section === "totals") {
      const { rows } = await totalsQuery;
      return NextResponse.json(rows[0]);
    }

    if (section === "tiers") {
      const { rows } = await tierQuery;
      return NextResponse.json({ tiers: rows });
    }

    if (section === "languages") {
      const { rows } = await langQuery;
      return NextResponse.json({ languages: rows });
    }

    if (section === "works") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 500);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);
      const search = url.searchParams.get("search") || "";
      const tier = url.searchParams.get("tier") || "";
      const lang = url.searchParams.get("lang") || "";

      const conditions: string[] = [];
      const params: (string | number)[] = [];
      let pIdx = 0;

      if (search) {
        pIdx++;
        conditions.push(`work ILIKE $${pIdx}`);
        params.push(`%${search}%`);
      }
      if (tier) {
        pIdx++;
        conditions.push(`corpus_tier = $${pIdx}`);
        params.push(tier);
      }
      if (lang) {
        pIdx++;
        conditions.push(`language = $${pIdx}`);
        params.push(lang);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countResult = await pool.query(
        `SELECT COUNT(*) AS total FROM (
           SELECT work FROM halacha_chunks ${where}
           GROUP BY work, corpus_tier, language, community
         ) sub`,
        params.slice(0, pIdx)
      );
      const total = parseInt(countResult.rows[0].total, 10);

      pIdx++;
      params.push(limit);
      const limitIdx = pIdx;
      pIdx++;
      params.push(offset);
      const offsetIdx = pIdx;

      const { rows } = await pool.query(
        `SELECT
           work, corpus_tier, language, community,
           MIN(author) AS author, MIN(era) AS era,
           COUNT(*)::int AS chunk_count,
           COUNT(embedding)::int AS embedded_count
         FROM halacha_chunks
         ${where}
         GROUP BY work, corpus_tier, language, community
         ORDER BY chunk_count DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        params
      );

      return NextResponse.json({ works: rows, total });
    }

    // Default: return full inventory overview
    const [totalsResult, tierResult, langResult, communityResult, topWorksResult] = await Promise.all([
      totalsQuery,
      tierQuery,
      langQuery,
      communityQuery,
      topWorksQuery,
    ]);

    const totals = totalsResult.rows[0];
    const embeddedPct = totals.total_chunks > 0
      ? parseFloat(((totals.total_embedded / totals.total_chunks) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      totals: {
        ...totals,
        embedded_percentage: embeddedPct,
        unembedded: totals.total_chunks - totals.total_embedded,
      },
      tiers: tierResult.rows.map((t: Record<string, unknown>) => ({
        ...t,
        embedded_percentage: (t.chunk_count as number) > 0
          ? parseFloat((((t.embedded_count as number) / (t.chunk_count as number)) * 100).toFixed(1))
          : 0,
      })),
      languages: langResult.rows,
      communities: communityResult.rows,
      topWorks: topWorksResult.rows.map((w: Record<string, unknown>) => ({
        ...w,
        embedded_percentage: (w.chunk_count as number) > 0
          ? parseFloat((((w.embedded_count as number) / (w.chunk_count as number)) * 100).toFixed(1))
          : 0,
      })),
    });
  } catch (err) {
    console.error("Corpus inventory error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
