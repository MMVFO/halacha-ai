import { NextRequest, NextResponse } from "next/server";
import { getBookmarks, toggleBookmark, pool } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const userId = parseInt(new URL(req.url).searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Join with halacha_chunks to get chunk data
    const { rows } = await pool.query(
      `SELECT b.*, c.work, c.section_ref, c.text, c.language, c.author, c.era, c.corpus_tier
       FROM bookmarks b
       JOIN halacha_chunks c ON c.id = b.chunk_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ bookmarks: rows });
  } catch (err) {
    console.error("Bookmarks GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chunkId, label, color } = body;

    if (!userId || !chunkId) {
      return NextResponse.json({ error: "userId and chunkId are required" }, { status: 400 });
    }

    const result = await toggleBookmark(userId, chunkId, label, color);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Bookmarks POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
