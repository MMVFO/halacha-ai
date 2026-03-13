export type Language = "en" | "he";

export interface TranslationStrings {
  // Global
  appName: string;
  home: string;
  library: string;
  search: string;
  ai: string;
  saved: string;
  loading: string;
  error: string;
  noResults: string;
  submit: string;
  cancel: string;
  close: string;
  back: string;
  language: string;

  // Search
  searchPlaceholder: string;
  searchResults: string;
  filters: string;
  era: string;
  community: string;
  corpusTier: string;

  // Corpus Dashboard
  corpusDashboard: string;
  totalChunks: string;
  totalWorks: string;
  embeddedPercentage: string;
  coverageByCategory: string;
  gapAnalysis: string;
  mostNeededTexts: string;
  sourceAttribution: string;
  categories: string;

  // Analysis
  historicalAnalysis: string;
  analysisTitle: string;
  analysisSubtitle: string;
  analysisCTA: string;
  analysisPlaceholder: string;
  correctionChain: string;
  originalClaim: string;
  correction: string;
  confidence: string;
  established: string;
  debated: string;
  uncertain: string;

  // Discovery
  discovery: string;
  discoveryTitle: string;
  discoverySubtitle: string;
  undiscoveredConnections: string;
  consensusMapping: string;
  whatIf: string;
  crossCommunity: string;
  discoverPlaceholder: string;
  discoverCTA: string;
  citations: string;

  // i18n
  switchLanguage: string;
  english: string;
  hebrew: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    appName: "Halacha AI",
    home: "Home",
    library: "Library",
    search: "Search",
    ai: "AI",
    saved: "Saved",
    loading: "Loading...",
    error: "An error occurred",
    noResults: "No results found",
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    language: "Language",

    searchPlaceholder: "Search the corpus...",
    searchResults: "Search Results",
    filters: "Filters",
    era: "Era",
    community: "Community",
    corpusTier: "Corpus Tier",

    corpusDashboard: "Corpus Tracking Dashboard",
    totalChunks: "Total Chunks",
    totalWorks: "Total Works",
    embeddedPercentage: "Embedded",
    coverageByCategory: "Coverage by Category",
    gapAnalysis: "Gap Analysis",
    mostNeededTexts: "Most Needed Missing Texts",
    sourceAttribution: "Source Attribution",
    categories: "Categories",

    historicalAnalysis: "Historical Analysis",
    analysisTitle: "Where Scholarship Evolved",
    analysisSubtitle: "Explore how halakhic understanding developed across generations, with later authorities building upon and refining earlier positions",
    analysisCTA: "Analyze",
    analysisPlaceholder: "Enter a halakhic topic or claim to trace its development...",
    correctionChain: "Development Chain",
    originalClaim: "Original Position",
    correction: "Later Development",
    confidence: "Confidence",
    established: "Established",
    debated: "Debated",
    uncertain: "Uncertain",

    discovery: "Discovery",
    discoveryTitle: "Novel Discovery Engine",
    discoverySubtitle: "Uncover hidden patterns, connections, and insights across the halakhic corpus",
    undiscoveredConnections: "Undiscovered Connections",
    consensusMapping: "Consensus Mapping",
    whatIf: "What If?",
    crossCommunity: "Cross-Community Synthesis",
    discoverPlaceholder: "Enter your question or topic...",
    discoverCTA: "Discover",
    citations: "Citations",

