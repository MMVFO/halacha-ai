"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useHotkeys } from "react-hotkeys-hook";
import { ExplainButton } from "../components/ExplainModal";
import { useAppStore } from "../store";

// --- Types ---

interface WorkSummary {
  work: string;
  language: string;
  community: string;
  corpus_tier: string;
  author: string | null;
  era: string | null;
  chunk_count: number;
}

interface Chunk {
  id: number;
  work: string;
  section_ref: string;
  parent_ref: string | null;
  language: string;
  text: string;
  author: string | null;
  era: string | null;
  community: string;
  corpus_tier: string;
  tags: string[];
  topics: string[];
}

interface TOCEntry {
  section_ref: string;
  parent_ref: string | null;
}

interface CategoryInfo {
  name: string;
  count: number;
  works_sample: string[];
}

type View = "library" | "toc" | "reader";
type SortMode = "chunks-desc" | "alpha-asc" | "alpha-desc" | "era";
type LibraryViewMode = "list" | "grid";

// --- Helpers ---

function langLabel(lang: string) {
  switch (lang) {
    case "he": return "\u05E2\u05D1\u05E8\u05D9\u05EA";
    case "en": return "English";
    case "arc": return "\u05D0\u05E8\u05DE\u05D9\u05EA";
    default: return lang;
  }
}

function tierColor(tier: string) {
  switch (tier) {
    case "canonical": return "#4ade80";
    case "apocrypha": return "#fbbf24";
    case "pseudepigrapha": return "#c084fc";
    case "academic": return "#60a5fa";
    default: return "#9ca3af";
  }
}

const ERA_ORDER: Record<string, number> = {
  "Tannaitic": 1, "Amoraic": 2, "Geonic": 3, "Rishonim": 4, "Acharonim": 5, "Modern": 6,
};

// --- Inline footnote / cross-ref pattern detection ---

const CROSS_REF_RE = /\b((?:Gen(?:esis)?|Exod(?:us)?|Lev(?:iticus)?|Num(?:bers)?|Deut(?:eronomy)?|Ps(?:alm(?:s)?)?|Prov(?:erbs)?|Isa(?:iah)?|Jer(?:emiah)?|Ezek(?:iel)?|Mishnah|Berakhot|Shabbat|Pesachim|Sanhedrin|Bava Kamma|Bava Metzia|Bava Batra|Kiddushin|Gittin|Ketubot|Chullin|Niddah)\.?\s+\d+(?:[.:]\d+(?:[a-b])?)?)/g;

function renderTextWithCrossRefs(
  text: string,
  work: string,
  onCrossRefClick: (sectionRef: string, work: string) => void,
): React.ReactNode {
  const parts: Array<string | { ref: string; key: number }> = [];
  let lastIndex = 0;
  let keyCounter = 0;
  const regex = new RegExp(CROSS_REF_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ ref: match[1], key: keyCounter++ });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  if (parts.length <= 1) return text;

  return parts.map((part) => {
    if (typeof part === "string") return part;
    return (
      <span
        key={part.key}
        className="cross-ref-indicator"
        onClick={(e) => {
          e.stopPropagation();
          onCrossRefClick(part.ref, work);
        }}
        title={"View cross-references for " + part.ref}
      >
        {part.ref}
        <span className="cross-ref-count">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </span>
      </span>
    );
  });
}

// --- CrossRef Tooltip ---

