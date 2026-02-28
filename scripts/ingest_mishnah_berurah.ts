import path from "path";
import { insertCorpus, findCorpusByName, insertChunksBatch } from "@halacha-ai/db";
import { readMergedJson, chunkCommentary, SA_SECTIONS } from "@halacha-ai/lib";

// Sefaria-Export path for Mishnah Berurah (commentary on SA OC)
const MB_SEFARIA_PATH = "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Orach Chayyim/Commentary/Mishnah Berurah";

async function main() {
  const args = process.argv.slice(2);
  let exportPath = process.env.SEFARIA_EXPORT_PATH || "./data/Sefaria-Export";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--path" && args[i + 1]) exportPath = args[++i];
  }

  console.log(`Sefaria-Export path: ${exportPath}`);

  const section = SA_SECTIONS.find((s) => s.prefix === "OC")!;
  const workName = "Mishnah Berurah";
  const mergedPath = path.join(exportPath, MB_SEFARIA_PATH, "merged.json");

  let corpus = await findCorpusByName(workName);
  if (!corpus) {
    corpus = await insertCorpus({
      name: workName,
      corpus_tier: "canonical",
      source_url: "https://github.com/Sefaria/Sefaria-Export",
      license: "CC-BY-SA",
    });
  }

  console.log(`Ingesting ${workName}...`);

  try {
    const data = readMergedJson(mergedPath) as string[][];
    const chunks = chunkCommentary(data, workName, section, corpus.id, {
      author: "Yisrael Meir Kagan",
      era: "Acharon",
      community: "Ashkenazi",
      tags: ["mishnah_berurah", "chofetz_chaim"],
    });
    const count = await insertChunksBatch(chunks);
    console.log(`  ${count} chunks inserted`);
  } catch (err) {
    console.error(`  Failed to read ${mergedPath}`, (err as Error).message);
    console.error("  Check that the Sefaria-Export path is correct and contains the Mishnah Berurah directory.");
  }

  console.log("\nDone. Run the embedding worker to generate embeddings.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
