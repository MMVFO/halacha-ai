import { NextRequest, NextResponse } from "next/server";

// In-memory store for reading time (in production, use DB)
const readingTimeStore = new Map<string, { work: string; section: string; totalSeconds: number; lastUpdated: string }>();

function makeKey(userId: number, work: string, section: string) {
  return `${userId}:${work}:${section}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const work = searchParams.get("work");
    const entries: { work: string; section: string; totalSeconds: number; lastUpdated: string }[] = [];

    for (const [key, val] of readingTimeStore.entries()) {
      if (key.startsWith(`${userId}:`)) {
        if (work && val.work !== work) continue;
        entries.push(val);
      }
    }

    // Compute summary
    const totalSeconds = entries.reduce((sum, e) => sum + e.totalSeconds, 0);
    const byWork = new Map<string, number>();
    for (const e of entries) {
      byWork.set(e.work, (byWork.get(e.work) || 0) + e.totalSeconds);
    }

    return NextResponse.json({
      entries,
      summary: {
        totalSeconds,
        byWork: Object.fromEntries(byWork),
        sessionCount: entries.length,
      },
    });
  } catch (err) {
    console.error("Reading time GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, work, section, timeSeconds } = body;

    if (!userId || !work || !section || typeof timeSeconds !== "number") {
      return NextResponse.json(
        { error: "userId, work, section, and timeSeconds are required" },
        { status: 400 }
      );
    }

    const key = makeKey(userId, work, section);
    const existing = readingTimeStore.get(key);

    if (existing) {
      existing.totalSeconds += timeSeconds;
      existing.lastUpdated = new Date().toISOString();
      readingTimeStore.set(key, existing);
    } else {
      readingTimeStore.set(key, {
        work,
        section,
        totalSeconds: timeSeconds,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      recorded: readingTimeStore.get(key),
    });
  } catch (err) {
    console.error("Reading time POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
