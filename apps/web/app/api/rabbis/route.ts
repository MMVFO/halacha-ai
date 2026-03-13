import { NextRequest, NextResponse } from "next/server";
import { getRabbis, getRabbi, getRabbiWorks, pool } from "@halacha-ai/db";

/**
 * GET /api/rabbis
 *
 * Query params:
 *   id       - get single rabbi with works and chunk count
 *   search   - filter by name (English or Hebrew)
 *   era      - filter by era
 *   community - filter by community
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Single rabbi with works + chunk counts
    if (id) {
      const rabbi = await getRabbi(parseInt(id, 10));
      if (!rabbi) {
        return NextResponse.json({ error: "Rabbi not found" }, { status: 404 });
      }

      const works = await getRabbiWorks(rabbi.id);

      // Count chunks authored by this rabbi (match on name_en)
      const { rows: chunkCountRows } = await pool.query(
        `SELECT COUNT(*)::int AS total FROM halacha_chunks WHERE author ILIKE $1`,
        [`%${rabbi.name_en}%`]
      );
      const chunkCount = chunkCountRows[0]?.total ?? 0;

      // Per-work chunk counts
      const worksWithCounts = await Promise.all(
        works.map(async (w) => {
          const { rows } = await pool.query(
            `SELECT COUNT(*)::int AS count FROM halacha_chunks WHERE work ILIKE $1`,
            [`%${w.work_name}%`]
          );
          return { ...w, chunk_count: rows[0]?.count ?? 0 };
        })
      );

      // Recent chunks by this author
      const { rows: recentChunks } = await pool.query(
        `SELECT id, work, section_ref, language, text, era, community, corpus_tier
         FROM halacha_chunks
         WHERE author ILIKE $1
         ORDER BY id DESC
         LIMIT 10`,
        [`%${rabbi.name_en}%`]
      );

      return NextResponse.json({
        rabbi,
        works: worksWithCounts,
        chunkCount,
        recentChunks,
      });
    }

    // List rabbis with filters
    const search = searchParams.get("search") ?? undefined;
    const era = searchParams.get("era") ?? undefined;
    const community = searchParams.get("community") ?? undefined;

    const rabbis = await getRabbis({ search, era, community });

    // Attach works count per rabbi
    const rabbisWithMeta = await Promise.all(
      rabbis.map(async (r) => {
        const { rows } = await pool.query(
          `SELECT COUNT(*)::int AS count FROM rabbi_works WHERE rabbi_id = $1`,
          [r.id]
        );
        return { ...r, works_count: rows[0]?.count ?? 0 };
      })
    );

    return NextResponse.json({ rabbis: rabbisWithMeta });
  } catch (err) {
    console.error("Rabbis API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
