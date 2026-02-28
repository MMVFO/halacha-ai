import { Worker } from "bullmq";
import IORedis from "ioredis";
import { getChunksWithNullEmbedding, updateChunkEmbedding } from "@halacha-ai/db";
import { embedTexts } from "@halacha-ai/lib";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BATCH_SIZE = 32;

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker(
  "embed-chunks",
  async (job) => {
    const batchSize = job.data.batchSize || BATCH_SIZE;
    console.log(`[embed-chunks] Processing batch of up to ${batchSize} chunks...`);

    const chunks = await getChunksWithNullEmbedding(batchSize);
    if (chunks.length === 0) {
      console.log("[embed-chunks] No chunks with NULL embedding found.");
      return { processed: 0 };
    }

    console.log(`[embed-chunks] Found ${chunks.length} chunks to embed.`);

    const texts = chunks.map((c) => c.text);
    const embeddings = await embedTexts(texts);

    for (let i = 0; i < chunks.length; i++) {
      await updateChunkEmbedding(chunks[i].id, embeddings[i]);
    }

    console.log(`[embed-chunks] Embedded ${chunks.length} chunks.`);
    return { processed: chunks.length };
  },
  {
    connection,
    concurrency: 1,
    limiter: {
      max: 10,
      duration: 60_000, // 10 jobs per minute to respect API rate limits
    },
  }
);

worker.on("completed", (job, result) => {
  console.log(`[embed-chunks] Job ${job.id} completed: ${result.processed} chunks`);
});

worker.on("failed", (job, err) => {
  console.error(`[embed-chunks] Job ${job?.id} failed:`, err.message);
});

console.log("Embedding worker started. Listening for 'embed-chunks' jobs...");
