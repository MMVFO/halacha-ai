import { NextRequest, NextResponse } from "next/server";
import { searchDictionary, pool } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");

  if (!word || word.trim().length === 0) {
    return NextResponse.json({ error: "word parameter is required" }, { status: 400 });
  }

  try {
    const trimmed = word.trim();

    // Dictionary lookup + frequency count in parallel
    const [entries, freqResult] = await Promise.all([
      searchDictionary(trimmed),
      pool.query(
        `SELECT COUNT(*)::int AS frequency
         FROM halacha_chunks
         WHERE text ILIKE $1`,
        [`%${trimmed}%`]
      ),
    ]);

    const frequency = freqResult.rows[0]?.frequency ?? 0;

    // If we found entries with a root, also look for related words sharing the same root
    let relatedEntries: typeof entries = [];
    if (entries.length > 0) {
      const primaryRoot = entries[0]?.root;
      if (primaryRoot) {
        const relatedResult = await searchDictionary(primaryRoot);
        // Filter out the exact word we already found
        relatedEntries = relatedResult
          .filter((e: { word_normalized: string }) => e.word_normalized !== entries[0]?.word_normalized)
          .slice(0, 5);
      }
    }

    return NextResponse.json({
      entries,
      frequency,
      related: relatedEntries,
    });
  } catch (err) {
    console.error("Dictionary lookup error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
