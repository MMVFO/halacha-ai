#!/usr/bin/env tsx
/**
 * Otzaria library ingestion script.
 *
 * Walks the Otzaria אוצריא/ directory, reads TXT files with HTML-like markup,
 * parses them into chunks, and inserts into the database.
 *
 * Otzaria TXT format:
 *   <h1>Book Title</h1>      → work name
 *   Author line (after h1)   → author
 *   <h2>Section</h2>         → section_ref boundary
 *   <b>Start</b> text...     → paragraph start marker
 *   Plain text paragraphs    → chunk content
 *
 * Usage:
 *   DATABASE_URL=... npx tsx ingest-otzaria.ts [options]
 *
 * Options:
 *   --path <dir>       Otzaria library path (default: X:/Halacha/Otzaria/אוצריא)
 *   --category <name>  Hebrew category name (e.g., "קבלה", "חסידות")
 *   --dry-run          Parse and count but don't insert
 *   --batch-size <n>   Insert batch size (default: 200)
 *   --metadata <path>  Path to metadata.json (default: X:/Halacha/Otzaria/metadata.json)
 */

import fs from "fs";
import path from "path";
import {
  insertCorpus, findCorpusByName, insertChunksBatch, pool,
} from "@halacha-ai/db";
import type { InsertChunk, Era, Community, CorpusTier, Language } from "@halacha-ai/db";

// --- CLI args ---

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const OTZARIA_PATH = getArg("path") || "X:/Halacha/Otzaria/אוצריא";
const ONLY_CATEGORY = getArg("category");
const DRY_RUN = hasFlag("dry-run");
const BATCH_SIZE = parseInt(getArg("batch-size") || "200", 10);
const METADATA_PATH = getArg("metadata") || "X:/Halacha/Otzaria/metadata.json";

const MAX_CHUNK_LENGTH = 3000;
const MIN_CHUNK_LENGTH = 20;

// --- Hebrew category → English metadata mapping ---

interface CategoryMeta {
  englishName: string;
  era: Era;
  community: Community;
  corpusTier: CorpusTier;
  tags: string[];
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  "הלכה": { englishName: "Halakhah", era: "Acharon", community: "General", corpusTier: "canonical", tags: ["halakhah"] },
  "תלמוד בבלי": { englishName: "Talmud Bavli", era: "Amora", community: "General", corpusTier: "canonical", tags: ["talmud", "bavli"] },
  "תלמוד ירושלמי": { englishName: "Talmud Yerushalmi", era: "Amora", community: "General", corpusTier: "canonical", tags: ["talmud", "yerushalmi"] },
  "משנה": { englishName: "Mishnah", era: "Tanna", community: "General", corpusTier: "canonical", tags: ["mishnah"] },
  "תוספתא": { englishName: "Tosefta", era: "Tanna", community: "General", corpusTier: "canonical", tags: ["tosefta"] },
  "תנך": { englishName: "Tanakh", era: "Tanna", community: "General", corpusTier: "canonical", tags: ["tanakh"] },
  "מדרש": { englishName: "Midrash", era: "Amora", community: "General", corpusTier: "canonical", tags: ["midrash"] },
  "קבלה": { englishName: "Kabbalah", era: "Rishon", community: "General", corpusTier: "canonical", tags: ["kabbalah", "mysticism"] },
  "חסידות": { englishName: "Chasidut", era: "Acharon", community: "Chassidic", corpusTier: "canonical", tags: ["chasidut"] },
  "ספרי מוסר": { englishName: "Musar", era: "Acharon", community: "General", corpusTier: "canonical", tags: ["musar"] },
  "מחשבת ישראל": { englishName: "Jewish Thought", era: "Rishon", community: "General", corpusTier: "canonical", tags: ["machshava"] },
  "סדר התפילה": { englishName: "Liturgy", era: "Gaon", community: "General", corpusTier: "canonical", tags: ["liturgy"] },
  "שות": { englishName: "Responsa", era: "Acharon", community: "General", corpusTier: "canonical", tags: ["responsa"] },
  "ספרות עזר": { englishName: "Reference", era: "Modern", community: "General", corpusTier: "academic", tags: ["reference"] },
  "אודות התוכנה": { englishName: "About", era: "Modern", community: "General", corpusTier: "academic", tags: ["meta"] },
};

