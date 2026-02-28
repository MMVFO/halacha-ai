import fs from "fs";
import path from "path";
import type { InsertChunk, CorpusTier, Era, Community, Language } from "@halacha-ai/db";

/**
 * Reads a Sefaria-Export merged.json file.
 * These files typically contain nested arrays of text: book > chapter > verse/se'if.
 */
export function readMergedJson(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Reads a Sefaria-Export merged.txt file.
 * Returns lines of text.
 */
export function readMergedTxt(filePath: string): string[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw.split("\n").filter((line) => line.trim().length > 0);
}

/**
 * Strips basic HTML tags from Sefaria text.
 */
export function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Finds all merged.json files under a Sefaria-Export directory path.
 */
export function findMergedFiles(basePath: string, pattern: string = "merged.json"): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === pattern) {
        results.push(full);
      }
    }
  }

  walk(basePath);
  return results;
}

// --- Shulchan Arukh Chunker ---

export interface ShulchanArukhSection {
  prefix: string;  // "OC", "YD", "EH", "CM"
  fullName: string;
}

export const SA_SECTIONS: ShulchanArukhSection[] = [
  { prefix: "OC", fullName: "Shulchan Arukh Orach Chaim" },
  { prefix: "YD", fullName: "Shulchan Arukh Yoreh Deah" },
  { prefix: "EH", fullName: "Shulchan Arukh Even HaEzer" },
  { prefix: "CM", fullName: "Shulchan Arukh Choshen Mishpat" },
];

/**
 * Chunks Shulchan Arukh from Sefaria-Export structure.
 * Sefaria stores SA as nested arrays: simanim > se'ifim.
 * The merged.json for "Shulchan Arukh, Orach Chayyim" is:
 *   Array of simanim, each siman is array of se'if strings.
 */
export function chunkShulchanArukh(
  data: string[][],
  section: ShulchanArukhSection,
  corpusId: number,
  opts: {
    author?: string;
    community?: Community;
    language?: Language;
  } = {}
): InsertChunk[] {
  const chunks: InsertChunk[] = [];
  const {
    author = "Yosef Karo",
    community = "Sephardi",
    language = "he",
  } = opts;

  for (let simanIdx = 0; simanIdx < data.length; simanIdx++) {
    const siman = data[simanIdx];
    if (!siman || !Array.isArray(siman)) continue;
    const simanNum = simanIdx + 1;
    const parentRef = `${section.prefix} ${simanNum}`;

    for (let seifIdx = 0; seifIdx < siman.length; seifIdx++) {
      const rawText = siman[seifIdx];
      if (!rawText || typeof rawText !== "string") continue;

      const text = stripHtml(rawText);
      if (text.length < 5) continue;

      const seifNum = seifIdx + 1;
      const sectionRef = `${section.prefix} ${simanNum}:${seifNum}`;

      chunks.push({
        corpus_id: corpusId,
        work: section.fullName,
        section_ref: sectionRef,
        parent_ref: parentRef,
        language,
        text,
        author,
        era: "Acharon" as Era,
        community,
        corpus_tier: "canonical" as CorpusTier,
        tags: ["shulchan_arukh", section.prefix.toLowerCase()],
        topics: [],
      });
    }
  }

  return chunks;
}

/**
 * Chunks Rema glosses (typically stored as a parallel commentary in Sefaria).
 */
export function chunkRema(
  data: string[][],
  section: ShulchanArukhSection,
  corpusId: number,
  language: Language = "he"
): InsertChunk[] {
  const chunks: InsertChunk[] = [];

  for (let simanIdx = 0; simanIdx < data.length; simanIdx++) {
    const siman = data[simanIdx];
    if (!siman || !Array.isArray(siman)) continue;
    const simanNum = simanIdx + 1;
    const parentRef = `${section.prefix} ${simanNum}`;

    for (let seifIdx = 0; seifIdx < siman.length; seifIdx++) {
      const rawText = siman[seifIdx];
      if (!rawText || typeof rawText !== "string") continue;

      const text = stripHtml(rawText);
      if (text.length < 5) continue;

      const seifNum = seifIdx + 1;
      const sectionRef = `Rema ${section.prefix} ${simanNum}:${seifNum}`;

      chunks.push({
        corpus_id: corpusId,
        work: `Rema on ${section.fullName}`,
        section_ref: sectionRef,
        parent_ref: parentRef,
        language,
        text,
        author: "Moshe Isserles",
        era: "Acharon",
        community: "Ashkenazi",
        corpus_tier: "canonical",
        tags: ["rema", section.prefix.toLowerCase()],
        topics: [],
      });
    }
  }

  return chunks;
}

// --- Rambam Chunker ---

/**
 * Chunks Rambam (Mishneh Torah).
 * Sefaria structure: book (hilchot) > chapters > individual halakhot.
 */
