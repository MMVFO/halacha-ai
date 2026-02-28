import path from "path";
import fs from "fs";
import { insertCorpus, findCorpusByName, insertChunksBatch } from "@halacha-ai/db";
import { readMergedJson, chunkApocrypha, findMergedFiles } from "@halacha-ai/lib";
import type { CorpusTier } from "@halacha-ai/db";

// Known Second Temple / Apocrypha works in Sefaria-Export
// These paths are relative to Sefaria-Export root.
// Adjust as needed based on actual Sefaria-Export directory structure.
const APOCRYPHA_WORKS: Array<{
  dirPath: string;
  workName: string;
  corpusTier: 'apocrypha' | 'pseudepigrapha';
}> = [
  {
    dirPath: "json/Second Temple/Apocrypha/I Maccabees",
    workName: "I Maccabees",
    corpusTier: "apocrypha",
  },
  {
    dirPath: "json/Second Temple/Apocrypha/II Maccabees",
    workName: "II Maccabees",
    corpusTier: "apocrypha",
  },
  {
    dirPath: "json/Second Temple/Apocrypha/Tobit",
    workName: "Tobit",
    corpusTier: "apocrypha",
  },
  {
    dirPath: "json/Second Temple/Apocrypha/Judith",
    workName: "Judith",
    corpusTier: "apocrypha",
  },
  {
    dirPath: "json/Second Temple/Apocrypha/Ben Sira",
    workName: "Ben Sira",
    corpusTier: "apocrypha",
  },
  {
    dirPath: "json/Second Temple/Apocrypha/Baruch",
    workName: "Baruch",
    corpusTier: "apocrypha",
  },
  // Pseudepigrapha — Sefaria may not have all of these; stubs for when data is available
  {
    dirPath: "json/Second Temple/Pseudepigrapha/I Enoch",
    workName: "I Enoch",
    corpusTier: "pseudepigrapha",
  },
  {
    dirPath: "json/Second Temple/Pseudepigrapha/Jubilees",
    workName: "Jubilees",
    corpusTier: "pseudepigrapha",
  },
];

async function main() {
  const args = process.argv.slice(2);
  let exportPath = process.env.SEFARIA_EXPORT_PATH || "./data/Sefaria-Export";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--path" && args[i + 1]) exportPath = args[++i];
  }

  console.log(`Sefaria-Export path: ${exportPath}`);

  for (const work of APOCRYPHA_WORKS) {
    console.log(`\nIngesting ${work.workName} (${work.corpusTier})...`);

    const workPath = path.join(exportPath, work.dirPath);
    if (!fs.existsSync(workPath)) {
      console.log(`  Directory not found: ${workPath} — skipping`);
      console.log(`  (This is expected if the text isn't in your Sefaria-Export copy)`);
      continue;
    }

    const mergedPath = path.join(workPath, "merged.json");
    if (!fs.existsSync(mergedPath)) {
      // Try finding merged files in subdirectories
      const found = findMergedFiles(workPath);
      if (found.length === 0) {
        console.log(`  No merged.json found — skipping`);
        continue;
      }
      console.log(`  Found ${found.length} merged files in subdirectories`);
    }

    let corpus = await findCorpusByName(work.workName);
    if (!corpus) {
      corpus = await insertCorpus({
        name: work.workName,
        corpus_tier: work.corpusTier as CorpusTier,
        source_url: "https://github.com/Sefaria/Sefaria-Export",
        license: "Public Domain",
      });
    }

    try {
      const data = readMergedJson(
        fs.existsSync(mergedPath) ? mergedPath : findMergedFiles(workPath)[0]
      ) as string[][];

      const chunks = chunkApocrypha(data, work.workName, corpus.id, {
        corpusTier: work.corpusTier,
        community: "General",
        language: "en",
      });

      if (chunks.length > 0) {
        const count = await insertChunksBatch(chunks);
        console.log(`  ${count} chunks inserted (authority_weight=0.0)`);
      } else {
        console.log(`  No chunks extracted — data format may differ`);
      }
    } catch (err) {
      console.error(`  Failed:`, (err as Error).message);
    }
  }

  console.log("\nDone. Run the embedding worker to generate embeddings.");
  console.log("REMINDER: All non-canonical chunks have authority_weight=0.0 and will be clearly labeled in search results.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
