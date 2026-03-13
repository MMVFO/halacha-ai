import { NextRequest, NextResponse } from "next/server";

/**
 * Search history API — stores recent searches in a simple in-memory store.
 * In production this would use a database table or Redis, but for now
 * we use a server-side Map keyed by a session/user token cookie.
 *
 * GET  /api/search/history         — retrieve recent searches
 * POST /api/search/history         — save a search { query, filters }
 * DELETE /api/search/history       — clear all history
 */

interface HistoryEntry {
  query: string;
  filters?: Record<string, string>;
  resultCount?: number;
  timestamp: number;
}

// In-memory store keyed by session token (simple approach)
const historyStore = new Map<string, HistoryEntry[]>();
const MAX_HISTORY = 20;

function getSessionKey(req: NextRequest): string {
  // Use a cookie or fallback to a default key
  const cookie = req.cookies.get("halacha-session");
  return cookie?.value || "default";
}

export async function GET(req: NextRequest) {
  const key = getSessionKey(req);
  const history = historyStore.get(key) || [];
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, filters, resultCount } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 },
      );
    }

    const key = getSessionKey(req);
    const history = historyStore.get(key) || [];

    // Remove duplicate if same query exists
    const filtered = history.filter(
      (h) => h.query.toLowerCase() !== query.trim().toLowerCase(),
    );

    // Add new entry at the front
    filtered.unshift({
      query: query.trim(),
      filters: filters || undefined,
      resultCount: resultCount ?? undefined,
      timestamp: Date.now(),
    });

    // Trim to max
    const trimmed = filtered.slice(0, MAX_HISTORY);
    historyStore.set(key, trimmed);

    return NextResponse.json({ ok: true, history: trimmed });
  } catch (err) {
    console.error("Search history POST error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const key = getSessionKey(req);
  historyStore.delete(key);
  return NextResponse.json({ ok: true, history: [] });
}
