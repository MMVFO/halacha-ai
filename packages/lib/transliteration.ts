/**
 * Hebrew transliteration normalizer.
 * Reduces common English-Hebrew transliteration variants to a canonical form
 * for fuzzy matching. Applied to search queries, not to stored text.
 */

// Ordered replacement rules (more specific patterns first)
const TRANSLITERATION_RULES: [RegExp, string][] = [
  // Multi-char patterns first
  [/tsch/gi, "ch"],
  [/sch/gi, "sh"],
  [/tch/gi, "ch"],
  [/cch/gi, "ch"],

  // ch/kh equivalence (biggest source of variation)
  [/kh/gi, "ch"],

  // tz/ts equivalence
  [/tz/gi, "ts"],

  // ph → f
  [/ph/gi, "f"],

  // Double consonant reduction
  [/bb/gi, "b"],
  [/dd/gi, "d"],
  [/ff/gi, "f"],
  [/gg/gi, "g"],
  [/kk/gi, "k"],
  [/ll/gi, "l"],
  [/mm/gi, "m"],
  [/nn/gi, "n"],
  [/pp/gi, "p"],
  [/rr/gi, "r"],
  [/ss/gi, "s"],
  [/tt/gi, "t"],
  [/zz/gi, "z"],

  // Terminal silent h removal
  [/ah\b/gi, "a"],
  [/eh\b/gi, "e"],
  [/oh\b/gi, "o"],
  [/ih\b/gi, "i"],

  // ou → o (Yousef → Yosef)
  [/ou/gi, "o"],

  // ei/ai/ey normalization
  [/ey\b/gi, "ei"],
  [/ai/gi, "ei"],

  // v/w equivalence
  [/w/gi, "v"],

  // c before a/o/u → k (Caro → Karo), but not before e/i where c→s
  [/c(?=[aou])/gi, "k"],

  // q → k
  [/q/gi, "k"],
];

/**
 * Normalize a Hebrew transliteration string to canonical form.
 * Used for search matching only — not for display.
 */
export function normalizeHebrew(input: string): string {
  let result = input.toLowerCase().trim();
  for (const [pattern, replacement] of TRANSLITERATION_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Generate multiple normalized variants of a query term for OR-matching.
 * Returns the original + normalized + key alternate forms.
 */
export function expandQueryVariants(term: string): string[] {
  const variants = new Set<string>();
  const lower = term.toLowerCase().trim();
  if (!lower) return [];

  variants.add(lower);
  variants.add(normalizeHebrew(lower));

  // ch ↔ kh swap
  if (lower.includes("ch")) {
    variants.add(lower.replace(/ch/gi, "kh"));
    variants.add(lower.replace(/ch/gi, "h"));
  }
  if (lower.includes("kh")) {
    variants.add(lower.replace(/kh/gi, "ch"));
  }

  // Terminal h toggle: Naamah ↔ Naama
  if (/[aeiou]h$/i.test(lower)) {
    variants.add(lower.slice(0, -1));
  } else if (/[aeiou]$/i.test(lower)) {
    variants.add(lower + "h");
  }

  // Double/single consonant toggle
  const doubleMatch = lower.match(/(bb|tt|ss|kk|nn|mm|ll)/i);
  if (doubleMatch) {
    variants.add(lower.replace(/(bb|tt|ss|kk|nn|mm|ll)/gi, (m) => m[0]));
  } else {
    // Try doubling certain consonants (Shabat → Shabbat)
    for (const c of ["b", "t", "s", "k", "n", "m", "l"]) {
      const singlePattern = new RegExp(`(?<=[aeiou])${c}(?=[aeiou])`, "gi");
      if (singlePattern.test(lower)) {
        variants.add(lower.replace(singlePattern, c + c));
        break; // Only one doubling per term
      }
    }
  }

  // tz ↔ ts toggle
  if (lower.includes("tz")) {
    variants.add(lower.replace(/tz/gi, "ts"));
  }
  if (lower.includes("ts")) {
    variants.add(lower.replace(/ts/gi, "tz"));
  }

  // Shabbat ↔ Shabbos (common Ashkenazi/Sephardi toggle)
  if (lower.endsWith("at")) {
    variants.add(lower.slice(0, -2) + "os");
  }
  if (lower.endsWith("os") && lower.length > 3) {
    variants.add(lower.slice(0, -2) + "at");
  }

  return [...variants];
}

// Common English stop words to skip during term extraction
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "to", "of",
  "in", "for", "on", "with", "at", "by", "from", "as", "into", "through",
  "during", "before", "after", "above", "below", "between", "out", "off",
  "over", "under", "again", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "because", "but", "and", "or", "if",
  "while", "about", "what", "which", "who", "whom", "this", "that",
  "these", "those", "am", "it", "its", "say", "says", "said",
]);

/**
 * Extract significant terms from a question for transliteration expansion.
 * Filters out stop words and short words (< 3 chars).
 * Caps at 8 terms to avoid query explosion.
 */
export function extractKeyTerms(question: string): string[] {
  return question
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 8);
}
