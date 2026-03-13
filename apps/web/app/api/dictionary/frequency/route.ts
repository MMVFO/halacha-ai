import { NextRequest, NextResponse } from "next/server";
import { pool } from "@halacha-ai/db";

interface CategoryFrequency {
  category: string;
  count: number;
}

const CORPUS_CATEGORIES = [
  { label: "Tanakh", pattern: "Tanakh%" },
  { label: "Talmud", pattern: "Talmud%" },
  { label: "Midrash", pattern: "Midrash%" },
  { label: "Mishnah", pattern: "Mishnah%" },
  { label: "Halakha", pattern: "%Halakh%" },
  { label: "Other", pattern: null },
];

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");

  if (!word || word.trim().length === 0) {
    return NextResponse.json({ error: "word parameter is required" }, { status: 400 });
  }

  try {
    const trimmed = word.trim();

    // Query frequency per corpus category using work column patterns
    const queries = CORPUS_CATEGORIES.filter((c) => c.pattern !== null).map((cat) =>
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM halacha_chunks
         WHERE text ILIKE $1 AND work ILIKE $2`,
        [`%${trimmed}%`, cat.pattern]
      )
    );

    // Also get total for "Other"
    const otherExclusions = CORPUS_CATEGORIES
      .filter((c) => c.pattern !== null)
      .map((_, i) => `work NOT ILIKE $${i + 2}`)
      .join(" AND ");
    const otherParams = [
      `%${trimmed}%`,
      ...CORPUS_CATEGORIES.filter((c) => c.pattern !== null).map((c) => c.pattern!),
    ];
    queries.push(
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM halacha_chunks
         WHERE text ILIKE $1 AND ${otherExclusions}`,
        otherParams
      )
    );

    const results = await Promise.all(queries);

    const frequencies: CategoryFrequency[] = CORPUS_CATEGORIES.map((cat, i) => ({
      category: cat.label,
      count: results[i]?.rows[0]?.count ?? 0,
    }));

    return NextResponse.json({ word: trimmed, frequencies });
  } catch (err) {
    console.error("Frequency lookup error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
