import { NextRequest, NextResponse } from "next/server";
import { getStudySheets, createStudySheet } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const userId = parseInt(new URL(req.url).searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const sheets = await getStudySheets(userId);
    return NextResponse.json({ sheets });
  } catch (err) {
    console.error("Sheets GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, description } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: "userId and title are required" }, { status: 400 });
    }

    const sheet = await createStudySheet(userId, title, description);
    return NextResponse.json({ sheet });
  } catch (err) {
    console.error("Sheets POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
