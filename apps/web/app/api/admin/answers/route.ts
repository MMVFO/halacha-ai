import { NextRequest, NextResponse } from "next/server";
import { getAnswers } from "@halacha-ai/db";
import type { ReviewStatus } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reviewStatus = url.searchParams.get("status") as ReviewStatus | null;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const answers = await getAnswers({
      reviewStatus: reviewStatus || undefined,
      limit: Math.min(limit, 100),
      offset,
    });

    return NextResponse.json({ answers, count: answers.length });
  } catch (err) {
    console.error("Get answers error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
