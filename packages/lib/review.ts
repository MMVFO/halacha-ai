import type { HalachaAnswer, ReviewStatus } from "@halacha-ai/db";
import { findSimilarAnswers, updateAnswerReview } from "@halacha-ai/db";
import { embedQuestion } from "./embeddings.js";

export async function findSimilarQuestions(
  question: string,
  limit: number = 5
): Promise<HalachaAnswer[]> {
  const embedding = await embedQuestion(question);
  return findSimilarAnswers(embedding, limit);
}

export async function reviewAnswer(
  answerId: number,
  data: {
    reviewStatus: ReviewStatus;
    reviewedBy: string;
    reviewNotes?: string;
    correction?: string;
  }
): Promise<HalachaAnswer | null> {
  return updateAnswerReview(answerId, {
    review_status: data.reviewStatus,
    reviewed_by: data.reviewedBy,
    review_notes: data.reviewNotes,
    correction: data.correction,
  });
}
