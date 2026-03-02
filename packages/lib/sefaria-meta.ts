/**
 * Metadata mapping for Sefaria-Export categories → database fields.
 *
 * The cltk-flat directory structure is:
 *   cltk-flat/{Category}/{SubCategory}/.../{Work}/{Language}/merged.json
 *
 * This module infers: era, community, corpus_tier, author, tags
 * from the directory path, with overrides for known works.
 */

import type { Era, Community, CorpusTier, Language } from "@halacha-ai/db";

export interface WorkMeta {
  era: Era;
  community: Community;
  corpusTier: CorpusTier;
  author?: string;
  tags: string[];
  authorityWeight?: number;
}

// Category-level defaults
const CATEGORY_DEFAULTS: Record<string, WorkMeta> = {
  Halakhah: { era: "Acharon", community: "General", corpusTier: "canonical", tags: ["halakhah"] },
  Talmud: { era: "Amora", community: "General", corpusTier: "canonical", tags: ["talmud"] },
  Mishnah: { era: "Tanna", community: "General", corpusTier: "canonical", tags: ["mishnah"] },
  Tanakh: { era: "Tanna", community: "General", corpusTier: "canonical", tags: ["tanakh"] },
  Tosefta: { era: "Tanna", community: "General", corpusTier: "canonical", tags: ["tosefta"] },
  Midrash: { era: "Amora", community: "General", corpusTier: "canonical", tags: ["midrash"] },
  Kabbalah: { era: "Rishon", community: "General", corpusTier: "canonical", tags: ["kabbalah", "mysticism"] },
  Chasidut: { era: "Acharon", community: "Chassidic", corpusTier: "canonical", tags: ["chasidut"] },
  Liturgy: { era: "Gaon", community: "General", corpusTier: "canonical", tags: ["liturgy"] },
  Responsa: { era: "Acharon", community: "General", corpusTier: "canonical", tags: ["responsa"] },
  Musar: { era: "Acharon", community: "General", corpusTier: "canonical", tags: ["musar", "ethics"] },
  "Jewish Thought": { era: "Rishon", community: "General", corpusTier: "canonical", tags: ["machshava", "philosophy"] },
  Reference: { era: "Modern", community: "General", corpusTier: "academic", tags: ["reference"] },
  "Second Temple": { era: "Second Temple", community: "General", corpusTier: "apocrypha", tags: ["second_temple"], authorityWeight: 0 },
};