export function chunkRambam(
  data: string[][],
  hilchotName: string,
  corpusId: number,
  language: Language = "he"
): InsertChunk[] {
  const chunks: InsertChunk[] = [];

  for (let chapterIdx = 0; chapterIdx < data.length; chapterIdx++) {
    const chapter = data[chapterIdx];
    if (!chapter || !Array.isArray(chapter)) continue;
    const chapterNum = chapterIdx + 1;
    const parentRef = `Rambam ${hilchotName} ${chapterNum}`;

    for (let halachaIdx = 0; halachaIdx < chapter.length; halachaIdx++) {
      const rawText = chapter[halachaIdx];
      if (!rawText || typeof rawText !== "string") continue;

      const text = stripHtml(rawText);
      if (text.length < 5) continue;

      const halachaNum = halachaIdx + 1;
      const sectionRef = `Rambam ${hilchotName} ${chapterNum}:${halachaNum}`;

      chunks.push({
        corpus_id: corpusId,
        work: `Rambam ${hilchotName}`,
        section_ref: sectionRef,
        parent_ref: parentRef,
        language,
        text,
        author: "Moshe ben Maimon",
        era: "Rishon",
        community: "General",
        corpus_tier: "canonical",
        tags: ["rambam", "mishneh_torah"],
        topics: [],
      });
    }
  }

  return chunks;
}

// --- Generic commentary chunker ---

/**
 * Chunks a commentary that follows the same siman/se'if structure as SA.
 */
export function chunkCommentary(
  data: string[][],
  workName: string,
  section: ShulchanArukhSection,
  corpusId: number,
  meta: {
    author: string;
    era: Era;
    community: Community;
    language?: Language;
    tags?: string[];
  }
): InsertChunk[] {
  const chunks: InsertChunk[] = [];
  const language = meta.language ?? "he";

  for (let simanIdx = 0; simanIdx < data.length; simanIdx++) {
    const siman = data[simanIdx];
    if (!siman || !Array.isArray(siman)) continue;
    const simanNum = simanIdx + 1;
    const parentRef = `${section.prefix} ${simanNum}`;

    for (let seifIdx = 0; seifIdx < siman.length; seifIdx++) {
      const rawText = siman[seifIdx];
      if (!rawText || typeof rawText !== "string") continue;

      const text = stripHtml(rawText);
      if (text.length < 5) continue;

      const seifNum = seifIdx + 1;
      const sectionRef = `${workName} ${section.prefix} ${simanNum}:${seifNum}`;

      chunks.push({
        corpus_id: corpusId,
        work: workName,
        section_ref: sectionRef,
        parent_ref: parentRef,
        language,
        text,
        author: meta.author,
        era: meta.era,
        community: meta.community,
        corpus_tier: "canonical",
        tags: meta.tags ?? [workName.toLowerCase().replace(/\s+/g, "_")],
        topics: [],
      });
    }
  }

  return chunks;
}

// --- Responsa chunker ---

/**
 * Chunks a responsum. Expects an array of paragraphs for a single teshuva.
 */
export function chunkResponsum(
  paragraphs: string[],
  workName: string,
  teshuvahRef: string,
  corpusId: number,
  meta: {
    author: string;
    era: Era;
    community: Community;
    language?: Language;
  }
): InsertChunk[] {
  const chunks: InsertChunk[] = [];
  const language = meta.language ?? "he";

  for (let i = 0; i < paragraphs.length; i++) {
    const text = stripHtml(paragraphs[i]);
    if (text.length < 10) continue;

    chunks.push({
      corpus_id: corpusId,
      work: workName,
      section_ref: `${teshuvahRef}:${i + 1}`,
      parent_ref: teshuvahRef,
      language,
      text,
      author: meta.author,
      era: meta.era,
      community: meta.community,
      corpus_tier: "canonical",
      tags: ["responsa"],
      topics: [],
    });
  }

  return chunks;
}

// --- Apocrypha / Second Temple chunker ---

/**
 * Chunks Second Temple / apocryphal texts.
 * Structure: chapters > verses.
 */
export function chunkApocrypha(
  data: string[][],
  workName: string,
  corpusId: number,
  meta: {
    corpusTier: 'apocrypha' | 'pseudepigrapha' | 'academic';
    community?: Community;
    language?: Language;
  }
): InsertChunk[] {
  const chunks: InsertChunk[] = [];
  const language = meta.language ?? "en";

  for (let chapterIdx = 0; chapterIdx < data.length; chapterIdx++) {
    const chapter = data[chapterIdx];
    if (!chapter || !Array.isArray(chapter)) continue;
    const chapterNum = chapterIdx + 1;
    const parentRef = `${workName} ${chapterNum}`;

    for (let verseIdx = 0; verseIdx < chapter.length; verseIdx++) {
      const rawText = chapter[verseIdx];
      if (!rawText || typeof rawText !== "string") continue;

      const text = stripHtml(rawText);
      if (text.length < 5) continue;

      const verseNum = verseIdx + 1;
      const sectionRef = `${workName} ${chapterNum}:${verseNum}`;

      chunks.push({
        corpus_id: corpusId,
        work: workName,
        section_ref: sectionRef,
        parent_ref: parentRef,
        language,
        text,
        author: null,
        era: "Second Temple",
        community: meta.community ?? "General",
        authority_weight: 0.0,  // ALWAYS zero for non-canonical
        corpus_tier: meta.corpusTier,
        tags: ["second_temple", meta.corpusTier],
        topics: [],
      });
    }
  }

  return chunks;
}