function CrossRefTooltip({ sectionRef, work, onClose }: {
  sectionRef: string;
  work: string;
  onClose: () => void;
}) {
  const [refs, setRefs] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/reader/text?crossRef=${encodeURIComponent(sectionRef)}&crossRefWork=${encodeURIComponent(work)}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((d) => { setRefs(d.references || []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => abort.abort();
  }, [sectionRef, work]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          maxWidth: 600,
          maxHeight: "70vh",
          overflow: "auto",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--gold)", margin: 0 }}>
            Cross-References
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20,
          }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Other texts referencing: <strong style={{ color: "var(--text-secondary)" }}>{sectionRef}</strong>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Searching references...</div>
        ) : refs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No cross-references found</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {refs.map((r) => (
              <div key={r.id} style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-serif)" }}>
                    {r.section_ref}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.work}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {r.text.length > 200 ? r.text.slice(0, 200) + "..." : r.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Reader Page ---

export default function ReaderPage() {
  const [view, setView] = useState<View>("library");
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [worksTotal, setWorksTotal] = useState(0);
  const [worksOffset, setWorksOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [worksLoading, setWorksLoading] = useState(false);
  const [worksLoadingMore, setWorksLoadingMore] = useState(false);

  // TOC state
  const [selectedWork, setSelectedWork] = useState<string>("");
  const [toc, setToc] = useState<TOCEntry[]>([]);
  const [tocLoading, setTocLoading] = useState(false);

  // Reader state
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [readingSection, setReadingSection] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [readerLoading, setReaderLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  // Cross-ref tooltip
  const [crossRef, setCrossRef] = useState<{ sectionRef: string; work: string } | null>(null);

  // Zustand store
  const { fontSize, setFontSize, languageFilter, setLanguageFilter } = useAppStore();

  // Library view mode & sorting
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>("list");
  const [sortMode, setSortMode] = useState<SortMode>("chunks-desc");

  // Category state
  const [categories, setCategories] = useState<{ tiers: CategoryInfo[]; eras: CategoryInfo[]; communities: CategoryInfo[] } | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<{ type: "tier" | "era" | "community"; name: string } | null>(null);

  // Virtual scrolling ref for library
  const libraryScrollRef = useRef<HTMLDivElement>(null);

  // Search debounce
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debouncedSearch = useCallback((q: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchWorks(q, langFilter);
    }, 300);
  }, [langFilter]);

  const WORKS_PAGE_SIZE = 200;

  // Fetch works (reset or load more)
  async function fetchWorks(search?: string, language?: string, append = false) {
    if (append) {
      setWorksLoadingMore(true);
    } else {
      setWorksLoading(true);
      setWorksOffset(0);
    }
    const newOffset = append ? worksOffset + WORKS_PAGE_SIZE : 0;
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (language) params.set("language", language);
      params.set("limit", String(WORKS_PAGE_SIZE));
      params.set("offset", String(newOffset));
      const res = await fetch(`/api/reader/works?${params}`);
      const data = await res.json();
      if (append) {
        setWorks((prev) => [...prev, ...(data.works || [])]);
      } else {
        setWorks(data.works || []);
      }
      setWorksTotal(data.total || 0);
      setWorksOffset(newOffset);
    } catch { /* ignore */ }
    setWorksLoading(false);
    setWorksLoadingMore(false);
  }

  // Fetch TOC
  async function fetchTOC(work: string) {
    setTocLoading(true);
    setSelectedWork(work);
    setView("toc");
    try {
      const res = await fetch(`/api/reader/works?work=${encodeURIComponent(work)}`);
      const data = await res.json();
      setToc(data.sections || []);
    } catch { /* ignore */ }
    setTocLoading(false);
  }

  // Fetch text
  async function fetchText(work: string, section?: string, append = false) {
    setReaderLoading(true);
    if (!append) {
      setChunks([]);
      setOffset(0);
      setReadingSection(section || "");
      setView("reader");
    }
    const newOffset = append ? offset + 50 : 0;
    try {
      const params = new URLSearchParams({ work, limit: "50", offset: String(newOffset) });
      if (section) params.set("section", section);
      const res = await fetch(`/api/reader/text?${params}`);
      const data = await res.json();
      if (append) {
        setChunks((prev) => [...prev, ...(data.chunks || [])]);
      } else {
        setChunks(data.chunks || []);
      }
      setTotal(data.total || 0);
      setOffset(newOffset);
      setHasMore(data.hasMore || false);
    } catch { /* ignore */ }
    setReaderLoading(false);
  }

  // Fetch categories
  async function fetchCategories() {
    try {
      const res = await fetch("/api/reader/categories");
      const data = await res.json();
      setCategories(data);
    } catch { /* ignore */ }
  }

  // Load works + categories on mount
  useEffect(() => {
    fetchWorks();
    fetchCategories();
  }, []);

  // --- Prev/Next section navigation ---
  const tocSections = useMemo(() => toc.map((e) => e.section_ref), [toc]);

  const currentSectionIndex = useMemo(() => {
    if (!readingSection || tocSections.length === 0) return -1;
    return tocSections.findIndex((s) => s === readingSection);
  }, [readingSection, tocSections]);

  function goToPrevSection() {
    if (currentSectionIndex > 0) {
      fetchText(selectedWork, tocSections[currentSectionIndex - 1]);
    }
  }

  function goToNextSection() {
    if (currentSectionIndex >= 0 && currentSectionIndex < tocSections.length - 1) {
      fetchText(selectedWork, tocSections[currentSectionIndex + 1]);
    }
  }

  // Keyboard shortcuts for prev/next
  useHotkeys("[", (e) => {
    if (view === "reader") { e.preventDefault(); goToPrevSection(); }
  }, { enableOnFormTags: false }, [view, currentSectionIndex, tocSections, selectedWork]);

  useHotkeys("]", (e) => {
    if (view === "reader") { e.preventDefault(); goToNextSection(); }
  }, { enableOnFormTags: false }, [view, currentSectionIndex, tocSections, selectedWork]);

  const hasPrev = currentSectionIndex > 0;
  const hasNext = currentSectionIndex >= 0 && currentSectionIndex < tocSections.length - 1;

  // --- Filter chunks by language ---
  const displayChunks = useMemo(() => {
    if (languageFilter === "all") return chunks;
    return chunks.filter((c) => c.language === languageFilter);
  }, [chunks, languageFilter]);

  // --- Sort and filter works ---
  const sortedWorks = useMemo(() => {
    let filtered = [...works];

    // Apply category filter
    if (activeCategoryFilter) {
      const { type, name } = activeCategoryFilter;
      filtered = filtered.filter((w) => {
        if (type === "tier") return w.corpus_tier === name;
        if (type === "era") return (w.era || "Unknown") === name;
        if (type === "community") return w.community === name;
        return true;
      });
    }

    // Sort
    switch (sortMode) {
      case "alpha-asc":
        filtered.sort((a, b) => a.work.localeCompare(b.work));
        break;
      case "alpha-desc":
        filtered.sort((a, b) => b.work.localeCompare(a.work));
        break;
      case "era":
        filtered.sort((a, b) => {
          const ea = ERA_ORDER[a.era || ""] || 99;
          const eb = ERA_ORDER[b.era || ""] || 99;
          return ea - eb || b.chunk_count - a.chunk_count;
        });
        break;
      case "chunks-desc":
      default:
        filtered.sort((a, b) => b.chunk_count - a.chunk_count);
        break;
    }
    return filtered;
  }, [works, sortMode, activeCategoryFilter]);

  // --- Virtualizer for library ---
  const rowVirtualizer = useVirtualizer({
    count: sortedWorks.length,
    getScrollElement: () => libraryScrollRef.current,
    estimateSize: () => 88,
    overscan: 10,
  });

  // Group TOC into a simple hierarchy
  function groupTOC(entries: TOCEntry[]) {
    const groups = new Map<string, TOCEntry[]>();
    for (const e of entries) {
      const parts = e.section_ref.split(",");
      const groupKey = parts.length > 2 ? parts.slice(0, 2).join(",").trim() : parts[0].trim();
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(e);
    }
    return groups;
  }

  // --- Nav buttons component ---
  function SectionNavButtons({ position }: { position: "top" | "bottom" }) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        ...(position === "bottom" ? { marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" } : {}),
      }}>
        <button
          onClick={goToPrevSection}
          disabled={!hasPrev}
          className="btn-ghost"
          style={{ fontSize: 13, opacity: hasPrev ? 1 : 0.3 }}
          title="Previous section ([)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        {currentSectionIndex >= 0 && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {currentSectionIndex + 1} / {tocSections.length}
          </span>
        )}
        <button
          onClick={goToNextSection}
          disabled={!hasNext}
          className="btn-ghost"
          style={{ fontSize: 13, opacity: hasNext ? 1 : 0.3 }}
          title="Next section (])"
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        background: "rgba(10, 14, 26, 0.85)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600,
              color: "var(--text-primary)",
            }}>
              Halacha <span style={{ color: "var(--gold)" }}>AI</span>
            </span>
          </Link>

          <div style={{
            width: 1, height: 24, background: "var(--border-subtle)",
          }} />

          {/* Breadcrumbs */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <button
              onClick={() => { setView("library"); fetchWorks(searchQuery, langFilter); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: view === "library" ? "var(--gold)" : "var(--text-muted)",
                fontFamily: "var(--font-sans)", fontWeight: 500,
              }}
            >
              Library
            </button>
            {(view === "toc" || view === "reader") && (
              <>
                <span style={{ color: "var(--text-muted)" }}>&rsaquo;</span>
                <button
                  onClick={() => fetchTOC(selectedWork)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: view === "toc" ? "var(--gold)" : "var(--text-muted)",
                    fontFamily: "var(--font-sans)", fontWeight: 500,
                    maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {selectedWork}
                </button>
              </>
            )}
            {view === "reader" && readingSection && (
              <>
                <span style={{ color: "var(--text-muted)" }}>&rsaquo;</span>
                <span style={{ color: "var(--gold)", fontFamily: "var(--font-serif)" }}>
                  {readingSection}
                </span>
              </>
            )}
          </nav>

          <div style={{ flex: 1 }} />

          <Link href="/halacha" style={{
            textDecoration: "none", fontSize: 13, color: "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Research
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 80px" }}>

        {/* === LIBRARY VIEW === */}
        {view === "library" && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <h1 style={{
                fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500,
                color: "var(--text-primary)", margin: 0,
              }}>
                Library
              </h1>
              <span style={{
                fontSize: 13, color: "var(--text-muted)",
                background: "var(--bg-glass)", padding: "4px 12px",
                borderRadius: 100, border: "1px solid var(--border-subtle)",
              }}>
                {activeCategoryFilter
                  ? `${sortedWorks.length.toLocaleString()} of ${worksTotal.toLocaleString()} works`
                  : worksTotal > works.length
                    ? `${works.length.toLocaleString()} of ${worksTotal.toLocaleString()} works`
                    : `${worksTotal.toLocaleString()} works`}
              </span>
            </div>

            {/* Search + Filter + Sort + View Toggle */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search works... (e.g., Mishnah, Zohar, Rambam)"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); debouncedSearch(e.target.value); }}
                  className="input-field"
                  style={{ paddingLeft: 40, height: 44 }}
                />
              </div>
              <select
                value={langFilter}
                onChange={(e) => { setLangFilter(e.target.value); fetchWorks(searchQuery, e.target.value); }}
                className="select-field"
                style={{ width: 140 }}
              >
                <option value="">All Languages</option>
                <option value="he">{"\u05E2\u05D1\u05E8\u05D9\u05EA"} (Hebrew)</option>
                <option value="en">English</option>
                <option value="arc">{"\u05D0\u05E8\u05DE\u05D9\u05EA"} (Aramaic)</option>
              </select>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="select-field"
                style={{ width: 150 }}
              >
                <option value="chunks-desc">By size (largest)</option>
                <option value="alpha-asc">A &rarr; Z</option>
                <option value="alpha-desc">Z &rarr; A</option>
                <option value="era">By era</option>
              </select>
              {/* View mode toggle */}
              <div style={{ display: "flex", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <button
                  onClick={() => setLibraryViewMode("list")}
                  style={{
                    background: libraryViewMode === "list" ? "var(--gold-dim)" : "transparent",
                    border: "none", cursor: "pointer", padding: "8px 12px",
                    color: libraryViewMode === "list" ? "var(--gold)" : "var(--text-muted)",
                  }}
                  title="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={() => setLibraryViewMode("grid")}
                  style={{
                    background: libraryViewMode === "grid" ? "var(--gold-dim)" : "transparent",
                    border: "none", cursor: "pointer", padding: "8px 12px",
                    color: libraryViewMode === "grid" ? "var(--gold)" : "var(--text-muted)",
                  }}
                  title="Category grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category Quick-Filter Grid (always visible) */}
            {categories && (
              <div className="category-quick-grid" style={{ marginBottom: 16 }}>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
                }}>
                  {[
                    { label: "Tanakh", type: "tier" as const, name: "canonical", icon: "\u05EA" },
                    { label: "Mishnah", type: "era" as const, name: "Tannaitic", icon: "\u05DE" },
                    { label: "Talmud", type: "era" as const, name: "Amoraic", icon: "\u05EA" },
                    { label: "Midrash", type: "community" as const, name: "General", icon: "\u05D3" },
                    { label: "Halakhah", type: "tier" as const, name: "canonical", icon: "\u05D4" },
                    { label: "Rishonim", type: "era" as const, name: "Rishonim", icon: "\u05E8" },
                    { label: "Acharonim", type: "era" as const, name: "Acharonim", icon: "\u05D0" },
                    { label: "Modern", type: "era" as const, name: "Modern", icon: "\u05DE" },
                  ].map((cat) => {
                    const isActive = activeCategoryFilter?.type === cat.type && activeCategoryFilter.name === cat.name;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => setActiveCategoryFilter(
                          isActive ? null : { type: cat.type, name: cat.name }
                        )}
                        className="category-chip"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px",
                          fontSize: 12, fontWeight: 600,
                          background: isActive ? "var(--gold-dim)" : "var(--bg-glass)",
                          color: isActive ? "var(--gold)" : "var(--text-secondary)",
                          border: isActive ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
                          borderRadius: 100,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        <span style={{
                          fontFamily: "'Noto Serif Hebrew', var(--font-serif)",
                          fontSize: 14, lineHeight: 1,
                          opacity: 0.7,
                        }}>{cat.icon}</span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active category filter badge */}
            {activeCategoryFilter && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Filtered by:</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600, color: "var(--gold)",
                  background: "var(--gold-dim)", padding: "4px 12px",
                  borderRadius: 100, border: "1px solid var(--border-accent)",
                }}>
                  {activeCategoryFilter.name}
                  <button
                    onClick={() => setActiveCategoryFilter(null)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--gold)", fontSize: 14, lineHeight: 1, padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {/* Category Grid View */}
            {libraryViewMode === "grid" && categories && (
              <div style={{ marginBottom: 24 }}>
                {/* Tiers */}
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
                }}>
                  By Corpus Tier
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 10,
                  marginBottom: 20,
                }}>
                  {categories.tiers.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategoryFilter(
                        activeCategoryFilter?.type === "tier" && activeCategoryFilter.name === cat.name
                          ? null : { type: "tier", name: cat.name }
                      )}
                      className="glass-card glass-card-hover"
                      style={{
                        padding: 16, textAlign: "left", cursor: "pointer",
                        border: activeCategoryFilter?.type === "tier" && activeCategoryFilter.name === cat.name
                          ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
                        background: activeCategoryFilter?.type === "tier" && activeCategoryFilter.name === cat.name
                          ? "var(--gold-dim)" : "var(--bg-card)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                          color: tierColor(cat.name),
                        }}>
                          {cat.name}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                          {cat.count}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {cat.works_sample.slice(0, 3).join(", ")}
                        {cat.count > 3 ? "..." : ""}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Eras */}
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
                }}>
                  By Era
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 10,
                  marginBottom: 20,
                }}>
                  {categories.eras.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategoryFilter(
                        activeCategoryFilter?.type === "era" && activeCategoryFilter.name === cat.name
                          ? null : { type: "era", name: cat.name }
                      )}
                      className="glass-card glass-card-hover"
                      style={{
                        padding: 16, textAlign: "left", cursor: "pointer",
                        border: activeCategoryFilter?.type === "era" && activeCategoryFilter.name === cat.name
                          ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
                        background: activeCategoryFilter?.type === "era" && activeCategoryFilter.name === cat.name
                          ? "var(--gold-dim)" : "var(--bg-card)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {cat.name}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                          {cat.count}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {cat.works_sample.slice(0, 3).join(", ")}
                        {cat.count > 3 ? "..." : ""}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Communities */}
                {categories.communities.length > 0 && (
                  <>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
                    }}>
                      By Community
                    </div>
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20,
                    }}>
                      {categories.communities.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setActiveCategoryFilter(
                            activeCategoryFilter?.type === "community" && activeCategoryFilter.name === cat.name
                              ? null : { type: "community", name: cat.name }
                          )}
                          className="btn-ghost"
                          style={{
                            fontSize: 12,
                            background: activeCategoryFilter?.type === "community" && activeCategoryFilter.name === cat.name
                              ? "var(--gold-dim)" : undefined,
                            color: activeCategoryFilter?.type === "community" && activeCategoryFilter.name === cat.name
                              ? "var(--gold)" : undefined,
                            borderColor: activeCategoryFilter?.type === "community" && activeCategoryFilter.name === cat.name
                              ? "var(--border-accent)" : undefined,
                          }}
                        >
                          {cat.name} ({cat.count})
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Works List (virtualized) */}
            {worksLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                Loading library...
              </div>
            ) : (
              <div
                ref={libraryScrollRef}
                style={{
                  height: Math.min(sortedWorks.length * 88, 700),
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const w = sortedWorks[virtualRow.index];
                    if (!w) return null;
                    return (
                      <div
                        key={`${w.work}-${w.language}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: virtualRow.size,
                          transform: `translateY(${virtualRow.start}px)`,
                          padding: "4px 0",
                        }}
                      >
                        <button
                          onClick={() => fetchTOC(w.work)}
                          className="glass-card glass-card-hover"
                          style={{
                            width: "100%",
                            padding: "14px 18px",
                            textAlign: "left",
                            cursor: "pointer",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-card)",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            height: "100%",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600,
                              color: "var(--text-primary)", marginBottom: 4,
                              lineHeight: 1.3,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {w.work}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                                color: tierColor(w.corpus_tier),
                                background: `${tierColor(w.corpus_tier)}18`,
                                padding: "2px 8px", borderRadius: 100,
                              }}>
                                {w.corpus_tier}
                              </span>
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {langLabel(w.language)}
                              </span>
                              {w.community !== "General" && (
                                <span style={{ fontSize: 12, color: "var(--gold)" }}>{w.community}</span>
                              )}
                              {w.author && (
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {w.author}{w.era ? ` \u00B7 ${w.era}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                            {w.chunk_count.toLocaleString()} sections
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Load More trigger at bottom */}
                {worksTotal > works.length && !activeCategoryFilter && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <button
                      onClick={() => fetchWorks(searchQuery, langFilter, true)}
                      className="btn-ghost"
                      disabled={worksLoadingMore}
                      style={{ fontSize: 14, padding: "10px 32px" }}
                    >
                      {worksLoadingMore
                        ? "Loading..."
                        : `Load more works (${(worksTotal - works.length).toLocaleString()} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* === TABLE OF CONTENTS VIEW === */}
        {view === "toc" && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <h1 style={{
                fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500,
                color: "var(--text-primary)", margin: 0,
              }}>
                {selectedWork}
              </h1>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => fetchText(selectedWork)}
                className="btn-primary"
                style={{ fontSize: 14, padding: "10px 24px" }}
              >
                Read from Beginning
              </button>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                {toc.length.toLocaleString()} sections
              </span>
            </div>

            {tocLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading contents...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[...groupTOC(toc)].map(([group, entries]) => (
                  <div key={group}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "var(--text-secondary)",
                      fontFamily: "var(--font-serif)",
                      padding: "12px 0 6px",
                      borderBottom: "1px solid var(--border-subtle)",
                      marginBottom: 4,
                    }}>
                      {group}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 12 }}>
                      {entries.slice(0, 50).map((e) => {
                        const shortLabel = e.section_ref.split(",").pop()?.trim() || e.section_ref;
                        return (
                          <button
                            key={e.section_ref}
                            onClick={() => fetchText(selectedWork, e.section_ref)}
                            style={{
                              background: "var(--bg-glass)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 10px",
                              fontSize: 12,
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              fontFamily: "var(--font-sans)",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-accent)"; }}
                            onMouseOut={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-subtle)"; }}
                          >
                            {shortLabel}
                          </button>
                        );
                      })}
                      {entries.length > 50 && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 10px" }}>
                          +{entries.length - 50} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === READER VIEW === */}
        {view === "reader" && (
          <div className="fade-in" ref={readerRef}>
            <div style={{ display: "flex", gap: 24 }}>
              {/* Main text column */}
              <div style={{ flex: 1, maxWidth: 800 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
                }}>
                  <h2 style={{
                    fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500,
                    color: "var(--text-primary)", margin: 0,
                  }}>
                    {selectedWork}
                  </h2>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {total.toLocaleString()} sections
                  </span>
                </div>

                {/* Reader toolbar: language toggle, font size, prev/next */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                  marginBottom: 20, padding: "10px 14px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  {/* Language toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {(["he", "en", "all"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguageFilter(lang)}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: languageFilter === lang ? 600 : 400,
                          background: languageFilter === lang ? "var(--gold-dim)" : "transparent",
                          color: languageFilter === lang ? "var(--gold)" : "var(--text-muted)",
                          border: languageFilter === lang ? "1px solid var(--border-accent)" : "1px solid transparent",
                          borderRadius: 100,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {lang === "he" ? "HE" : lang === "en" ? "EN" : "Both"}
                      </button>
                    ))}
                  </div>

                  <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

                  {/* Font size controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))}
                      disabled={fontSize <= 0.8}
                      style={{
                        width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        color: fontSize <= 0.8 ? "var(--text-muted)" : "var(--text-secondary)",
                        cursor: fontSize <= 0.8 ? "not-allowed" : "pointer",
                        fontSize: 16,
                        opacity: fontSize <= 0.8 ? 0.3 : 1,
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", width: 40, textAlign: "center" }}>
                      {fontSize.toFixed(1)}
                    </span>
                    <button
                      onClick={() => setFontSize(Math.min(1.6, fontSize + 0.1))}
                      disabled={fontSize >= 1.6}
                      style={{
                        width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        color: fontSize >= 1.6 ? "var(--text-muted)" : "var(--text-secondary)",
                        cursor: fontSize >= 1.6 ? "not-allowed" : "pointer",
                        fontSize: 16,
                        opacity: fontSize >= 1.6 ? 0.3 : 1,
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

                  {/* Prev / Next */}
                  <SectionNavButtons position="top" />
                </div>

                {chunks.length === 0 && readerLoading ? (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                    <div style={{
                      width: 40, height: 40,
                      border: "3px solid var(--border-subtle)",
                      borderTopColor: "var(--gold)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 16px",
                    }} />
                    Loading text...
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {displayChunks.map((chunk, idx) => {
                      const isNewSection = idx === 0 ||
                        chunk.section_ref.split(",").slice(0, -1).join(",") !==
                        displayChunks[idx - 1].section_ref.split(",").slice(0, -1).join(",");

                      return (
                        <div key={chunk.id}>
                          {/* Section divider */}
                          {isNewSection && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 12,
                              padding: "20px 0 8px",
                              borderTop: idx > 0 ? "1px solid var(--border-subtle)" : "none",
                              marginTop: idx > 0 ? 16 : 0,
                            }}>
                              <button
                                onClick={() => setCrossRef({ sectionRef: chunk.section_ref, work: chunk.work })}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  fontFamily: "var(--font-serif)",
                                  fontSize: 16, fontWeight: 700,
                                  color: "var(--gold)",
                                  textDecoration: "underline",
                                  textDecorationStyle: "dotted",
                                  textDecorationColor: "rgba(212, 175, 55, 0.4)",
                                  textUnderlineOffset: 3,
                                }}
                                title="Click to see cross-references"
                              >
                                {chunk.section_ref}
                              </button>
                              {chunk.community !== "General" && (
                                <span style={{
                                  fontSize: 11, color: "var(--gold)",
                                  background: "var(--gold-dim)",
                                  padding: "2px 8px", borderRadius: 100,
                                }}>
                                  {chunk.community}
                                </span>
                              )}
                              <ExplainButton
                                concept={chunk.section_ref}
                                context="general"
                                sourceWork={chunk.work}
                                surroundingText={chunk.text.slice(0, 300)}
                                style={{ marginLeft: "auto" }}
                              />
                            </div>
                          )}

                          {/* Text body */}
                          <div style={{
                            fontSize: `${fontSize}rem`,
                            lineHeight: 2,
                            color: "var(--text-primary)",
                            fontFamily: chunk.language === "he" || chunk.language === "arc"
                              ? "'Noto Serif Hebrew', var(--font-serif)"
                              : "var(--font-serif)",
                            direction: chunk.language === "he" || chunk.language === "arc" ? "rtl" : "ltr",
                            textAlign: chunk.language === "he" || chunk.language === "arc" ? "right" : "left",
                            padding: "4px 0",
                          }}>
                            {chunk.language === "en"
                              ? renderTextWithCrossRefs(chunk.text, chunk.work, (ref, work) => setCrossRef({ sectionRef: ref, work }))
                              : chunk.text}
                          </div>
                        </div>
                      );
                    })}

                    {/* Load more */}
                    {hasMore && (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <button
                          onClick={() => fetchText(selectedWork, readingSection, true)}
                          className="btn-ghost"
                          disabled={readerLoading}
                          style={{ fontSize: 14 }}
                        >
                          {readerLoading ? "Loading..." : `Load more (${(total - offset - 50).toLocaleString()} remaining)`}
                        </button>
                      </div>
                    )}

                    {/* Bottom nav buttons */}
                    {displayChunks.length > 0 && (
                      <SectionNavButtons position="bottom" />
                    )}
                  </div>
                )}
              </div>

              {/* Side panel - metadata & navigation */}
              <div style={{
                width: 280, flexShrink: 0,
                position: "sticky", top: 80, alignSelf: "flex-start",
              }}>
                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}>
                    About this text
                  </div>
                  {chunks[0] && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Work: </span>
                        <span style={{ color: "var(--text-secondary)" }}>{chunks[0].work}</span>
                      </div>
                      {chunks[0].author && (
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Author: </span>
                          <span style={{ color: "var(--text-secondary)" }}>{chunks[0].author}</span>
                        </div>
                      )}
                      {chunks[0].era && (
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Era: </span>
                          <span style={{ color: "var(--text-secondary)" }}>{chunks[0].era}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Language: </span>
                        <span style={{ color: "var(--text-secondary)" }}>{langLabel(chunks[0].language)}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Community: </span>
                        <span style={{ color: "var(--text-secondary)" }}>{chunks[0].community}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Tier: </span>
                        <span style={{ color: tierColor(chunks[0].corpus_tier) }}>{chunks[0].corpus_tier}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: 16, marginTop: 12 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}>
                    Navigation
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button
                      onClick={() => fetchTOC(selectedWork)}
                      className="btn-ghost"
                      style={{ width: "100%", justifyContent: "flex-start", fontSize: 13 }}
                    >
                      &larr; Table of Contents
                    </button>
                    <button
                      onClick={() => { setView("library"); fetchWorks(); }}
                      className="btn-ghost"
                      style={{ width: "100%", justifyContent: "flex-start", fontSize: 13 }}
                    >
                      &larr; Back to Library
                    </button>
                    <Link
                      href="/halacha"
                      className="btn-ghost"
                      style={{ width: "100%", justifyContent: "flex-start", fontSize: 13, textDecoration: "none" }}
                    >
                      AI Research
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cross-reference tooltip */}
      {crossRef && (
        <CrossRefTooltip
          sectionRef={crossRef.sectionRef}
          work={crossRef.work}
          onClose={() => setCrossRef(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