// --- Metadata ---

interface OtzariaMeta {
  title: string;
  author?: string;
  pubDate?: string;
  compDate?: string;
  heDesc?: string;
}

let metadataMap: Map<string, OtzariaMeta> = new Map();

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    console.log("⚠ No metadata.json found, proceeding without author info");
    return;
  }
  try {
    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    const entries: OtzariaMeta[] = JSON.parse(raw);
    for (const entry of entries) {
      if (entry.title) {
        metadataMap.set(entry.title.trim(), entry);
      }
    }
    console.log(`✓ Loaded metadata for ${metadataMap.size} works`);
  } catch (err) {
    console.error("⚠ Failed to parse metadata.json:", err);
  }
}

// --- TXT parser ---

interface ParsedSection {
  heading: string;
  paragraphs: string[];
}

interface ParsedBook {
  title: string;
  authorLine: string | null;
  sections: ParsedSection[];
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function parseOtzariaTxt(content: string): ParsedBook {
  const lines = content.split("\n");
  let title = "";
  let authorLine: string | null = null;
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { heading: "", paragraphs: [] };
  let titleFound = false;
  let authorFound = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Extract <h1> title
    const h1Match = line.match(/<h1>(.*?)<\/h1>/);
    if (h1Match) {
      title = stripHtml(h1Match[1]);
      titleFound = true;
      continue;
    }

    // Line right after title is typically the author
    if (titleFound && !authorFound && !line.startsWith("<h")) {
      authorLine = stripHtml(line);
      authorFound = true;
      continue;
    }

    // <h2> section headings
    const h2Match = line.match(/<h2>(.*?)<\/h2>/);
    if (h2Match) {
      // Save previous section if it has content
      if (currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: stripHtml(h2Match[1]), paragraphs: [] };
      continue;
    }

    // <h3>, <h4> etc. — treat as sub-section markers within current section
    const hMatch = line.match(/<h[3-6]>(.*?)<\/h[3-6]>/);
    if (hMatch) {
      // Add as a labeled paragraph
      const subHeading = stripHtml(hMatch[1]);
      currentSection.paragraphs.push(`[${subHeading}]`);
      continue;
    }

    // Regular text line (may contain <b> markers)
    const text = stripHtml(line);
    if (text.length >= MIN_CHUNK_LENGTH) {
      currentSection.paragraphs.push(text);
    }
  }

  // Push last section
  if (currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }

  return { title, authorLine, sections };
}

// --- Chunking ---

function splitLongText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(" ", maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt + 1).trim());
    remaining = remaining.slice(splitAt + 1).trim();
  }
  if (remaining.length >= MIN_CHUNK_LENGTH) chunks.push(remaining);
  return chunks;
}

// --- Stats ---

interface Stats {
  filesProcessed: number;
  chunksInserted: number;
  errors: number;
  byCategory: Record<string, { files: number; chunks: number }>;
}

const stats: Stats = { filesProcessed: 0, chunksInserted: 0, errors: 0, byCategory: {} };

// --- File finder ---

function findTxtFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  function walk(current: string) {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.endsWith(".txt")) {
          results.push(full);
        }
      }
    } catch { /* skip unreadable dirs */ }
  }
  walk(dir);
  return results;
}

// --- Ingestion ---

