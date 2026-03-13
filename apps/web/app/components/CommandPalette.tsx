"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useHotkeys } from "react-hotkeys-hook";
import { useAppStore } from "../store";

interface WorkResult {
  work: string;
  language: string;
  corpus_tier: string;
  chunk_count: number;
}

export default function CommandPalette() {
  const router = useRouter();
  const { cmdkOpen, setCmdkOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setCmdkOpen(!cmdkOpen);
  }, { enableOnFormTags: true });

  // Search works with debounce
  const searchWorks = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/reader/works?search=${encodeURIComponent(q)}&limit=12`);
        const data = await res.json();
        setResults(data.works || []);
      } catch { /* ignore */ }
      setLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    searchWorks(query);
  }, [query, searchWorks]);

  // Reset on close
  useEffect(() => {
    if (!cmdkOpen) {
      setQuery("");
      setResults([]);
    }
  }, [cmdkOpen]);

  if (!cmdkOpen) return null;

  function navigateToWork(work: string) {
    setCmdkOpen(false);
    router.push(`/reader?work=${encodeURIComponent(work)}`);
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "min(20vh, 160px)",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={() => setCmdkOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 20px",
        }}
      >
        <Command
          className="cmdk-root"
          shouldFilter={false}
          onKeyDown={(e) => {
            if (e.key === "Escape") setCmdkOpen(false);
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search texts, navigate..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: 16,
              }}
            />
            <kbd style={{
              fontSize: 11,
              color: "var(--text-muted)",
              background: "var(--bg-glass)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 4,
              padding: "2px 6px",
            }}>
              ESC
            </kbd>
          </div>

          <Command.List style={{
            maxHeight: 380,
            overflow: "auto",
            padding: 8,
          }}>
            {loading && (
              <Command.Loading>
                <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                  Searching...
                </div>
              </Command.Loading>
            )}

            <Command.Empty style={{ padding: "20px 16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              {query ? "No results found" : "Type to search texts..."}
            </Command.Empty>

            {/* Quick actions */}
            {!query && (
              <Command.Group heading="Quick Actions">
                <Command.Item
                  value="ai-research"
                  onSelect={() => { setCmdkOpen(false); router.push("/halacha"); }}
                  className="cmdk-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <span>AI Research</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>/halacha</span>
                </Command.Item>
                <Command.Item
                  value="text-library"
                  onSelect={() => { setCmdkOpen(false); router.push("/reader"); }}
                  className="cmdk-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span>Text Library</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>/reader</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Search results */}
            {results.length > 0 && (
              <Command.Group heading="Texts">
                {results.map((w) => (
                  <Command.Item
                    key={`${w.work}-${w.language}`}
                    value={w.work}
                    onSelect={() => navigateToWork(w.work)}
                    className="cmdk-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {w.work}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: tierColor(w.corpus_tier),
                      flexShrink: 0,
                    }}>
                      {w.corpus_tier}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                      {w.chunk_count.toLocaleString()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
