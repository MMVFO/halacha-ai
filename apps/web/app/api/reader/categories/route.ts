import { NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

/**
 * GET /api/reader/categories
 * Returns category groupings derived from works_summary.
 * Groups by corpus_tier and era, with sample works and counts.
 */
export async function GET() {
  try {
    // Group by corpus_tier
    const tierResult = await pool.query(`
      SELECT
        corpus_tier AS name,
        COUNT(DISTINCT work)::int AS count,
        array_agg(DISTINCT work ORDER BY work) FILTER (WHERE work IS NOT NULL) AS works_sample
      FROM works_summary
      GROUP BY corpus_tier
      ORDER BY count DESC
    `);

    // Group by era
    const eraResult = await pool.query(`
      SELECT
        COALESCE(era, 'Unknown') AS name,
        COUNT(DISTINCT work)::int AS count,
        array_agg(DISTINCT work ORDER BY work) FILTER (WHERE work IS NOT NULL) AS works_sample
      FROM works_summary
      GROUP BY era
      ORDER BY count DESC
    `);

    // Group by community
    const communityResult = await pool.query(`
      SELECT
        community AS name,
        COUNT(DISTINCT work)::int AS count,
        array_agg(DISTINCT work ORDER BY work) FILTER (WHERE work IS NOT NULL) AS works_sample
      FROM works_summary
      WHERE community != 'General'
      GROUP BY community
      ORDER BY count DESC
    `);

    // Trim works_sample to 5 per category
    const trimSamples = (rows: any[]) =>
      rows.map((r) => ({
        name: r.name,
        count: r.count,
        works_sample: (r.works_sample || []).slice(0, 5),
      }));

    return NextResponse.json({
      tiers: trimSamples(tierResult.rows),
      eras: trimSamples(eraResult.rows),
      communities: trimSamples(communityResult.rows),
    });
  } catch (err) {
    console.error("Categories API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
