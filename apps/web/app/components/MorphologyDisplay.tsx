"use client";

interface MorphologyData {
  root: string | null;
  binyan: string | null;
  tense: string | null;
  person: string | null;
  gender: string | null;
  number: string | null;
  form: string | null;
}

// Hebrew binyan patterns — map prefix/suffix patterns to binyan names
const BINYAN_PATTERNS: { pattern: RegExp; binyan: string }[] = [
  { pattern: /^\u05D4\u05D9\u05EA/, binyan: "Hitpa'el" },   // הית
  { pattern: /^\u05D4\u05EA/, binyan: "Hitpa'el" },          // הת
  { pattern: /^\u05E0\u05D9/, binyan: "Nif'al" },            // ני
  { pattern: /^\u05E0/, binyan: "Nif'al" },                  // נ prefix
  { pattern: /^\u05D4\u05D5/, binyan: "Hof'al" },            // הו
  { pattern: /^\u05D4/, binyan: "Hif'il" },                  // ה prefix
  { pattern: /\u05D5\u05BC/, binyan: "Pu'al" },              // וּ (vav with dagesh)
];

const TENSE_PATTERNS: { pattern: RegExp; tense: string }[] = [
  { pattern: /\u05D9\u05B4/, tense: "Present" },
  { pattern: /^\u05DE/, tense: "Present Participle" },        // מ prefix
  { pattern: /^\u05DC/, tense: "Infinitive" },                // ל prefix
];

const GENDER_SUFFIXES: { pattern: RegExp; gender: string; number: string }[] = [
  { pattern: /\u05D5\u05EA$/, gender: "Feminine", number: "Plural" },    // ות
  { pattern: /\u05D9\u05DD$/, gender: "Masculine", number: "Plural" },   // ים
  { pattern: /\u05D4$/, gender: "Feminine", number: "Singular" },         // ה
  { pattern: /\u05EA$/, gender: "Feminine", number: "Singular" },         // ת
];

function extractRoot(word: string): string | null {
  // Strip common Hebrew prefixes and suffixes to approximate a 3-letter root
  let w = word;
  // Remove prefix articles/prepositions: ה ב כ ל מ ש ו
  w = w.replace(/^[\u05D4\u05D1\u05DB\u05DC\u05DE\u05E9\u05D5]/, "");
  // Remove common suffixes
  w = w.replace(/[\u05D5\u05EA\u05D9\u05DD\u05D4\u05DF]$/, "");
  // If we have ~3 consonants left, treat as root
  const consonants = w.replace(/[\u0591-\u05C7]/g, ""); // strip nikkud
  if (consonants.length >= 2 && consonants.length <= 4) {
    return consonants;
  }
  return null;
}

function analyzeMorphology(word: string, knownRoot?: string | null, partOfSpeech?: string | null): MorphologyData {
  const root = knownRoot || extractRoot(word);

  let binyan: string | null = null;
  let tense: string | null = null;
  let person: string | null = null;
  let gender: string | null = null;
  let number: string | null = null;

  // Only analyze binyan for verbs
  const isVerb = partOfSpeech?.toLowerCase().includes("verb");
  if (isVerb || !partOfSpeech) {
    for (const bp of BINYAN_PATTERNS) {
      if (bp.pattern.test(word)) {
        binyan = bp.binyan;
        break;
      }
    }
    if (!binyan && isVerb) {
      binyan = "Pa'al (Qal)";
    }

    for (const tp of TENSE_PATTERNS) {
      if (tp.pattern.test(word)) {
        tense = tp.tense;
        break;
      }
    }
  }

  // Gender / number from suffixes
  for (const gs of GENDER_SUFFIXES) {
    if (gs.pattern.test(word)) {
      gender = gs.gender;
      number = gs.number;
      break;
    }
  }
  if (!number) number = "Singular";
  if (!gender) gender = "Masculine";

  // Form description
  let form: string | null = null;
  if (partOfSpeech) {
    form = partOfSpeech;
  }

  return { root, binyan, tense, person, gender, number, form };
}

interface MorphologyDisplayProps {
  word: string;
  knownRoot?: string | null;
  partOfSpeech?: string | null;
  language?: string;
}

export function MorphologyDisplay({ word, knownRoot, partOfSpeech, language }: MorphologyDisplayProps) {
  // Only show for Hebrew/Aramaic
  if (language && language !== "he" && language !== "arc") return null;

  const morph = analyzeMorphology(word, knownRoot, partOfSpeech);

  const fields: { label: string; value: string | null }[] = [
    { label: "Root", value: morph.root },
    { label: "Binyan", value: morph.binyan },
    { label: "Tense", value: morph.tense },
    { label: "Person", value: morph.person },
    { label: "Gender", value: morph.gender },
    { label: "Number", value: morph.number },
  ];

  const activeFields = fields.filter((f) => f.value);
  if (activeFields.length === 0) return null;

  return (
    <div className="morphology-display">
      <div className="morphology-title">Morphology</div>
      <div className="morphology-grid">
        {activeFields.map((f) => (
          <div key={f.label} className="morphology-field">
            <span className="morphology-label">{f.label}</span>
            <span
              className="morphology-value"
              style={f.label === "Root" ? { fontFamily: "'Noto Serif Hebrew', serif", direction: "rtl" } : undefined}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
