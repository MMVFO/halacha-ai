import { NextRequest, NextResponse } from "next/server";
import { getStudyProgress, updateStudyProgress } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const work = searchParams.get("work") ?? undefined;
    const progress = await getStudyProgress(userId, work);
    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, work, totalSections, completedSections, lastSectionRef } = body;

    if (!userId || !work || totalSections == null || completedSections == null || !lastSectionRef) {
      return NextResponse.json(
        { error: "userId, work, totalSections, completedSections, and lastSectionRef are required" },
        { status: 400 }
      );
    }

    const progress = await updateStudyProgress(userId, work, totalSections, completedSections, lastSectionRef);
    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
