/**
 * Import Sefaria cross-reference links into text_links table.
 *
 * Usage:
 *   pnpm tsx scripts/import-sefaria-links.ts --path /path/to/Sefaria-Export/links
 *
 * Each file in the links/ directory is a JSON array of link objects:
 *   { refs: [string, string], type: string, ... }
 *
 * We insert them into text_links using insertTextLinksBatch.
 */

import fs from "fs";
import path from "path";
import { insertTextLinksBatch } from "@halacha-ai/db";
import type { InsertTextLink } from "@halacha-ai/db";

const BATCH_SIZE = 1000;

function parseArgs(): { linksPath: string } {
  const args = process.argv.slice(2);
  const pathIdx = args.indexOf("--path");
  if (pathIdx === -1 || !args[pathIdx + 1]) {
    console.error("Usage: pnpm tsx scripts/import-sefaria-links.ts --path /path/to/Sefaria-Export/links");
    process.exit(1);
  }
  return { linksPath: args[pathIdx + 1] };
}

function extractWorkFromRef(ref: string): string | undefined {
  // Sefaria refs look like "Genesis 1:1" or "Rashi on Genesis 1:1"
  // Work is everything before the first digit cluster
  const match = ref.match(/^(.+?)\s+\d/);
  return match ? match[1].trim() : undefined;
}

async function processFile(filePath: string): Promise<number> {
  const raw = fs.readFileSync(filePath, "utf-8");
  let links: { refs: string[]; type?: string }[];

  try {
    links = JSON.parse(raw);
  } catch {
    console.warn(`  Skipping ${path.basename(filePath)}: invalid JSON`);
    return 0;
  }

  if (!Array.isArray(links)) return 0;

  let inserted = 0;
  const batch: InsertTextLink[] = [];

  for (const link of links) {
    if (!link.refs || link.refs.length < 2) continue;

    const [sourceRef, targetRef] = link.refs;
    const linkType = link.type || "reference";

    batch.push({
      source_ref: sourceRef,
      target_ref: targetRef,
      link_type: linkType.toLowerCase(),
      source_work: extractWorkFromRef(sourceRef),
      target_work: extractWorkFromRef(targetRef),
    });

    if (batch.length >= BATCH_SIZE) {
      inserted += await insertTextLinksBatch(batch.splice(0));
    }
  }

  if (batch.length > 0) {
    inserted += await insertTextLinksBatch(batch);
  }

  return inserted;
}

async function main() {
  const { linksPath } = parseArgs();

  if (!fs.existsSync(linksPath)) {
    console.error(`Directory not found: ${linksPath}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(linksPath)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Found ${files.length} link files in ${linksPath}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log("");

  let totalInserted = 0;
  let filesProcessed = 0;

  for (const file of files) {
    const filePath = path.join(linksPath, file);
    const count = await processFile(filePath);
    totalInserted += count;
    filesProcessed++;

    if (filesProcessed % 50 === 0 || count > 0) {
      console.log(
        `[${filesProcessed}/${files.length}] ${file}: ${count} links inserted (total: ${totalInserted.toLocaleString()})`,
      );
    }
  }

  console.log("");
  console.log(`Done. Files processed: ${filesProcessed}, Total links inserted: ${totalInserted.toLocaleString()}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