    switchLanguage: "Switch Language",
    english: "English",
    hebrew: "Hebrew",
  },
  he: {
    appName: "\u05D4\u05DC\u05DB\u05D4 AI",
    home: "\u05D1\u05D9\u05EA",
    library: "\u05E1\u05E4\u05E8\u05D9\u05D4",
    search: "\u05D7\u05D9\u05E4\u05D5\u05E9",
    ai: "\u05D1\u05D9\u05E0\u05D4 \u05DE\u05DC\u05D0\u05DB\u05D5\u05EA\u05D9\u05EA",
    saved: "\u05E9\u05DE\u05D5\u05E8\u05D9\u05DD",
    loading: "\u05D8\u05D5\u05E2\u05DF...",
    error: "\u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4",
    noResults: "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA",
    submit: "\u05E9\u05DC\u05D7",
    cancel: "\u05D1\u05D8\u05DC",
    close: "\u05E1\u05D2\u05D5\u05E8",
    back: "\u05D7\u05D6\u05E8\u05D4",
    language: "\u05E9\u05E4\u05D4",

    searchPlaceholder: "\u05D7\u05E4\u05E9 \u05D1\u05E7\u05D5\u05E8\u05E4\u05D5\u05E1...",
    searchResults: "\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05D7\u05D9\u05E4\u05D5\u05E9",
    filters: "\u05DE\u05E1\u05E0\u05E0\u05D9\u05DD",
    era: "\u05EA\u05E7\u05D5\u05E4\u05D4",
    community: "\u05E7\u05D4\u05D9\u05DC\u05D4",
    corpusTier: "\u05E8\u05DE\u05EA \u05E7\u05D5\u05E8\u05E4\u05D5\u05E1",

    corpusDashboard: "\u05DC\u05D5\u05D7 \u05DE\u05E2\u05E7\u05D1 \u05E7\u05D5\u05E8\u05E4\u05D5\u05E1",
    totalChunks: "\u05E1\u05D4\"\u05DB \u05E7\u05D8\u05E2\u05D9\u05DD",
    totalWorks: "\u05E1\u05D4\"\u05DB \u05D7\u05D9\u05D1\u05D5\u05E8\u05D9\u05DD",
    embeddedPercentage: "\u05DE\u05D5\u05D8\u05DE\u05E2\u05D9\u05DD",
    coverageByCategory: "\u05DB\u05D9\u05E1\u05D5\u05D9 \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    gapAnalysis: "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05E4\u05E2\u05E8\u05D9\u05DD",
    mostNeededTexts: "\u05D8\u05E7\u05E1\u05D8\u05D9\u05DD \u05D7\u05E1\u05E8\u05D9\u05DD \u05D1\u05D9\u05D5\u05EA\u05E8",
    sourceAttribution: "\u05D9\u05D9\u05D7\u05D5\u05E1 \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA",
    categories: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA",

    historicalAnalysis: "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9",
    analysisTitle: "\u05D0\u05D9\u05DA \u05D4\u05EA\u05E4\u05EA\u05D7\u05D4 \u05D4\u05DC\u05DE\u05D3\u05E0\u05D5\u05EA",
    analysisSubtitle: "\u05D7\u05E7\u05D5\u05E8 \u05DB\u05D9\u05E6\u05D3 \u05D4\u05EA\u05E4\u05EA\u05D7\u05D4 \u05D4\u05D4\u05D1\u05E0\u05D4 \u05D4\u05D4\u05DC\u05DB\u05EA\u05D9\u05EA \u05DC\u05D0\u05D5\u05E8\u05DA \u05D4\u05D3\u05D5\u05E8\u05D5\u05EA",
    analysisCTA: "\u05E0\u05EA\u05D7",
    analysisPlaceholder: "\u05D4\u05DB\u05E0\u05E1 \u05E0\u05D5\u05E9\u05D0 \u05D4\u05DC\u05DB\u05EA\u05D9 \u05DC\u05DE\u05E2\u05E7\u05D1...",
    correctionChain: "\u05E9\u05E8\u05E9\u05E8\u05EA \u05D4\u05EA\u05E4\u05EA\u05D7\u05D5\u05EA",
    originalClaim: "\u05E2\u05DE\u05D3\u05D4 \u05DE\u05E7\u05D5\u05E8\u05D9\u05EA",
    correction: "\u05D4\u05EA\u05E4\u05EA\u05D7\u05D5\u05EA \u05DE\u05D0\u05D5\u05D7\u05E8\u05D5\u05EA",
    confidence: "\u05E8\u05DE\u05EA \u05D1\u05D9\u05D8\u05D7\u05D5\u05DF",
    established: "\u05DE\u05D1\u05D5\u05E1\u05E1",
    debated: "\u05E9\u05E0\u05D5\u05D9 \u05D1\u05DE\u05D7\u05DC\u05D5\u05E7\u05EA",
    uncertain: "\u05DC\u05D0 \u05D5\u05D3\u05D0\u05D9",

    discovery: "\u05D2\u05D9\u05DC\u05D5\u05D9\u05D9\u05DD",
    discoveryTitle: "\u05DE\u05E0\u05D5\u05E2 \u05D2\u05D9\u05DC\u05D5\u05D9\u05D9\u05DD \u05D7\u05D3\u05E9\u05E0\u05D9",
    discoverySubtitle: "\u05D2\u05DC\u05D4 \u05D3\u05E4\u05D5\u05E1\u05D9\u05DD \u05E0\u05E1\u05EA\u05E8\u05D9\u05DD, \u05E7\u05E9\u05E8\u05D9\u05DD \u05D5\u05EA\u05D5\u05D1\u05E0\u05D5\u05EA \u05D1\u05E7\u05D5\u05E8\u05E4\u05D5\u05E1 \u05D4\u05D4\u05DC\u05DB\u05EA\u05D9",
    undiscoveredConnections: "\u05E7\u05E9\u05E8\u05D9\u05DD \u05E0\u05E1\u05EA\u05E8\u05D9\u05DD",
    consensusMapping: "\u05DE\u05D9\u05E4\u05D5\u05D9 \u05E7\u05D5\u05E0\u05E1\u05E0\u05D6\u05D5\u05E1",
    whatIf: "\u05DE\u05D4 \u05D0\u05DD?",
    crossCommunity: "\u05E1\u05D9\u05E0\u05EA\u05D6\u05D4 \u05D1\u05D9\u05DF-\u05E7\u05D4\u05D9\u05DC\u05EA\u05D9\u05EA",
    discoverPlaceholder: "\u05D4\u05DB\u05E0\u05E1 \u05E9\u05D0\u05DC\u05D4 \u05D0\u05D5 \u05E0\u05D5\u05E9\u05D0...",
    discoverCTA: "\u05D2\u05DC\u05D4",
    citations: "\u05DE\u05E8\u05D0\u05D9 \u05DE\u05E7\u05D5\u05DE\u05D5\u05EA",

    switchLanguage: "\u05D4\u05D7\u05DC\u05E3 \u05E9\u05E4\u05D4",
    english: "\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA",
    hebrew: "\u05E2\u05D1\u05E8\u05D9\u05EA",
  },
};
