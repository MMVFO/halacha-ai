import { NextRequest, NextResponse } from "next/server";

interface SavedLayout {
  id: string;
  name: string;
  panes: { work: string; section: string }[];
  createdAt: string;
}

// In-memory store for layouts (in production, use DB)
const layoutStore = new Map<number, SavedLayout[]>();

export async function GET(req: NextRequest) {
  try {
    const userId = parseInt(new URL(req.url).searchParams.get("userId") || "0", 10);
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const layouts = layoutStore.get(userId) || [];
    return NextResponse.json({ layouts });
  } catch (err) {
    console.error("Layouts GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, panes } = body;

    if (!userId || !name || !Array.isArray(panes)) {
      return NextResponse.json(
        { error: "userId, name, and panes are required" },
        { status: 400 }
      );
    }

    const layout: SavedLayout = {
      id: `layout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      panes,
      createdAt: new Date().toISOString(),
    };

    const existing = layoutStore.get(userId) || [];
    existing.push(layout);
    layoutStore.set(userId, existing);

    return NextResponse.json({ layout });
  } catch (err) {
    console.error("Layouts POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    const layoutId = searchParams.get("id");

    if (!userId || !layoutId) {
      return NextResponse.json({ error: "userId and id are required" }, { status: 400 });
    }

    const existing = layoutStore.get(userId) || [];
    const filtered = existing.filter((l) => l.id !== layoutId);
    layoutStore.set(userId, filtered);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Layouts DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