async function ingestFile(
  filePath: string,
  corpusId: number,
  categoryMeta: CategoryMeta,
): Promise<number> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    stats.errors++;
    return 0;
  }

  const parsed = parseOtzariaTxt(content);
  if (parsed.sections.length === 0) return 0;

  const workName = parsed.title || path.basename(filePath, ".txt");

  // Look up metadata
  const meta = metadataMap.get(workName) || metadataMap.get(` ${workName}`);
  const author = meta?.author || parsed.authorLine || null;

  const chunks: InsertChunk[] = [];

  for (let si = 0; si < parsed.sections.length; si++) {
    const section = parsed.sections[si];
    const sectionRef = section.heading || `Section ${si + 1}`;

    for (let pi = 0; pi < section.paragraphs.length; pi++) {
      const text = section.paragraphs[pi];
      const parts = splitLongText(text, MAX_CHUNK_LENGTH);

      for (let i = 0; i < parts.length; i++) {
        const ref = parts.length > 1
          ? `${workName}, ${sectionRef}, ${pi + 1} [${i + 1}/${parts.length}]`
          : `${workName}, ${sectionRef}, ${pi + 1}`;

        chunks.push({
          corpus_id: corpusId,
          work: workName,
          section_ref: ref,
          parent_ref: `${workName}, ${sectionRef}`,
          language: "he" as Language,
          text: parts[i],
          author,
          era: categoryMeta.era,
          community: categoryMeta.community,
          corpus_tier: categoryMeta.corpusTier,
          tags: [...categoryMeta.tags, "otzaria"],
          topics: [],
        });
      }
    }
  }

  if (chunks.length === 0) return 0;
  if (DRY_RUN) return chunks.length;

  let inserted = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    try {
      inserted += await insertChunksBatch(batch);
    } catch (err) {
      console.error(`  ✗ Insert error: ${workName}`, err instanceof Error ? err.message : err);
      stats.errors++;
    }
  }
  return inserted;
}

// --- Main ---

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Otzaria Library Ingestion Pipeline");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Source:     ${OTZARIA_PATH}`);
  console.log(`  Category:   ${ONLY_CATEGORY || "ALL"}`);
  console.log(`  Dry run:    ${DRY_RUN}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log("═══════════════════════════════════════════════════════\n");

  if (!fs.existsSync(OTZARIA_PATH)) {
    console.error(`✗ Path not found: ${OTZARIA_PATH}`);
    process.exit(1);
  }

  loadMetadata();

  // Get or create corpus
  let corpus = await findCorpusByName("Otzaria");
  if (!corpus) {
    if (DRY_RUN) {
      console.log("[DRY RUN] Would create corpus 'Otzaria'");
    } else {
      corpus = await insertCorpus({
        name: "Otzaria",
        corpus_tier: "canonical",
        source_url: "https://github.com/Sivan22/otzaria-library",
        license: "Various (public domain + CC)",
      });
      console.log(`✓ Created corpus: Otzaria (id: ${corpus.id})\n`);
    }
  } else {
    console.log(`✓ Using existing corpus: Otzaria (id: ${corpus.id})\n`);
  }
  const corpusId = corpus?.id ?? 0;

  // Get categories
  let categories: string[];
  if (ONLY_CATEGORY) {
    categories = [ONLY_CATEGORY];
  } else {
    categories = fs.readdirSync(OTZARIA_PATH, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== "אודות התוכנה")
      .map((d) => d.name);
  }

  console.log(`Processing ${categories.length} categories...\n`);

  for (const hebrewCat of categories) {
    const catPath = path.join(OTZARIA_PATH, hebrewCat);
    const catMeta = CATEGORY_MAP[hebrewCat] || {
      englishName: hebrewCat,
      era: "Acharon" as Era,
      community: "General" as Community,
      corpusTier: "canonical" as CorpusTier,
      tags: [hebrewCat],
    };

    const txtFiles = findTxtFiles(catPath);
    console.log(`\n▸ ${catMeta.englishName} (${hebrewCat}) — ${txtFiles.length} TXT files`);

    stats.byCategory[catMeta.englishName] = { files: 0, chunks: 0 };
    let catChunks = 0;

    for (let i = 0; i < txtFiles.length; i++) {
      if ((i + 1) % 50 === 0 || i === txtFiles.length - 1) {
        process.stdout.write(`\r  [${i + 1}/${txtFiles.length}] ${catChunks} chunks...`);
      }

      try {
        const count = await ingestFile(txtFiles[i], corpusId, catMeta);
        catChunks += count;
        stats.chunksInserted += count;
        stats.filesProcessed++;
        stats.byCategory[catMeta.englishName].files++;
        stats.byCategory[catMeta.englishName].chunks += count;
      } catch (err) {
        stats.errors++;
      }
    }

    console.log(`\n  ✓ ${catMeta.englishName}: ${stats.byCategory[catMeta.englishName].files} files → ${catChunks} chunks`);
  }

  // Final report
  console.log("\n\n═══════════════════════════════════════════════════════");
  console.log("  OTZARIA INGESTION COMPLETE");
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
