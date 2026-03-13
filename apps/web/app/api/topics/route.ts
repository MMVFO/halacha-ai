import { NextRequest, NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const id = req.nextUrl.searchParams.get("id");

  try {
    // Single topic with linked chunks
    if (id) {
      const topicResult = await pool.query(
        `SELECT * FROM topics WHERE id = $1`,
        [parseInt(id, 10)]
      );
      const topic = topicResult.rows[0];
      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }

      const chunksResult = await pool.query(
        `SELECT c.id, c.work, c.section_ref, c.language, c.text, c.author, c.era,
                c.community, c.corpus_tier, tl.relevance
         FROM topic_links tl
         JOIN halacha_chunks c ON c.id = tl.chunk_id
         WHERE tl.topic_id = $1
         ORDER BY tl.relevance DESC
         LIMIT 50`,
        [parseInt(id, 10)]
      );

      return NextResponse.json({
        topic,
        chunks: chunksResult.rows,
      });
    }

    // Search topics by name
    if (search && search.trim().length > 0) {
      const { rows } = await pool.query(
        `SELECT t.id, t.name, t.name_he, t.description,
                COUNT(tl.id)::int AS count
         FROM topics t
         LEFT JOIN topic_links tl ON tl.topic_id = t.id
         WHERE t.name ILIKE $1 OR t.name_he ILIKE $1
         GROUP BY t.id
         ORDER BY count DESC
         LIMIT 100`,
        [`%${search.trim()}%`]
      );
      return NextResponse.json({ topics: rows });
    }

    // Default: list all topics with counts
    const { rows } = await pool.query(
      `SELECT t.id, t.name, t.name_he, t.description,
              COUNT(tl.id)::int AS count
       FROM topics t
       LEFT JOIN topic_links tl ON tl.topic_id = t.id
       GROUP BY t.id
       ORDER BY count DESC
       LIMIT 200`
    );

    return NextResponse.json({ topics: rows });
  } catch (err) {
    console.error("Topics API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
