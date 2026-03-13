"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExplainButton } from "../components/ExplainModal";
import SearchFilters, {
  type SearchFilterValues,
} from "../components/SearchFilters";

interface SearchResult {
  id: number;
  work: string;
  sectionRef: string;
  parentRef: string | null;
  community: string;
  corpusTier: string;
  author: string | null;
  era: string | null;
  text: string;
}

interface SimilarResult extends SearchResult {
  distance: number | null;
}

interface HistoryEntry {
  query: string;
  filters?: Record<string, string>;
  resultCount?: number;
  timestamp: number;
}

const CORPUS_TIERS = ["canonical", "apocrypha", "pseudepigrapha", "academic"];

function tierColor(tier: string) {
  switch (tier) {
    case "canonical":
      return "#4ade80";
    case "apocrypha":
      return "#fbbf24";
    case "pseudepigrapha":
      return "#c084fc";
    case "academic":
      return "#60a5fa";
    default:
      return "#9ca3af";
  }
}

export default function SearchPage() {
  const urlParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SearchFilterValues>({
    work: urlParams.get("work") || "",
    category: "",
    era: "",
    community: "",
    author: "",
  });
  const [tierFilters, setTierFilters] = useState<string[]>(["canonical"]);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // Search history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Similar passages modal
  const [similarResults, setSimilarResults] = useState<SimilarResult[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarSource, setSimilarSource] = useState<{
    id: number;
    work: string;
    sectionRef: string;
  } | null>(null);
  const [showSimilarModal, setShowSimilarModal] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load search history on mount
  useEffect(() => {
    fetch("/api/search/history")
      .then((r) => r.json())
      .then((data) => setHistory(data.history || []))
      .catch(() => {});
  }, []);

  // If URL has a work param (from reader), apply it
  useEffect(() => {
    const workParam = urlParams.get("work");
    if (workParam && workParam !== filters.work) {
      setFilters((f) => ({ ...f, work: workParam }));
    }
  }, [urlParams]);

  const doSearch = useCallback(
    async (q: string, append = false) => {
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        setHasSearched(false);
        setShowHistory(true);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setShowHistory(false);
      const newOffset = append ? offset + 40 : 0;

      try {
        const params = new URLSearchParams({
          q,
          limit: "40",
          offset: String(newOffset),
        });
        if (filters.work) params.set("work", filters.work);
        if (filters.era) params.set("era", filters.era);
        if (filters.community) params.set("community", filters.community);
        if (filters.author) params.set("author", filters.author);
        if (tierFilters.length > 0)
          params.set("corpusTier", tierFilters.join(","));

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        const newResults = data.results || [];

        if (append) {
          setResults((prev) => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        setTotal(data.total || 0);
        setOffset(newOffset);

        // Save to history (non-blocking)
        if (!append) {
          fetch("/api/search/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: q,
              filters: {
                work: filters.work,
                era: filters.era,
                community: filters.community,
                author: filters.author,
              },
              resultCount: data.total || 0,
            }),
          })
            .then((r) => r.json())
            .then((data) => setHistory(data.history || []))
            .catch(() => {});
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    },
    [offset, filters, tierFilters],
  );

  const debouncedSearch = useCallback(
    (q: string) => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => doSearch(q), 300);
    },
    [doSearch],
  );

  // Re-search when filters change
  useEffect(() => {
    if (query.trim()) {
      doSearch(query);
    }
  }, [filters, tierFilters]);

  const toggleTier = (tier: string) => {
    setTierFilters((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  };

  // Find similar passages
  const findSimilar = async (chunkId: number) => {
    setSimilarLoading(true);
    setShowSimilarModal(true);
    setSimilarResults([]);
    setSimilarSource(null);

    try {
      const res = await fetch(`/api/search/similar?chunk_id=${chunkId}&limit=10`);
      const data = await res.json();
      if (data.error) {
        console.error("Similar search error:", data.error);
      } else {
        setSimilarResults(data.results || []);
        setSimilarSource(data.source || null);
      }
    } catch {
      /* ignore */
    }
    setSimilarLoading(false);
  };

  // Apply a history entry
  const applyHistoryEntry = (entry: HistoryEntry) => {
    setQuery(entry.query);
    if (entry.filters) {
      setFilters((f) => ({
        ...f,
        work: entry.filters?.work || "",
        era: entry.filters?.era || "",
        community: entry.filters?.community || "",
        author: entry.filters?.author || "",
      }));
    }
    doSearch(entry.query);
  };

  const clearHistory = async () => {
    await fetch("/api/search/history", { method: "DELETE" }).catch(() => {});
    setHistory([]);
  };

  // "Search within" label
  const searchWithinLabel = filters.work ? filters.work : null;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: "rgba(10, 14, 26, 0.85)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Halacha <span style={{ color: "var(--gold)" }}>AI</span>
            </span>
          </Link>
          <div
            style={{
              width: 1,
              height: 24,
              background: "var(--border-subtle)",
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--gold)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Search
          </span>
          <div style={{ flex: 1 }} />
          <Link
            href="/reader"
            style={{
              textDecoration: "none",
              fontSize: 13,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Library
          </Link>
          <Link
            href="/halacha"
            style={{
              textDecoration: "none",
              fontSize: 13,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Research
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 80px" }}>
        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder={
                searchWithinLabel
                  ? `Search within ${searchWithinLabel}...`
                  : "Search halachic texts... (e.g., Shabbat candle lighting, tefillin, mezuzah)"
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                debouncedSearch(e.target.value);
                if (!e.target.value.trim()) setShowHistory(true);
              }}
              onFocus={() => {
                if (!query.trim() && history.length > 0) setShowHistory(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") doSearch(query);
              }}
              className="input-field"
              style={{
                paddingLeft: 48,
                paddingRight: searchWithinLabel ? 140 : 18,
                height: 52,
                fontSize: 16,
                borderRadius: "var(--radius-lg)",
              }}
              autoFocus
            />
            {searchWithinLabel && (
              <button
                className="search-within-badge"
                onClick={() => setFilters((f) => ({ ...f, work: "" }))}
                title="Clear work filter"
              >
                <span style={{ marginRight: 4 }}>in: {searchWithinLabel}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {hasSearched && !loading && (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 8,
              }}
            >
              {total} result{total !== 1 ? "s" : ""} found
              {filters.work && ` in "${filters.work}"`}
              {filters.author && ` by "${filters.author}"`}
              {filters.era && ` (${filters.era})`}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {/* Filter sidebar */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: 80 }}>
              <SearchFilters
                filters={filters}
                onChange={setFilters}
                collapsed={filtersCollapsed}
                onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
              />

              {/* Corpus tier checkboxes */}
              <div
                className="glass-card"
                style={{ padding: 16, marginTop: 12 }}
              >
                <label className="search-filter-label" style={{ marginBottom: 8, display: "block" }}>
                  Corpus Tier
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {CORPUS_TIERS.map((tier) => (
                    <label
                      key={tier}
                      className={`checkbox-label ${tierFilters.includes(tier) ? "checked" : ""}`}
                      style={{ fontSize: 12 }}
                    >
                      <input
                        type="checkbox"
                        checked={tierFilters.includes(tier)}
                        onChange={() => toggleTier(tier)}
                      />
                      <span
                        style={{
                          color: tierFilters.includes(tier)
                            ? tierColor(tier)
                            : "var(--text-secondary)",
                        }}
                      >
                        {tier}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results area */}
          <div style={{ flex: 1 }}>
            {/* Search history (shown when search box is empty) */}
            {showHistory && !hasSearched && history.length > 0 && (
              <div className="search-history-panel glass-card fade-in" style={{ padding: 20, marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Recent Searches
                    </span>
                  </div>
                  <button
                    className="search-filter-clear-btn"
                    onClick={clearHistory}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {history.map((entry, i) => (
                    <button
                      key={`${entry.query}-${entry.timestamp}`}
                      className="search-history-item"
                      onClick={() => applyHistoryEntry(entry)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <span style={{ flex: 1, textAlign: "left" }}>
                        {entry.query}
                      </span>
                      {entry.resultCount !== undefined && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {entry.resultCount} results
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && results.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "var(--text-muted)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "3px solid var(--border-subtle)",
                    borderTopColor: "var(--gold)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                Searching...
              </div>
            ) : !hasSearched && !showHistory ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 80,
                  color: "var(--text-muted)",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: "0 auto 16px", display: "block" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                  }}
                >
                  Search the halachic corpus
                </div>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  Enter a query to search across all texts using hybrid semantic
                  + keyword search
                </div>
              </div>
            ) : results.length === 0 && hasSearched ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: "var(--text-muted)",
                }}
              >
                No results found. Try a different query or adjust your filters.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {results.map((r) => {
                  const isRTL = /[\u0590-\u05FF]/.test(r.text.slice(0, 50));
                  return (
                    <div
                      key={r.id}
                      className="glass-card glass-card-hover fade-in"
                      style={{ padding: 18 }}
                    >
                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--gold)",
                          }}
                        >
                          {r.work}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-serif)",
                          }}
                        >
                          {r.sectionRef}
                        </span>
                        <div style={{ flex: 1 }} />

                        {/* Search within this work */}
                        <button
                          className="search-action-btn"
                          title={`Search within ${r.work}`}
                          onClick={() => {
                            setFilters((f) => ({ ...f, work: r.work }));
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </button>

                        {/* Find similar */}
                        <button
                          className="search-action-btn"
                          title="Find similar passages"
                          onClick={() => findSimilar(r.id)}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        </button>

                        <ExplainButton
                          concept={r.sectionRef}
                          context="general"
                          sourceWork={r.work}
                          surroundingText={r.text.slice(0, 300)}
                        />
                      </div>

                      {/* Text */}
                      <div
                        style={{
                          fontSize: 14,
                          lineHeight: 1.9,
                          color: "var(--text-primary)",
                          fontFamily: isRTL
                            ? "'Noto Serif Hebrew', var(--font-serif)"
                            : "var(--font-serif)",
                          direction: isRTL ? "rtl" : "ltr",
                          textAlign: isRTL ? "right" : "left",
                          marginBottom: 10,
                        }}
                      >
                        {r.text}
                      </div>

                      {/* Tags row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: tierColor(r.corpusTier),
                            background: `${tierColor(r.corpusTier)}18`,
                            padding: "2px 8px",
                            borderRadius: 100,
                          }}
                        >
                          {r.corpusTier}
                        </span>
                        {r.author && (
                          <button
                            className="search-tag-btn"
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                author: r.author || "",
                              }))
                            }
                            title={`Filter by author: ${r.author}`}
                          >
                            {r.author}
                          </button>
                        )}
                        {r.era && (
                          <button
                            className="search-tag-btn tag-era"
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                era: r.era || "",
                              }))
                            }
                            title={`Filter by era: ${r.era}`}
                          >
                            {r.era}
                          </button>
                        )}
                        {r.community !== "General" && (
                          <button
                            className="search-tag-btn tag-community"
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                community: r.community,
                              }))
                            }
                            title={`Filter by community: ${r.community}`}
                          >
                            {r.community}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Load more */}
                {results.length < total && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <button
                      onClick={() => doSearch(query, true)}
                      className="btn-ghost"
                      disabled={loading}
                      style={{ fontSize: 14, padding: "10px 32px" }}
                    >
                      {loading
                        ? "Loading..."
                        : `Load more (${(total - results.length).toLocaleString()} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Similar passages modal */}
      {showSimilarModal && (
        <div
          className="search-modal-overlay"
          onClick={() => setShowSimilarModal(false)}
        >
          <div
            className="search-modal glass-card fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-modal-header">
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Similar Passages
                </div>
                {similarSource && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    Related to{" "}
                    <span style={{ color: "var(--gold)" }}>
                      {similarSource.work} {similarSource.sectionRef}
                    </span>
                  </div>
                )}
              </div>
              <button
                className="search-modal-close"
                onClick={() => setShowSimilarModal(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="search-modal-body">
              {similarLoading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid var(--border-subtle)",
                      borderTopColor: "var(--gold)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Finding similar passages...
                </div>
              ) : similarResults.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  No similar passages found.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {similarResults.map((r) => {
                    const isRTL = /[\u0590-\u05FF]/.test(r.text.slice(0, 50));
                    return (
                      <div
                        key={r.id}
                        className="search-similar-item"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--gold)",
                            }}
                          >
                            {r.work}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {r.sectionRef}
                          </span>
                          <div style={{ flex: 1 }} />
                          {r.era && <span className="tag tag-era">{r.era}</span>}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.8,
                            color: "var(--text-secondary)",
                            fontFamily: isRTL
                              ? "'Noto Serif Hebrew', var(--font-serif)"
                              : "var(--font-serif)",
                            direction: isRTL ? "rtl" : "ltr",
                            textAlign: isRTL ? "right" : "left",
                            maxHeight: 120,
                            overflow: "hidden",
                          }}
                        >
                          {r.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
