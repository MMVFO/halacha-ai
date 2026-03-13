import { NextRequest, NextResponse } from "next/server";
import { getWorks, getWorkTOC, expandSynonyms } from "@halacha-ai/db";
import { expandQueryVariants } from "@halacha-ai/lib";

/**
 * GET /api/reader/works
 * List works or get TOC for a specific work.
 *
 * Query params:
 *   search - filter works by name
 *   language - filter by language (he/en/arc)
 *   category - filter by work category (e.g. Tanakh, Mishnah, Halakhah)
 *   work - get table of contents for specific work
 *   limit - pagination limit (default 100)
 *   offset - pagination offset (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const work = searchParams.get("work");

    // If specific work requested, return its TOC
    if (work) {
      const toc = await getWorkTOC(work);
      return NextResponse.json(toc);
    }

    // Otherwise list works
    const search = searchParams.get("search") ?? undefined;
    const language = searchParams.get("language") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Expand search string for transliteration tolerance
    let searchVariants: string[] | undefined;
    if (search) {
      const variants = new Set<string>();
      for (const v of expandQueryVariants(search)) variants.add(v);
      const synonyms = await expandSynonyms(search);
      for (const syn of synonyms) {
        for (const v of expandQueryVariants(syn)) variants.add(v);
      }
      searchVariants = [...variants];
    }

    const result = await getWorks({ search, searchVariants, language, category, limit, offset });

    // Enrich works with category from the works table (left join)
    const workNames = result.works.map((w) => w.work);
    let categoryMap: Record<string, string> = {};
    if (workNames.length > 0) {
      const { pool } = await import("@halacha-ai/db");
      const catResult = await pool.query(
        `SELECT work_name, COALESCE(category, 'Other') AS category
         FROM works WHERE work_name = ANY($1)`,
        [workNames]
      );
      for (const row of catResult.rows) {
        categoryMap[row.work_name] = row.category;
      }
    }

    const worksWithCategory = result.works.map((w) => ({
      ...w,
      category: categoryMap[w.work] ?? "Other",
    }));

    return NextResponse.json({ works: worksWithCategory, total: result.total, limit, offset });
  } catch (err) {
    console.error("Reader works error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
