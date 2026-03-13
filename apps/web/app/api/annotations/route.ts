import { NextRequest, NextResponse } from "next/server";
import { getAnnotations, createAnnotation, deleteAnnotation } from "@halacha-ai/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const chunkId = searchParams.get("chunkId");
    const annotations = await getAnnotations(userId, chunkId ? parseInt(chunkId, 10) : undefined);
    return NextResponse.json({ annotations });
  } catch (err) {
    console.error("Annotations GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chunkId, type, content, highlightStart, highlightEnd, color, tags } = body;

    if (!userId || !chunkId) {
      return NextResponse.json({ error: "userId and chunkId are required" }, { status: 400 });
    }

    const annotation = await createAnnotation({
      user_id: userId,
      chunk_id: chunkId,
      annotation_type: type,
      content,
      highlight_start: highlightStart,
      highlight_end: highlightEnd,
      color,
      tags,
    });

    return NextResponse.json({ annotation });
  } catch (err) {
    console.error("Annotations POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleted = await deleteAnnotation(id);
    return NextResponse.json({ deleted });
  } catch (err) {
    console.error("Annotations DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
