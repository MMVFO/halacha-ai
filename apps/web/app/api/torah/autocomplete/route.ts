import { NextRequest, NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

/**
 * GET /api/torah/autocomplete?q=term&limit=20
 * Returns matching works and section refs for typeahead search.
 *
 * Response: { works: [{work, category, chunk_count}], refs: [{work, section_ref}] }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    if (!q || q.length < 1) {
      return NextResponse.json({ works: [], refs: [] });
    }

    const worksLimit = Math.min(Math.ceil(limit / 2), 10);
    const refsLimit = Math.min(limit - worksLimit, 10);
    const pattern = `${q}%`;
    const ilikePattern = `%${q}%`;

    // Search works by prefix match on work_name (case-insensitive)
    const worksResult = await pool.query(
      `SELECT work_name AS work, COALESCE(category, 'Other') AS category, chunk_count
       FROM works
       WHERE work_name ILIKE $1
       ORDER BY
         CASE WHEN work_name ILIKE $2 THEN 0 ELSE 1 END,
         chunk_count DESC
       LIMIT $3`,
      [ilikePattern, pattern, worksLimit]
    );

    // Search section_refs from halacha_chunks matching the term
    const refsResult = await pool.query(
      `SELECT DISTINCT work, section_ref
       FROM halacha_chunks
       WHERE section_ref ILIKE $1
       ORDER BY work, section_ref
       LIMIT $2`,
      [pattern, refsLimit]
    );

    return NextResponse.json({
      works: worksResult.rows,
      refs: refsResult.rows,
    });
  } catch (err) {
    console.error("Autocomplete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
