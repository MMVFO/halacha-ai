#!/usr/bin/env tsx
/**
 * Universal Sefaria-Export ingestion script.
 *
 * Walks the cltk-flat/ directory, reads every merged.json file,
 * parses the flat key-value structure, and inserts chunks into the database.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx ingest-sefaria.ts [options]
 *
 * Options:
 *   --path <dir>       Sefaria-Export cltk-flat path (default: env SEFARIA_EXPORT_PATH/cltk-flat)
 *   --category <name>  Only ingest a specific category (e.g., "Kabbalah", "Talmud")
 *   --dry-run          Parse and count but don't insert
 *   --batch-size <n>   Insert batch size (default: 200)
 *   --skip-existing    Skip files whose work+language corpus already has chunks
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  insertCorpus, findCorpusByName, insertChunksBatch, pool
} from "@halacha-ai/db";
import type { InsertChunk, Language } from "@halacha-ai/db";
import { stripHtml, inferMeta } from "@halacha-ai/lib";

// --- CLI args ---

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const hasFlag = (name: string) => args.includes(`--${name}`);

const SEFARIA_PATH = getArg("path") ||
  path.join(process.env.SEFARIA_EXPORT_PATH || "X:/Halacha/Sefaria-Export", "cltk-flat");
const ONLY_CATEGORY = getArg("category");
const DRY_RUN = hasFlag("dry-run");
const BATCH_SIZE = parseInt(getArg("batch-size") || "200", 10);
const SKIP_EXISTING = hasFlag("skip-existing");

// Maximum chunk text length before splitting
const MAX_CHUNK_LENGTH = 3000;

// --- Helpers ---

/**
 * Parses a Sefaria merged.json key into a human-readable section reference.
 *
 * Keys look like: "0_Introduction, 0_Chapter, 0_Paragraph"
 *                  "2_Daf, 4_Line"
 *                  "0_Part I; Likkutei Amarim, 3_Chapter, 1_Paragraph"
 *
 * The number prefix is the structural index, the text after _ is the label.
 */
function parseRefKey(key: string): { sectionRef: string; parentRef: string | null } {
  const parts = key.split(", ");
  const labels: string[] = [];

  for (const part of parts) {
    const underscoreIdx = part.indexOf("_");
    if (underscoreIdx >= 0) {
      const idx = parseInt(part.slice(0, underscoreIdx), 10);
      const label = part.slice(underscoreIdx + 1).trim();
      // Use 1-based numbering for human readability
      labels.push(`${label} ${idx + 1}`);
    } else {
      labels.push(part.trim());
    }
  }

  const sectionRef = labels.join(", ");
  const parentRef = labels.length > 1 ? labels.slice(0, -1).join(", ") : null;

  return { sectionRef, parentRef };
}

/**
 * Recursively finds all merged.json files under a directory.
 */
function findMergedFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  function walk(current: string) {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name === "merged.json") {
          results.push(full);
        }
      }
    } catch (err) {
      // Skip directories we can't read (permissions, etc.)
    }
  }

  walk(dir);
  return results;
}

/**
 * Splits long text into smaller chunks at sentence boundaries.
 */
function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Find a good split point (sentence end)
    let splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(" ", maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;

    chunks.push(remaining.slice(0, splitAt + 1).trim());
    remaining = remaining.slice(splitAt + 1).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);

  return chunks;
}

// --- Stats ---

interface Stats {
  filesProcessed: number;
  chunksInserted: number;
  chunksSkipped: number;
  errors: number;
  byCategory: Record<string, { files: number; chunks: number }>;
}

const stats: Stats = {
  filesProcessed: 0,
  chunksInserted: 0,
  chunksSkipped: 0,
  errors: 0,
  byCategory: {},
};

// --- Main ingestion ---

async function ingestFile(filePath: string, corpusId: number): Promise<number> {
  const relPath = path.relative(SEFARIA_PATH, filePath).replace(/\\/g, "/");
  const meta = inferMeta(relPath);

  // Read and parse
  let data: Record<string, unknown>;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    // Sefaria cltk-flat merged.json files have a "text" key with flat entries
    if (parsed.text && typeof parsed.text === "object" && !Array.isArray(parsed.text)) {
      data = parsed.text;
    } else if (typeof parsed === "object" && !Array.isArray(parsed)) {
      // Some files might be flat objects directly
      data = parsed;
    } else {
      // Legacy nested array format — flatten it
      data = flattenNestedArray(parsed, "");
      if (Object.keys(data).length === 0) return 0;
    }
  } catch (err) {
    console.error(`  ✗ Parse error: ${relPath}`, err instanceof Error ? err.message : err);
    stats.errors++;
    return 0;
  }

  // Build chunks
  const chunks: InsertChunk[] = [];
  const entries = Object.entries(data);

  for (const [key, value] of entries) {
    if (typeof value !== "string" || !value.trim()) continue;

    const text = stripHtml(value);
    if (text.length < 5) continue;

    const { sectionRef, parentRef } = parseRefKey(key);
    const fullRef = `${meta.work}, ${sectionRef}`;
    const fullParent = parentRef ? `${meta.work}, ${parentRef}` : meta.work;

    // Split if too long
    const textParts = splitText(text, MAX_CHUNK_LENGTH);

    for (let i = 0; i < textParts.length; i++) {
      const ref = textParts.length > 1 ? `${fullRef} [${i + 1}/${textParts.length}]` : fullRef;

      chunks.push({
        corpus_id: corpusId,
        work: meta.work,
        section_ref: ref,
        parent_ref: fullParent,
        language: meta.language,
        text: textParts[i],
        author: meta.author ?? null,
        era: meta.era,
        community: meta.community,
        authority_weight: meta.authorityWeight,
        corpus_tier: meta.corpusTier,
        tags: meta.tags,
        topics: [],
      });
    }
  }

  if (chunks.length === 0) return 0;

  if (DRY_RUN) {
    return chunks.length;
  }

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    try {
      inserted += await insertChunksBatch(batch);
    } catch (err) {
      console.error(`  ✗ Insert error (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${relPath}`,
        err instanceof Error ? err.message : err);
      stats.errors++;
    }
  }

  return inserted;
}

