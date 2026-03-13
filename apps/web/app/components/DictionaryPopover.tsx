"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import { useAppStore } from "../store";
import { MorphologyDisplay } from "./MorphologyDisplay";

interface DictionaryEntry {
  id: number;
  word: string;
  word_normalized: string;
  language: string;
  definition: string;
  root: string | null;
  part_of_speech: string | null;
  source: string;
}

interface DictionaryResult {
  entries: DictionaryEntry[];
  frequency: number;
  related?: DictionaryEntry[];
}

interface CategoryFrequency {
  category: string;
  count: number;
}

// Helper: wraps Hebrew/Aramaic text so each word is a clickable span
export function wrapTextWithClickableWords(
  text: string,
  language: string,
  onClick: (word: string, element: HTMLElement) => void
): ReactNode[] {
  if (language !== "he" && language !== "arc") {
    return [text];
  }

  // Split on whitespace, preserving punctuation grouping
  const tokens = text.split(/(\s+)/);
  return tokens.map((token, i) => {
    if (/^\s+$/.test(token)) {
      return <span key={i}>{token}</span>;
    }
    // Strip punctuation for the lookup word but display the full token
    const cleanWord = token.replace(/[^\u0590-\u05FF\u0600-\u06FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g, "");
    if (!cleanWord) {
      return <span key={i}>{token}</span>;
    }
    return (
      <span
        key={i}
        onClick={(e) => onClick(cleanWord, e.currentTarget)}
        style={{
          cursor: "pointer",
          borderRadius: 2,
          transition: "background 0.15s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {token}
      </span>
    );
  });
}

// Pinned Definitions Sidebar
export function PinnedDefinitionsSidebar() {
  const pinned = useAppStore((s) => s.pinnedDefinitions);
  const unpinDefinition = useAppStore((s) => s.unpinDefinition);
  const clearPinned = useAppStore((s) => s.clearPinnedDefinitions);

  if (pinned.length === 0) return null;

  return (
    <div className="pinned-sidebar">
      <div className="pinned-sidebar-header">
        <span className="pinned-sidebar-title">Pinned Definitions</span>
        <button onClick={clearPinned} className="pinned-sidebar-clear" title="Clear all">
          Clear
        </button>
      </div>
      <div className="pinned-sidebar-list">
        {pinned.map((p) => (
          <div key={p.word} className="pinned-sidebar-item">
            <div className="pinned-sidebar-item-header">
              <span
                className="pinned-sidebar-word"
                style={{ direction: "rtl", fontFamily: "'Noto Serif Hebrew', serif" }}
              >
                {p.word}
              </span>
              {p.root && (
                <span className="pinned-sidebar-root">
                  {p.root}
                </span>
              )}
              <button
                onClick={() => unpinDefinition(p.word)}
                className="pinned-sidebar-unpin"
                title="Unpin"
              >
                x
              </button>
            </div>
            <div className="pinned-sidebar-def">{p.definition}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DictionaryPopover() {
  const word = useAppStore((s) => s.dictionaryWord);
  const setWord = useAppStore((s) => s.setDictionaryWord);
  const pinDefinition = useAppStore((s) => s.pinDefinition);
  const pinnedDefinitions = useAppStore((s) => s.pinnedDefinitions);

  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [frequencies, setFrequencies] = useState<CategoryFrequency[]>([]);
  const [activeTab, setActiveTab] = useState<"definition" | "morphology" | "frequency" | "related">("definition");

  const popoverRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: !!word,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
    elements: { reference: anchorEl },
  });

  // Fetch dictionary data when word changes
  useEffect(() => {
    if (!word) {
      setResult(null);
      setError(null);
      setFrequencies([]);
      setActiveTab("definition");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/dictionary?word=${encodeURIComponent(word)}`, { signal: controller.signal }).then((r) => r.json()),
      fetch(`/api/dictionary/frequency?word=${encodeURIComponent(word)}`, { signal: controller.signal })
        .then((r) => r.json())
        .catch(() => ({ frequencies: [] })),
    ])
      .then(([dictData, freqData]) => {
        if (dictData.error) {
          setError(dictData.error);
        } else {
          setResult(dictData);
        }
        setFrequencies(freqData.frequencies || []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to look up word");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [word]);

  // Close on click outside
  useEffect(() => {
    if (!word) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setWord(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [word, setWord]);

  // Close on Escape
  useEffect(() => {
    if (!word) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWord(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [word, setWord]);

  // Public method for the reader to set both the word and the anchor element
  const openForWord = useCallback(
    (w: string, el: HTMLElement) => {
      setAnchorEl(el);
      setWord(w);
    },
    [setWord]
  );

  // Expose via window for reader integration
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__openDictionary = openForWord;
    return () => {
      delete (window as unknown as Record<string, unknown>).__openDictionary;
    };
  }, [openForWord]);

  if (!word) return null;

  const primaryEntry = result?.entries?.[0] ?? null;
  const isPinned = pinnedDefinitions.some((p) => p.word === word);

  // Related terms: use API-provided related entries (same root), fall back to alternate entries
  const relatedTerms: { word: string; definition: string; relation: string }[] = [];
  if (result?.related && result.related.length > 0) {
    result.related.slice(0, 5).forEach((e) => {
      relatedTerms.push({
        word: e.word,
        definition: e.definition.slice(0, 80) + (e.definition.length > 80 ? "..." : ""),
        relation: e.root && primaryEntry?.root && e.root === primaryEntry.root ? "Same root" : "Derived form",
      });
    });
  } else if (result?.entries && result.entries.length > 1) {
    result.entries.slice(1, 5).forEach((e) => {
      relatedTerms.push({
        word: e.word,
        definition: e.definition.slice(0, 80) + (e.definition.length > 80 ? "..." : ""),
        relation: "Related form",
      });
    });
  }

  // Frequency chart max
  const maxFreqCount = Math.max(1, ...frequencies.map((f) => f.count));

  const TABS = [
    { key: "definition" as const, label: "Def" },
    { key: "morphology" as const, label: "Morph" },
    { key: "frequency" as const, label: "Freq" },
    { key: "related" as const, label: "Related" },
  ];

  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
        refs.setFloating(node);
      }}
      style={{
        ...floatingStyles,
        zIndex: 9998,
        width: 380,
        background: "rgba(14, 18, 32, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(212, 175, 55, 0.15)",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(212, 175, 55, 0.04)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Noto Serif Hebrew', serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#d4af37",
              direction: "rtl",
              lineHeight: 1.3,
            }}
          >
            {word}
          </div>
          {primaryEntry?.part_of_speech && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: 100,
                color: "#a78bfa",
                display: "inline-block",
                marginTop: 4,
              }}
            >
              {primaryEntry.part_of_speech}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* Pin button */}
          {primaryEntry && (
            <button
              onClick={() => {
                if (!isPinned) {
                  pinDefinition({
                    word,
                    definition: primaryEntry.definition,
                    root: primaryEntry.root,
                    language: primaryEntry.language,
                  });
                }
              }}
              title={isPinned ? "Already pinned" : "Pin to sidebar"}
              style={{
                background: isPinned ? "rgba(212, 175, 55, 0.15)" : "transparent",
                border: isPinned ? "1px solid rgba(212, 175, 55, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                color: isPinned ? "#d4af37" : "rgba(255, 255, 255, 0.4)",
                cursor: isPinned ? "default" : "pointer",
                fontSize: 13,
                padding: "3px 8px",
                borderRadius: 6,
                lineHeight: 1,
                transition: "all 0.2s",
              }}
            >
              {isPinned ? "Pinned" : "Pin"}
            </button>
          )}
          <button
            onClick={() => setWord(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              fontSize: 16,
              padding: 2,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dict-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`dict-tab ${activeTab === tab.key ? "dict-tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px 16px", maxHeight: 340, overflowY: "auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 24,
                height: 24,
                border: "2px solid rgba(255, 255, 255, 0.1)",
                borderTopColor: "#d4af37",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        )}

        {error && !loading && (
          <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>
        )}

        {result && !loading && (
          <>
            {/* Definition Tab */}
            {activeTab === "definition" && (
              <>
                {result.entries.length === 0 ? (
                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13 }}>
                    No dictionary entries found.
                  </div>
                ) : (
                  result.entries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        marginBottom: 12,
                        paddingBottom: 12,
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      {/* Root / POS row */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        {entry.root && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              background: "rgba(212, 175, 55, 0.1)",
                              border: "1px solid rgba(212, 175, 55, 0.2)",
                              borderRadius: 100,
                              color: "#d4af37",
                              fontFamily: "'Noto Serif Hebrew', serif",
                            }}
                          >
                            Root: {entry.root}
                          </span>
                        )}
                      </div>
                      {/* Definition */}
                      <div
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: "rgba(255, 255, 255, 0.85)",
                        }}
                      >
                        {entry.definition}
                      </div>
                    </div>
                  ))
                )}

                {/* Simple frequency bar */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", marginBottom: 6 }}>
                    Found in {result.frequency.toLocaleString()} passages
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min((result.frequency / 1000) * 100, 100)}%`,
                        background: "linear-gradient(90deg, #d4af37, #f5d76e)",
                        borderRadius: 2,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Morphology Tab */}
            {activeTab === "morphology" && primaryEntry && (
              <MorphologyDisplay
                word={word}
                knownRoot={primaryEntry.root}
                partOfSpeech={primaryEntry.part_of_speech}
                language={primaryEntry.language}
              />
            )}
            {activeTab === "morphology" && !primaryEntry && (
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13 }}>
                No morphological data available.
              </div>
            )}

            {/* Frequency Tab — mini bar chart */}
            {activeTab === "frequency" && (
              <div>
                <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", marginBottom: 12 }}>
                  Occurrences across corpus categories
                </div>
                {frequencies.length === 0 ? (
                  <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 13 }}>Loading frequency data...</div>
                ) : (
                  <div className="freq-chart">
                    {frequencies.map((f) => (
                      <div key={f.category} className="freq-chart-row">
                        <span className="freq-chart-label">{f.category}</span>
                        <div className="freq-chart-bar-bg">
                          <div
                            className="freq-chart-bar-fill"
                            style={{ width: `${maxFreqCount > 0 ? (f.count / maxFreqCount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="freq-chart-count">{f.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Related Tab */}
            {activeTab === "related" && (
              <div>
                {relatedTerms.length === 0 ? (
                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13 }}>
                    No related terms found.
                  </div>
                ) : (
                  relatedTerms.map((rt, i) => (
                    <div key={i} className="related-term-item">
                      <div className="related-term-header">
                        <span
                          className="related-term-word"
                          style={{ fontFamily: "'Noto Serif Hebrew', serif", direction: "rtl" }}
                        >
                          {rt.word}
                        </span>
                        <span className="related-term-relation">{rt.relation}</span>
                      </div>
                      <div className="related-term-def">{rt.definition}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
