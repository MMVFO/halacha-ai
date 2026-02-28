import path from "path";
import fs from "fs";
import { insertCorpus, findCorpusByName, insertChunksBatch } from "@halacha-ai/db";
import { readMergedJson, chunkResponsum, stripHtml } from "@halacha-ai/lib";
import type { Era, Community } from "@halacha-ai/db";

// Known responsa collections in Sefaria-Export with metadata
const RESPONSA_COLLECTIONS: Array<{
  dirName: string;
  workName: string;
  author: string;
  era: Era;
  community: Community;
}> = [
  {
    dirName: "Teshuvot haRashba",
    workName: "Teshuvot haRashba",
    author: "Shlomo ben Aderet",
    era: "Rishon",
    community: "Sephardi",
  },
  {
    dirName: "Teshuvot haRosh",
    workName: "Teshuvot haRosh",
    author: "Asher ben Yechiel",
    era: "Rishon",
    community: "Ashkenazi",
  },
  {
    dirName: "Teshuvot haRivash",
    workName: "Teshuvot haRivash",
    author: "Yitzchak bar Sheshet",
    era: "Rishon",
    community: "Sephardi",
  },
  {
    dirName: "Igrot Moshe",
    workName: "Igrot Moshe",
    author: "Moshe Feinstein",
    era: "Modern",
    community: "Ashkenazi",
  },
];

async function main() {
  const args = process.argv.slice(2);
  let exportPath = process.env.SEFARIA_EXPORT_PATH || "./data/Sefaria-Export";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--path" && args[i + 1]) exportPath = args[++i];
  }

  console.log(`Sefaria-Export path: ${exportPath}`);
  const responsaBase = path.join(exportPath, "json/Halakhah/Responsa");

  for (const collection of RESPONSA_COLLECTIONS) {
    console.log(`\nIngesting ${collection.workName}...`);

    const collectionPath = path.join(responsaBase, collection.dirName);
    if (!fs.existsSync(collectionPath)) {
      console.log(`  Directory not found: ${collectionPath} — skipping`);
      continue;
    }

    let corpus = await findCorpusByName(collection.workName);
    if (!corpus) {
      corpus = await insertCorpus({
        name: collection.workName,
        corpus_tier: "canonical",
        source_url: "https://github.com/Sefaria/Sefaria-Export",
        license: "CC-BY-SA",
      });
    }

    const mergedPath = path.join(collectionPath, "merged.json");
    if (!fs.existsSync(mergedPath)) {
      console.log(`  No merged.json found — skipping`);
      continue;
    }

    try {
      const data = readMergedJson(mergedPath);
      let totalChunks = 0;

      // Responsa merged.json is typically: array of teshuvot, each is array of paragraphs
      if (Array.isArray(data)) {
        for (let tIdx = 0; tIdx < (data as unknown[][]).length; tIdx++) {
          const teshuva = (data as unknown[][])[tIdx];
          if (!Array.isArray(teshuva)) continue;

          const paragraphs = teshuva
            .filter((p): p is string => typeof p === "string")
            .map(stripHtml)
            .filter((p) => p.length >= 10);

          if (paragraphs.length === 0) continue;

          const teshuvahRef = `${collection.workName} ${tIdx + 1}`;
          const chunks = chunkResponsum(
            paragraphs,
            collection.workName,
            teshuvahRef,
            corpus.id,
            {
              author: collection.author,
              era: collection.era,
              community: collection.community,
            }
          );

          if (chunks.length > 0) {
            await insertChunksBatch(chunks);
            totalChunks += chunks.length;
          }
        }
      }

      console.log(`  ${totalChunks} chunks inserted`);
    } catch (err) {
      console.error(`  Failed:`, (err as Error).message);
    }
  }

  console.log("\nDone. Run the embedding worker to generate embeddings.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