/**
 * Flatten nested arrays (legacy format) into flat key-value pairs.
 */
function flattenNestedArray(data: unknown, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (typeof data === "string") {
    result[prefix || "0_Text"] = data;
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const newPrefix = prefix ? `${prefix}, ${i}_Item` : `${i}_Item`;
      const sub = flattenNestedArray(data[i], newPrefix);
      Object.assign(result, sub);
    }
  }

  return result;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Sefaria-Export Universal Ingestion Pipeline");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Source:     ${SEFARIA_PATH}`);
  console.log(`  Category:   ${ONLY_CATEGORY || "ALL"}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Dry run:    ${DRY_RUN}`);
  console.log(`  Skip exist: ${SKIP_EXISTING}`);
  console.log("═══════════════════════════════════════════════════════\n");

  if (!fs.existsSync(SEFARIA_PATH)) {
    console.error(`✗ Path not found: ${SEFARIA_PATH}`);
    process.exit(1);
  }

  // Get or create corpus
  let corpus = await findCorpusByName("Sefaria-Export");
  if (!corpus) {
    if (DRY_RUN) {
      console.log("[DRY RUN] Would create corpus 'Sefaria-Export'");
    } else {
      corpus = await insertCorpus({
        name: "Sefaria-Export",
        corpus_tier: "canonical",
        source_url: "https://github.com/Sefaria/Sefaria-Export",
        license: "CC-BY-SA",
      });
      console.log(`✓ Created corpus: Sefaria-Export (id: ${corpus.id})\n`);
    }
  } else {
    console.log(`✓ Using existing corpus: Sefaria-Export (id: ${corpus.id})\n`);
  }
  const corpusId = corpus?.id ?? 0;

  // Get categories to process
  let categories: string[];
  if (ONLY_CATEGORY) {
    categories = [ONLY_CATEGORY];
  } else {
    categories = fs.readdirSync(SEFARIA_PATH, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  }

  console.log(`Processing ${categories.length} categories...\n`);

  for (const category of categories) {
    const catPath = path.join(SEFARIA_PATH, category);
    if (!fs.existsSync(catPath)) {
      console.log(`⚠ Category not found: ${category}`);
      continue;
    }

    const mergedFiles = findMergedFiles(catPath);
    console.log(`\n▸ ${category} — ${mergedFiles.length} merged.json files`);

    stats.byCategory[category] = { files: 0, chunks: 0 };
    let catChunks = 0;

    for (let i = 0; i < mergedFiles.length; i++) {
      const file = mergedFiles[i];
      const relPath = path.relative(SEFARIA_PATH, file).replace(/\\/g, "/");

      // Progress indicator every 50 files
      if ((i + 1) % 50 === 0 || i === mergedFiles.length - 1) {
        process.stdout.write(`\r  [${i + 1}/${mergedFiles.length}] ${catChunks} chunks...`);
      }

      try {
        const count = await ingestFile(file, corpusId);
        catChunks += count;
        stats.chunksInserted += count;
        stats.filesProcessed++;
        stats.byCategory[category].files++;
        stats.byCategory[category].chunks += count;
      } catch (err) {
        console.error(`\n  ✗ Error: ${relPath}`, err instanceof Error ? err.message : err);
        stats.errors++;
      }
    }

    console.log(`\n  ✓ ${category}: ${stats.byCategory[category].files} files → ${catChunks} chunks`);
  }

  // Final report
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("  INGESTION COMPLETE");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Files processed:  ${stats.filesProcessed}`);
  console.log(`  Chunks inserted:  ${stats.chunksInserted}`);
  console.log(`  Errors:           ${stats.errors}`);
  console.log("───────────────────────────────────────────────────────");

  for (const [cat, s] of Object.entries(stats.byCategory).sort()) {
    console.log(`  ${cat.padEnd(20)} ${s.files.toString().padStart(5)} files → ${s.chunks.toString().padStart(7)} chunks`);
  }

  console.log("═══════════════════════════════════════════════════════\n");

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
