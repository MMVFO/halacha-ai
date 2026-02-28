import { NextRequest, NextResponse } from "next/server";
import { updateAnswerReview } from "@halacha-ai/db";
import type { ReviewStatus } from "@halacha-ai/db";

interface ReviewRequest {
  review_status: ReviewStatus;
  reviewed_by: string;
  review_notes?: string;
  correction?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const answerId = parseInt(id, 10);
    if (isNaN(answerId)) {
      return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });
    }

    const body = (await req.json()) as ReviewRequest;

    if (!body.review_status || !body.reviewed_by) {
      return NextResponse.json(
        { error: "review_status and reviewed_by are required" },
        { status: 400 }
      );
    }

    const validStatuses: ReviewStatus[] = ["unreviewed", "approved", "corrected", "rejected"];
    if (!validStatuses.includes(body.review_status)) {
      return NextResponse.json(
        { error: `Invalid review_status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateAnswerReview(answerId, {
      review_status: body.review_status,
      reviewed_by: body.reviewed_by,
      review_notes: body.review_notes,
      correction: body.correction,
    });

    if (!updated) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    return NextResponse.json({ answer: updated });
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
