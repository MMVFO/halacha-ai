import { NextRequest, NextResponse } from "next/server";
import { getReadingHistory, recordReading } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const userId = parseInt(new URL(req.url).searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const history = await getReadingHistory(userId, 50);
    return NextResponse.json({ history });
  } catch (err) {
    console.error("History GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, work, sectionRef, timeSpentSeconds } = body;

    if (!userId || !work || !sectionRef) {
      return NextResponse.json({ error: "userId, work, and sectionRef are required" }, { status: 400 });
    }

    const entry = await recordReading(userId, work, sectionRef, timeSpentSeconds || 0);
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("History POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
