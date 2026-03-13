import { NextRequest, NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

/**
 * GET /api/reader/commentaries
 * Fetch commentaries for a given section.
 *
 * Query params:
 *   sectionRef - the section reference to find commentaries for (required)
 *   work       - the main work name (required)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionRef = searchParams.get("sectionRef");
    const work = searchParams.get("work");

    if (!sectionRef || !work) {
      return NextResponse.json(
        { error: "sectionRef and work parameters are required" },
        { status: 400 },
      );
    }

    // Strategy 1: Find chunks from works that are commentaries on this work
    // e.g., "Rashi on Genesis" for work "Genesis"
    const { rows: commentaryChunks } = await pool.query(
      `SELECT * FROM halacha_chunks
       WHERE work ILIKE $1
         AND (section_ref = $2 OR parent_ref = $2 OR section_ref LIKE $3)
       ORDER BY work, id ASC
       LIMIT 200`,
      [`%on ${work}%`, sectionRef, `${sectionRef}%`],
    );

    // Strategy 2: Find via text_links table — commentaries linked to this ref
    const { rows: linkedRefs } = await pool.query(
      `SELECT DISTINCT target_ref, target_work FROM text_links
       WHERE source_ref = $1 AND link_type = 'commentary'
       UNION
       SELECT DISTINCT source_ref, source_work FROM text_links
       WHERE target_ref = $1 AND link_type = 'commentary'
       LIMIT 50`,
      [sectionRef],
    );

    let linkedChunks: typeof commentaryChunks = [];
    if (linkedRefs.length > 0) {
      const refs = linkedRefs.map((r) => r.target_ref || r.source_ref);
      const works = linkedRefs
        .map((r) => r.target_work || r.source_work)
        .filter(Boolean);

      if (refs.length > 0) {
        const { rows } = await pool.query(
          `SELECT * FROM halacha_chunks
           WHERE section_ref = ANY($1)
             ${works.length > 0 ? "OR work = ANY($2)" : ""}
           ORDER BY work, id ASC
           LIMIT 200`,
          works.length > 0 ? [refs, works] : [refs],
        );
        linkedChunks = rows;
      }
    }

    // Strategy 3: Find chunks with parent_ref matching the section
    const { rows: parentRefChunks } = await pool.query(
      `SELECT * FROM halacha_chunks
       WHERE parent_ref = $1
         AND work != $2
       ORDER BY work, id ASC
       LIMIT 100`,
      [sectionRef, work],
    );

    // Merge all chunks, deduplicate by id
    const seen = new Set<number>();
    const allChunks: typeof commentaryChunks = [];
    for (const chunk of [...commentaryChunks, ...linkedChunks, ...parentRefChunks]) {
      if (!seen.has(chunk.id)) {
        seen.add(chunk.id);
        allChunks.push(chunk);
      }
    }

    // Group by commentator (work name)
    const commentaries: Record<string, typeof commentaryChunks> = {};
    for (const chunk of allChunks) {
      const commentator = chunk.work;
      if (!commentaries[commentator]) {
        commentaries[commentator] = [];
      }
      commentaries[commentator].push(chunk);
    }

    return NextResponse.json({ commentaries });
  } catch (err) {
    console.error("Commentaries API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