// Known work overrides: path fragment → metadata
const WORK_OVERRIDES: Record<string, Partial<WorkMeta>> = {
  // --- Halakhah ---
  "Shulchan Arukh": { era: "Acharon", author: "Yosef Karo", community: "Sephardi", tags: ["shulchan_arukh"] },
  "Rema": { era: "Acharon", author: "Moshe Isserles", community: "Ashkenazi", tags: ["rema"] },
  "Mishneh Torah": { era: "Rishon", author: "Moshe ben Maimon", tags: ["rambam", "mishneh_torah"] },
  "Tur": { era: "Rishon", author: "Yaakov ben Asher", tags: ["tur"] },
  "Aruch HaShulchan": { era: "Acharon", author: "Yechiel Michel Epstein", community: "Lithuanian", tags: ["aruch_hashulchan"] },
  "Kitzur Shulchan Aruch": { era: "Acharon", author: "Shlomo Ganzfried", community: "Hungarian", tags: ["kitzur"] },
  "Mishnah Berurah": { era: "Acharon", author: "Yisrael Meir Kagan", community: "Lithuanian", tags: ["mishnah_berurah"] },
  "Ben Ish Chai": { era: "Acharon", author: "Yosef Chaim of Baghdad", community: "Iraqi", tags: ["ben_ish_chai"] },
  "Chayei Adam": { era: "Acharon", author: "Avraham Danzig", community: "Ashkenazi", tags: ["chayei_adam"] },
  "Kaf HaChaim": { era: "Acharon", author: "Yaakov Chaim Sofer", community: "Sephardi", tags: ["kaf_hachaim"] },

  // --- Talmud ---
  "Bavli": { era: "Amora", tags: ["bavli", "talmud_bavli"] },
  "Yerushalmi": { era: "Amora", tags: ["yerushalmi", "talmud_yerushalmi"] },
  "Rashi": { era: "Rishon", author: "Shlomo Yitzchaki", tags: ["rashi"] },
  "Tosafot": { era: "Rishon", tags: ["tosafot"] },

  // --- Kabbalah ---
  "Zohar": { era: "Rishon", tags: ["zohar", "kabbalah", "mysticism"], author: "Shimon bar Yochai (attributed)" },
  "Zohar Chadash": { era: "Rishon", tags: ["zohar_chadash", "kabbalah"] },
  "Tikkunei Zohar": { era: "Rishon", tags: ["tikkunei_zohar", "kabbalah"] },
  "Sefer Yetzirah": { era: "Tanna", tags: ["sefer_yetzirah", "kabbalah", "creation"] },
  "Sefer HaBahir": { era: "Rishon", tags: ["bahir", "kabbalah"] },
  "Pardes Rimmonim": { era: "Rishon", author: "Moshe Cordovero", tags: ["pardes_rimonim", "kabbalah"] },
  "Ohr Ne'erav": { era: "Rishon", author: "Moshe Cordovero", tags: ["ohr_neerav", "kabbalah"] },
  "Etz Chaim": { era: "Acharon", author: "Chaim Vital", tags: ["etz_chaim", "arizal", "kabbalah"] },
  "Sha'ar HaGilgulim": { era: "Acharon", author: "Chaim Vital", tags: ["gilgulim", "arizal", "kabbalah"] },
  "Sha'ar HaKavanot": { era: "Acharon", author: "Chaim Vital", tags: ["kavanot", "arizal", "kabbalah"] },
  "Sha'arei Kedusha": { era: "Acharon", author: "Chaim Vital", tags: ["shaarei_kedusha", "kabbalah"] },
  "Pri Etz Chaim": { era: "Acharon", author: "Chaim Vital", tags: ["pri_etz_chaim", "arizal"] },
  "Baal HaSulam": { era: "Modern", author: "Yehuda Ashlag", tags: ["sulam", "kabbalah"] },
  "Ramchal": { era: "Acharon", author: "Moshe Chaim Luzzatto" },
  "Da'at Tevunot": { era: "Acharon", author: "Moshe Chaim Luzzatto", tags: ["daat_tevunot", "kabbalah"] },
  "Kalach Pitchei Chokhmah": { era: "Acharon", author: "Moshe Chaim Luzzatto", tags: ["klach", "kabbalah"] },
  "Heikhalot Rabbati": { era: "Tanna", tags: ["heikhalot", "merkavah", "mysticism"] },

  // --- Chasidut ---
  "Tanya": { era: "Acharon", author: "Schneur Zalman of Liadi", community: "Chabad", tags: ["tanya", "chabad"] },
  "Torah Ohr": { era: "Acharon", author: "Schneur Zalman of Liadi", community: "Chabad", tags: ["torah_ohr", "chabad"] },
  "Likkutei Torah": { era: "Acharon", author: "Schneur Zalman of Liadi", community: "Chabad", tags: ["likkutei_torah", "chabad"] },
  "Likutei Moharan": { era: "Acharon", author: "Nachman of Breslov", community: "Breslov", tags: ["likutei_moharan", "breslov"] },
  "Likutei Halakhot": { era: "Acharon", author: "Natan of Breslov", community: "Breslov", tags: ["breslov"] },
  "Sippurei Maasiyot": { era: "Acharon", author: "Nachman of Breslov", community: "Breslov", tags: ["breslov", "stories"] },
  "Kedushat Levi": { era: "Acharon", author: "Levi Yitzchak of Berditchev", community: "Chassidic", tags: ["kedushat_levi"] },
  "Noam Elimelekh": { era: "Acharon", author: "Elimelech of Lizhensk", community: "Chassidic", tags: ["noam_elimelech"] },
  "Me'or Einayim": { era: "Acharon", author: "Menachem Nachum of Chernobyl", community: "Chassidic", tags: ["meor_einayim"] },
  "Degel Machaneh Ephraim": { era: "Acharon", author: "Moshe Chaim Ephraim of Sudilkov", community: "Chassidic", tags: ["degel"] },
  "Sefat Emet": { era: "Acharon", author: "Yehudah Aryeh Leib Alter", community: "Ger", tags: ["sfas_emes", "ger"] },
  "Bnei Yissaschar": { era: "Acharon", author: "Tzvi Elimelech of Dinov", community: "Chassidic", tags: ["bnei_yissaschar"] },
  "Esh Kodesh": { era: "Modern", author: "Kalonymus Kalman Shapira", community: "Chassidic", tags: ["esh_kodesh", "piaseczno", "holocaust"] },
  "Chovat HaTalmidim": { era: "Modern", author: "Kalonymus Kalman Shapira", community: "Chassidic", tags: ["piaseczno"] },
  "Maor VaShemesh": { era: "Acharon", author: "Kalonymus Kalman Epstein", community: "Chassidic", tags: ["maor_vashemesh"] },
  "Toldot Yaakov Yosef": { era: "Acharon", author: "Yaakov Yosef of Polonne", community: "Chassidic", tags: ["toldot"] },
  "Ohev Yisrael": { era: "Acharon", author: "Avraham Yehoshua Heshel of Apt", community: "Chassidic", tags: ["ohev_yisrael"] },

  // --- Musar ---
  "Mesillat Yesharim": { era: "Acharon", author: "Moshe Chaim Luzzatto", tags: ["mesillat_yesharim", "musar"] },
  "Orchot Tzadikim": { era: "Rishon", tags: ["orchot_tzadikim", "musar"] },
  "Chovot HaLevavot": { era: "Rishon", author: "Bachya ibn Paquda", tags: ["chovot_halevavot", "musar"] },

  // --- Jewish Thought ---
  "Moreh Nevuchim": { era: "Rishon", author: "Moshe ben Maimon", tags: ["moreh_nevuchim", "rambam", "philosophy"] },
  "Kuzari": { era: "Rishon", author: "Yehuda Halevi", tags: ["kuzari", "philosophy"] },
  "Derech Hashem": { era: "Acharon", author: "Moshe Chaim Luzzatto", tags: ["derech_hashem"] },
  "Sefer HaIkkarim": { era: "Rishon", author: "Yosef Albo", tags: ["ikkarim", "philosophy"] },
};

