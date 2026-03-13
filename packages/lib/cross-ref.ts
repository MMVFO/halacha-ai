/**
 * Cross-reference utilities for detecting commentary→base-text relationships
 * from work names and section_refs.
 */

export interface CommentaryParseResult {
  commentaryName: string;
  baseWorkName: string;
  fullCommentaryWork: string;
}

// Patterns that indicate a commentary relationship
const COMMENTARY_PATTERNS: RegExp[] = [
  /^(.+?)\s+on\s+(.+)$/i,
  /^Commentary\s+on\s+(.+)$/i,
];

/**
 * Parse a work name to detect "X on Y" commentary pattern.
 * Returns null if the work is not a commentary.
 */
export function parseCommentaryWork(workName: string): CommentaryParseResult | null {
  // Try "Commentary on X" first (single capture group)
  const commentaryOnMatch = workName.match(/^Commentary\s+on\s+(.+)$/i);
  if (commentaryOnMatch) {
    return {
      commentaryName: "Commentary",
      baseWorkName: commentaryOnMatch[1].trim(),
      fullCommentaryWork: workName,
    };
  }

  // Try "X on Y" (two capture groups)
  const match = workName.match(/^(.+?)\s+on\s+(.+)$/i);
  if (match) {
    return {
      commentaryName: match[1].trim(),
      baseWorkName: match[2].trim(),
      fullCommentaryWork: workName,
    };
  }

  return null;
}

/**
 * Known works that contain "on" but are NOT commentaries.
 * These are base texts whose title happens to include the word "on".
 */
const FALSE_POSITIVE_WORKS = new Set([
  // Mishneh Torah sections with "on" in the title
  "rest on a holiday",
  "rest on the tenth of tishrei",
  "things forbidden on the altar",
  "service on the day of atonement",
  "forbidden foods on passover",
  "on repentance",
  "on mourning",
]);

/**
 * Check if a parsed commentary result is likely a false positive.
 * A false positive is when "on" appears in a base text title rather than
 * indicating a commentary relationship.
 */
export function isLikelyFalsePositive(parsed: CommentaryParseResult): boolean {
  // Check the full text after "on" against known false positives
  const afterOn = parsed.baseWorkName.toLowerCase();
  for (const fp of FALSE_POSITIVE_WORKS) {
    if (afterOn.includes(fp)) return true;
  }
  return false;
}

/**
 * Resolve a base work name extracted from "X on Y" to an actual work name
 * in the database. Uses multiple fallback strategies.
 *
 * @param baseWorkName - The extracted base name (e.g., "Genesis", "Shulchan Arukh, Orach Chayim")
 * @param allWorks - Set of all known work names from the database
 * @returns The resolved work name, or null if no match found
 */
export function resolveBaseWork(
  baseWorkName: string,
  allWorks: Set<string>,
): string | null {
  // 1. Exact match
  if (allWorks.has(baseWorkName)) return baseWorkName;

  // 2. Case-insensitive exact match
  const baseLower = baseWorkName.toLowerCase();
  for (const work of allWorks) {
    if (work.toLowerCase() === baseLower) return work;
  }

  // 3. Check if any work ends with the base name (suffix match)
  // e.g., "Orach Chayim" might match "Shulchan Arukh, Orach Chayim"
  for (const work of allWorks) {
    if (work.toLowerCase().endsWith(baseLower)) return work;
  }

  // 4. Check if any work starts with the base name (prefix match)
  // e.g., "Shulchan Arukh" might match "Shulchan Arukh, Orach Chayim"
  // But we want exact prefix, not substring
  for (const work of allWorks) {
    const workLower = work.toLowerCase();
    if (workLower.startsWith(baseLower) && (workLower.length === baseLower.length || workLower[baseLower.length] === ",")) {
      return work;
    }
  }

  // 5. Substring containment
  for (const work of allWorks) {
    if (work.toLowerCase().includes(baseLower)) return work;
  }

  return null;
}

/**
 * Given a commentary section_ref and the commentary/base work names,
 * derive what the base text section_ref should be.
 *
 * Example:
 *   commentarySectionRef: "Rashi on Genesis, Chapter 1, Verse 1"
 *   commentaryWorkName: "Rashi on Genesis"
 *   baseWorkName: "Genesis"
 *   → returns: "Genesis, Chapter 1, Verse 1"
 */
export function extractBaseSectionRef(
  commentarySectionRef: string,
  commentaryWorkName: string,
  baseWorkName: string,
): string | null {
  // Strategy 1: Strip commentary work prefix and prepend base work name
  if (commentarySectionRef.startsWith(commentaryWorkName)) {
    const remainder = commentarySectionRef.slice(commentaryWorkName.length);
    // remainder typically starts with ", " or ":"
    const baseSectionRef = baseWorkName + remainder;
    return baseSectionRef;
  }

  // Strategy 2: Strip just the commentary name (before "on")
  const parsed = parseCommentaryWork(commentaryWorkName);
  if (parsed) {
    const commentaryPrefix = parsed.commentaryName + " on ";
    if (commentarySectionRef.toLowerCase().startsWith(commentaryPrefix.toLowerCase())) {
      return commentarySectionRef.slice(commentaryPrefix.length);
    }
  }

  return null;
}

/**
 * Extract the structural "address" from a section_ref for fuzzy matching.
 * Strips the work name prefix and returns just the numeric/structural parts.
 *
 * Example:
 *   "Shulchan Arukh, Orach Chayim, Siman 253, Se'if 1" → "Siman 253, Se'if 1"
 *   "Genesis, Chapter 1, Verse 1" → "Chapter 1, Verse 1"
 *   "Berakhot, Daf 2a, Line 5" → "Daf 2a, Line 5"
 */
export function extractSectionAddress(sectionRef: string, workName: string): string | null {
  if (sectionRef.startsWith(workName)) {
    const remainder = sectionRef.slice(workName.length);
    // Strip leading ", " or ":"
    return remainder.replace(/^[,:\s]+/, "").trim() || null;
  }
  return null;
}
