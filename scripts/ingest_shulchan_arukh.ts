import path from "path";
import { insertCorpus, findCorpusByName, insertChunksBatch } from "@halacha-ai/db";
import {
  readMergedJson, chunkShulchanArukh, chunkRema,
  SA_SECTIONS, type ShulchanArukhSection,
} from "@halacha-ai/lib";

// Sefaria-Export paths for Shulchan Arukh sections
// Adjust these if your Sefaria-Export has a different directory structure.
const SA_SEFARIA_PATHS: Record<string, { mechaber: string; rema: string }> = {
  OC: {
    mechaber: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Orach Chayyim",
    rema: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Orach Chayyim/Rema on Shulchan Arukh, Orach Chayyim",
  },
  YD: {
    mechaber: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Yoreh De'ah",
    rema: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Yoreh De'ah/Rema on Shulchan Arukh, Yoreh De'ah",
  },
  EH: {
    mechaber: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Even HaEzer",
    rema: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Even HaEzer/Rema on Shulchan Arukh, Even HaEzer",
  },
  CM: {
    mechaber: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Choshen Mishpat",
    rema: "json/Halakhah/Shulchan Arukh/Shulchan Arukh, Choshen Mishpat/Rema on Shulchan Arukh, Choshen Mishpat",
  },
};

async function main() {
  const args = process.argv.slice(2);
  let exportPath = process.env.SEFARIA_EXPORT_PATH || "./data/Sefaria-Export";
  let sectionFilter: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--path" && args[i + 1]) exportPath = args[++i];
    if (args[i] === "--section" && args[i + 1]) sectionFilter = args[++i].toUpperCase();
  }

  console.log(`Sefaria-Export path: ${exportPath}`);

  const sections = sectionFilter
    ? SA_SECTIONS.filter((s) => s.prefix === sectionFilter)
    : SA_SECTIONS;

  for (const section of sections) {
    console.log(`\nIngesting ${section.fullName}...`);
    const paths = SA_SEFARIA_PATHS[section.prefix];

    // --- Mechaber (Shulchan Arukh base text) ---
    const mechaberPath = path.join(exportPath, paths.mechaber, "merged.json");
    let corpus = await findCorpusByName(section.fullName);
    if (!corpus) {
      corpus = await insertCorpus({
        name: section.fullName,
        corpus_tier: "canonical",
        source_url: "https://github.com/Sefaria/Sefaria-Export",
        license: "CC-BY-SA",
      });
    }

    try {
      const data = readMergedJson(mechaberPath) as string[][];
      const chunks = chunkShulchanArukh(data, section, corpus.id);
      const count = await insertChunksBatch(chunks);
      console.log(`  Mechaber: ${count} chunks inserted`);
    } catch (err) {
      console.error(`  Mechaber: Failed to read ${mechaberPath}`, (err as Error).message);
    }

    // --- Rema ---
    const remaPath = path.join(exportPath, paths.rema, "merged.json");
    const remaWorkName = `Rema on ${section.fullName}`;
    let remaCorpus = await findCorpusByName(remaWorkName);
    if (!remaCorpus) {
      remaCorpus = await insertCorpus({
        name: remaWorkName,
        corpus_tier: "canonical",
        source_url: "https://github.com/Sefaria/Sefaria-Export",
        license: "CC-BY-SA",
      });
    }

    try {
      const remaData = readMergedJson(remaPath) as string[][];
      const remaChunks = chunkRema(remaData, section, remaCorpus.id);
      const remaCount = await insertChunksBatch(remaChunks);
      console.log(`  Rema: ${remaCount} chunks inserted`);
    } catch (err) {
      console.error(`  Rema: Failed to read ${remaPath}`, (err as Error).message);
    }
  }

  console.log("\nDone. Run the embedding worker to generate embeddings.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
