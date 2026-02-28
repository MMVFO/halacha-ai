import { Queue } from "bullmq";
import IORedis from "ioredis";
import { countNullEmbeddings } from "@halacha-ai/db";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BATCH_SIZE = 32;

async function main() {
  const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  const queue = new Queue("embed-chunks", { connection });

  const nullCount = await countNullEmbeddings();
  console.log(`Found ${nullCount} chunks with NULL embeddings.`);

  if (nullCount === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  const jobCount = Math.ceil(nullCount / BATCH_SIZE);
  console.log(`Enqueuing ${jobCount} jobs (batch size: ${BATCH_SIZE})...`);

  for (let i = 0; i < jobCount; i++) {
    await queue.add("embed-batch", { batchSize: BATCH_SIZE }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  }

  console.log(`Done. ${jobCount} jobs enqueued.`);
  await connection.quit();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
