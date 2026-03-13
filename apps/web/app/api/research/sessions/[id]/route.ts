import { NextRequest, NextResponse } from "next/server";
import { getSession, appendSessionMessage } from "@halacha-ai/db";

/**
 * GET /api/research/sessions/[id]
 * Get a single research session with its messages.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err) {
    console.error("Research session get error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/research/sessions/[id]
 * Append a message to a research session.
 * Body: { role, content, ...metadata }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    const body = await req.json();
    const { role, content, ...metadata } = body as {
      role: string;
      content: string;
      [key: string]: unknown;
    };
    if (!role || !content) {
      return NextResponse.json({ error: "role and content are required" }, { status: 400 });
    }
    const session = await appendSessionMessage(sessionId, { role, content, ...metadata });
    return NextResponse.json({ session });
  } catch (err) {
    console.error("Research session append error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