/**
 * Infers metadata for a Sefaria-Export file from its path.
 *
 * @param relPath - path relative to cltk-flat/, e.g.:
 *   "Kabbalah/Zohar/Zohar/Hebrew/merged.json"
 *   "Talmud/Bavli/Seder Nezikin/Bava Metzia/Hebrew/merged.json"
 */
export function inferMeta(relPath: string): WorkMeta & { work: string; language: Language } {
  const parts = relPath.replace(/\\/g, "/").split("/");
  const category = parts[0];
  const language = detectLanguage(parts);
  const work = inferWorkName(parts);

  // Start with category defaults
  const base = CATEGORY_DEFAULTS[category] ?? {
    era: "Acharon" as Era,
    community: "General" as Community,
    corpusTier: "canonical" as CorpusTier,
    tags: [category.toLowerCase().replace(/\s+/g, "_")],
  };

  // Apply work overrides (check from most specific to least)
  let overrides: Partial<WorkMeta> = {};
  for (const [key, val] of Object.entries(WORK_OVERRIDES)) {
    if (relPath.includes(key)) {
      overrides = { ...overrides, ...val };
    }
  }

  return {
    ...base,
    ...overrides,
    tags: [...new Set([...(base.tags || []), ...(overrides.tags || [])])],
    work,
    language,
  };
}

function detectLanguage(parts: string[]): Language {
  // Language folder is typically the second-to-last element
  const langFolder = parts[parts.length - 2];
  if (langFolder === "English") return "en";
  if (langFolder === "Aramaic") return "arc";
  return "he"; // Default to Hebrew
}

function inferWorkName(parts: string[]): string {
  // Work name is typically 2 levels up from merged.json (before language folder)
  // e.g., Kabbalah/Zohar/Zohar/Hebrew/merged.json → "Zohar"
  // e.g., Talmud/Bavli/Seder Nezikin/Bava Metzia/Hebrew/merged.json → "Bava Metzia"
  if (parts.length >= 3) {
    return parts[parts.length - 3]; // folder before Language/
  }
  return parts[0]; // fallback to category
}

// Export for testing
export { CATEGORY_DEFAULTS, WORK_OVERRIDES };
