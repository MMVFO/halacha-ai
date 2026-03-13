import { NextRequest, NextResponse } from "next/server";
import { getSheetItems, addSheetItem, pool } from "@halacha-ai/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheetId = parseInt(id, 10);

    // Get the sheet metadata
    const { rows: sheetRows } = await pool.query(
      `SELECT * FROM study_sheets WHERE id = $1`,
      [sheetId]
    );
    if (sheetRows.length === 0) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    // Get items with chunk data
    const { rows: items } = await pool.query(
      `SELECT si.*, c.work, c.section_ref, c.text, c.language, c.author, c.era, c.corpus_tier
       FROM study_sheet_items si
       LEFT JOIN halacha_chunks c ON c.id = si.chunk_id
       WHERE si.sheet_id = $1
       ORDER BY si.sort_order ASC, si.id ASC`,
      [sheetId]
    );

    return NextResponse.json({ sheet: sheetRows[0], items });
  } catch (err) {
    console.error("Sheet detail GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheetId = parseInt(id, 10);
    const body = await req.json();
    const { chunkId, note, sortOrder } = body;

    if (!chunkId) {
      return NextResponse.json({ error: "chunkId is required" }, { status: 400 });
    }

    const item = await addSheetItem(sheetId, chunkId, note, sortOrder);
    return NextResponse.json({ item });
  } catch (err) {
    console.error("Sheet item POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheetId = parseInt(id, 10);

    await pool.query(`DELETE FROM study_sheet_items WHERE sheet_id = $1`, [sheetId]);
    const result = await pool.query(`DELETE FROM study_sheets WHERE id = $1`, [sheetId]);

    return NextResponse.json({ deleted: (result.rowCount ?? 0) > 0 });
  } catch (err) {
    console.error("Sheet DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
