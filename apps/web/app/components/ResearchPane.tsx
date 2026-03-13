"use client";

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

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
}

interface TOCEntry {
  section_ref: string;
  parent_ref: string | null;
}

export interface ResearchPaneHandle {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  getContext: () => { work: string; section: string; text: string } | null;
  loadWork: (work: string, section: string) => void;
}

interface ResearchPaneProps {
  paneId: string;
  onRemove: (id: string) => void;
  isSynced?: boolean;
  onSyncToggle?: (id: string) => void;
  showSyncButton?: boolean;
}

function langLabel(lang: string) {
  switch (lang) {
    case "he": return "\u05E2\u05D1\u05E8\u05D9\u05EA";
    case "en": return "English";
    case "arc": return "\u05D0\u05E8\u05DE\u05D9\u05EA";
    default: return lang;
  }
}

export const ResearchPane = forwardRef<ResearchPaneHandle, ResearchPaneProps>(
  function ResearchPane({ paneId, onRemove, isSynced, onSyncToggle, showSyncButton }, ref) {
    const [works, setWorks] = useState<WorkSummary[]>([]);
    const [worksSearch, setWorksSearch] = useState("");
    const [selectedWork, setSelectedWork] = useState<string | null>(null);
    const [toc, setToc] = useState<TOCEntry[]>([]);
    const [tocIndex, setTocIndex] = useState(0);
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [langFilter, setLangFilter] = useState<"all" | "he" | "en" | "arc">("all");
    const [showWorkPicker, setShowWorkPicker] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollRef,
      getContext: () => {
        if (!selectedWork || chunks.length === 0) return null;
        const section = toc[tocIndex]?.section_ref || "";
        const text = chunks.map((c) => c.text).join("\n\n").slice(0, 2000);
        return { work: selectedWork, section, text };
      },
      loadWork: (work: string, section: string) => {
        setSelectedWork(work);
        // Section will be loaded once TOC is fetched
        if (section) {
          const idx = toc.findIndex((t) => t.section_ref === section);
          if (idx >= 0) setTocIndex(idx);
        }
      },
    }));

    // Fetch works list
    const fetchWorks = useCallback(async (search?: string) => {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("limit", "50");
        const res = await fetch(`/api/reader/works?${params}`);
        if (res.ok) {
          const data = await res.json();
          setWorks(data.works || []);
        }
      } catch { /* ignore */ }
    }, []);

    useEffect(() => {
      fetchWorks();
    }, [fetchWorks]);

    useEffect(() => {
      const timer = setTimeout(() => fetchWorks(worksSearch || undefined), 300);
      return () => clearTimeout(timer);
    }, [worksSearch, fetchWorks]);

    // Fetch TOC when work selected
    useEffect(() => {
      if (!selectedWork) { setToc([]); return; }
      (async () => {
        try {
          const res = await fetch(`/api/reader/works?work=${encodeURIComponent(selectedWork)}`);
          if (res.ok) {
            const data = await res.json();
            setToc(data.sections || []);
            setTocIndex(0);
          }
        } catch { /* ignore */ }
      })();
    }, [selectedWork]);

    // Fetch text for current section
    useEffect(() => {
      if (!selectedWork) { setChunks([]); return; }
      const section = toc[tocIndex]?.section_ref;
      (async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({ work: selectedWork, limit: "50" });
          if (section) params.set("section", section);
          if (langFilter !== "all") params.set("language", langFilter);
          const res = await fetch(`/api/reader/text?${params}`);
          if (res.ok) {
            const data = await res.json();
            setChunks(data.chunks || []);
          }
        } catch { /* ignore */ }
        setLoading(false);
      })();
    }, [selectedWork, toc, tocIndex, langFilter]);

    const goToSection = (dir: -1 | 1) => {
      setTocIndex((prev) => Math.max(0, Math.min(toc.length - 1, prev + dir)));
    };

    return (
      <div className="research-pane">
        {/* Pane header */}
        <div className="pane-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            {/* Work selector */}
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <button
                onClick={() => setShowWorkPicker(!showWorkPicker)}
                className="pane-work-selector"
                title={selectedWork || "Select a work"}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedWork || "Select work..."}
                </span>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path d="M8 11L3 6h10z" />
                </svg>
              </button>

              {showWorkPicker && (
                <div className="pane-work-dropdown">
                  <input
                    className="pane-work-search"
                    value={worksSearch}
                    onChange={(e) => setWorksSearch(e.target.value)}
                    placeholder="Search works..."
                    autoFocus
                  />
                  <div className="pane-work-list">
                    {works.map((w) => (
                      <button
                        key={w.work}
                        className={`pane-work-item ${selectedWork === w.work ? "active" : ""}`}
                        onClick={() => {
                          setSelectedWork(w.work);
                          setShowWorkPicker(false);
                          setWorksSearch("");
                        }}
                      >
                        <span className="pane-work-item-name">{w.work}</span>
                        <span className="pane-work-item-meta">
                          {langLabel(w.language)} &middot; {w.chunk_count}
                        </span>
                      </button>
                    ))}
                    {works.length === 0 && (
                      <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                        No works found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language toggle */}
            <div style={{ display: "flex", gap: 2 }}>
              {(["all", "he", "en", "arc"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLangFilter(l)}
                  className={`pane-lang-btn ${langFilter === l ? "active" : ""}`}
                  title={l === "all" ? "All languages" : langLabel(l)}
                >
                  {l === "all" ? "All" : l === "he" ? "\u05E2" : l === "arc" ? "\u05D0" : "En"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {showSyncButton && (
              <button
                onClick={() => onSyncToggle?.(paneId)}
                className={`pane-sync-btn ${isSynced ? "active" : ""}`}
                title={isSynced ? "Scrolling synced" : "Click to sync scroll"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isSynced ? (
                    <>
                      <rect x="3" y="11" width="18" height="2" rx="1" />
                      <path d="M12 3v6M12 15v6" />
                      <path d="M9 6l3-3 3 3M9 18l3 3 3-3" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="8" y2="12" />
                      <line x1="16" y1="12" x2="21" y2="12" />
                      <circle cx="12" cy="12" r="2" />
                    </>
                  )}
                </svg>
              </button>
            )}
            <button
              onClick={() => onRemove(paneId)}
              className="pane-close-btn"
              title="Remove pane"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Section nav */}
        {selectedWork && toc.length > 0 && (
          <div className="pane-section-nav">
            <button
              onClick={() => goToSection(-1)}
              disabled={tocIndex === 0}
              className="pane-nav-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="pane-section-label" title={toc[tocIndex]?.section_ref}>
              {toc[tocIndex]?.section_ref || "..."}
            </div>
            <button
              onClick={() => goToSection(1)}
              disabled={tocIndex >= toc.length - 1}
              className="pane-nav-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <span className="pane-section-count">
              {tocIndex + 1} / {toc.length}
            </span>
          </div>
        )}

        {/* Text content */}
        <div className="pane-content" ref={scrollRef}>
          {!selectedWork && (
            <div className="pane-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 12 }}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <div>Select a work to begin reading</div>
            </div>
          )}

          {loading && (
            <div className="pane-loading">
              <div className="pane-spinner" />
              <span>Loading text...</span>
            </div>
          )}

          {!loading && selectedWork && chunks.length === 0 && (
            <div className="pane-empty">
              <div>No text found for this section</div>
            </div>
          )}

          {!loading && chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="pane-chunk"
              dir={chunk.language === "he" || chunk.language === "arc" ? "rtl" : "ltr"}
              style={{
                fontFamily: chunk.language === "he" || chunk.language === "arc"
                  ? "'Noto Serif Hebrew', var(--font-serif)"
                  : "var(--font-serif)",
              }}
            >
              <div className="pane-chunk-ref">{chunk.section_ref}</div>
              <div className="pane-chunk-text">{chunk.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
