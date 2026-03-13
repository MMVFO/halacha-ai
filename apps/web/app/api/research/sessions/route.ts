import { NextRequest, NextResponse } from "next/server";
import { createResearchSession, getResearchSessions } from "@halacha-ai/db";

/**
 * GET /api/research/sessions
 * List research sessions for a user.
 * Query params: userId (default 1)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "1", 10);
    const sessions = await getResearchSessions(userId);
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Research sessions list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/research/sessions
 * Create a new research session.
 * Body: { userId?, title?, contextWork?, contextSection? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 1, title, contextWork, contextSection } = body as {
      userId?: number;
      title?: string;
      contextWork?: string;
      contextSection?: string;
    };
    const session = await createResearchSession(userId, title, contextWork, contextSection);
    return NextResponse.json({ session });
  } catch (err) {
    console.error("Research session create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
