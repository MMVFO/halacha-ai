/**
 * Jastrow Dictionary Ingestion Script
 *
 * Ingests entries from Marcus Jastrow's "Dictionary of the Targumim,
 * the Talmud Babli and Yerushalmi, and the Midrashic Literature" (1903).
 * This work is in the public domain.
 *
 * DATA SOURCES:
 * - Sefaria's Jastrow data: https://github.com/Sefaria/Sefaria-Export
 *   Path: json/Lexicon/Jastrow/
 *   Format: JSON files with entries containing "headword", "content", etc.
 *
 * - Open Jastrow project: https://github.com/open-jastrow/jastrow
 *   Alternative structured JSON source.
 *
 * EXPECTED INPUT FORMAT (one entry per JSON object in an array):
 * [
 *   {
 *     "headword": "\u05D0\u05B7\u05D1",           // The dictionary headword in Hebrew/Aramaic
 *     "headword_normalized": "\u05D0\u05D1",    // Without niqqud
 *     "content": "father ...",           // The definition text
 *     "root": "\u05D0\u05D1",                   // Shoresh (root), if identifiable
 *     "part_of_speech": "noun",          // noun, verb, adj, adv, etc.
 *     "language": "arc"                  // "arc" (Aramaic) or "he" (Hebrew)
 *   },
 *   ...
 * ]
 *
 * USAGE:
 *   npx tsx scripts/ingest-jastrow.ts --path ./data/jastrow-entries.json
 *
 * The --path flag should point to a JSON file in the format above.
 */

import fs from "fs";
import { insertDictionaryBatch } from "@halacha-ai/db";
import type { InsertDictionaryEntry } from "@halacha-ai/db";

interface RawJastrowEntry {
  headword: string;
  headword_normalized?: string;
  content: string;
  root?: string;
  part_of_speech?: string;
  language?: string;
}

function stripNiqqud(text: string): string {
  // Remove Hebrew niqqud (vowel marks) U+0591-U+05BD, U+05BF-U+05C7
  return text.replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "");
}

function parseArgs(): { path: string } {
  const args = process.argv.slice(2);
  let path = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--path" && args[i + 1]) {
      path = args[i + 1];
      break;
    }
  }
  if (!path) {
    console.error("Usage: npx tsx scripts/ingest-jastrow.ts --path <json-file>");
    console.error("");
    console.error("The JSON file should be an array of objects with:");
    console.error("  headword, content, root?, part_of_speech?, language?");
    process.exit(1);
  }
  return { path };
}

async function main() {
  const { path } = parseArgs();

  console.log(`Reading Jastrow data from: ${path}`);
  const raw = fs.readFileSync(path, "utf-8");
  const entries: RawJastrowEntry[] = JSON.parse(raw);
  console.log(`Parsed ${entries.length} entries`);

  // Transform into InsertDictionaryEntry format
  const BATCH_SIZE = 500;
  let totalInserted = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const dbEntries: InsertDictionaryEntry[] = batch
      .filter((e) => e.headword && e.content)
      .map((e) => ({
        word: e.headword,
        word_normalized: e.headword_normalized || stripNiqqud(e.headword),
        language: e.language || "arc",
        definition: e.content,
        root: e.root || undefined,
        part_of_speech: e.part_of_speech || undefined,
        source: "jastrow",
      }));

    const count = await insertDictionaryBatch(dbEntries);
    totalInserted += count;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${count} entries (total: ${totalInserted})`);
  }

  console.log(`\nDone. Inserted ${totalInserted} Jastrow dictionary entries.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
