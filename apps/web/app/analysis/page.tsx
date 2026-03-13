"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface ChainOriginal {
  author: string;
  era: string;
  source: string;
  position: string;
}

interface ChainDevelopment {
  author: string;
  era: string;
  source: string;
  position: string;
  relationship: string;
}

interface CorrectionChain {
  id: number;
  original: ChainOriginal;
  development: ChainDevelopment;
  confidence: "established" | "debated" | "uncertain";
  significance: string;
}

interface AnalysisResult {
  topic: string;
  summary: string;
  chains: CorrectionChain[];
}

interface SourceRef {
  id: number;
  work: string;
  sectionRef: string;
  era: string | null;
  author: string | null;
}

function confidenceColor(confidence: string): string {
  switch (confidence) {
    case "established": return "#4ade80";
    case "debated": return "#fbbf24";
    case "uncertain": return "#f87171";
    default: return "#9ca3af";
  }
}

function confidenceLabel(confidence: string): string {
  switch (confidence) {
    case "established": return "Established";
    case "debated": return "Debated";
    case "uncertain": return "Uncertain";
    default: return confidence;
  }
}

function relationshipLabel(rel: string): string {
  switch (rel) {
    case "clarifies": return "Clarifies";
    case "extends": return "Extends";
    case "reinterprets": return "Reinterprets";
    case "limits": return "Limits scope";
    case "expands": return "Expands scope";
    default: return rel;
  }
}

export default function AnalysisPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleAnalyze() {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSources([]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "text") {
              accumulated += event.content;
            } else if (event.type === "meta") {
              setSources(event.sources || []);
            }
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      }

      // Parse the accumulated JSON response
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
        setResult(parsed);
      } else {
        throw new Error("Could not parse analysis response");
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div className="analysis-header-left">
          <Link href="/" className="corpus-back-link" aria-label="Back to home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="analysis-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="m2 14 6-6 6 6" />
                <path d="m14 10 4-4 4 4" />
              </svg>
              Where Scholarship Evolved
            </h1>
            <p className="analysis-subtitle">
              Explore how halakhic understanding developed across generations, with later authorities building upon and refining earlier positions
            </p>
          </div>
        </div>
      </div>

      <div className="analysis-content">
        {/* Search input */}
        <div className="analysis-search glass-card">
          <div className="analysis-search-inner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="analysis-search-input"
              placeholder="Enter a halakhic topic or claim to trace its development..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={loading}
            />
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <>
                  <span className="pane-spinner" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
          <div className="analysis-search-hints">
            <span className="analysis-hint" onClick={() => setTopic("Electricity on Shabbat")}>Electricity on Shabbat</span>
            <span className="analysis-hint" onClick={() => setTopic("Kitniyot on Pesach")}>Kitniyot on Pesach</span>
            <span className="analysis-hint" onClick={() => setTopic("Mechitza height requirements")}>Mechitza requirements</span>
            <span className="analysis-hint" onClick={() => setTopic("Definition of muktzeh")}>Definition of muktzeh</span>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="analysis-loading">
            <div className="analysis-loading-content">
              <div className="talmud-loading-spinner" />
              <p>Searching corpus and analyzing development chains...</p>
              <p className="analysis-loading-sub">Cross-referencing positions across Tannaim through modern poskim</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="analysis-error glass-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="analysis-results fade-in">
            {/* Summary */}
            <div className="analysis-summary glass-card">
              <h2 className="analysis-summary-title">
                Analysis: {result.topic}
              </h2>
              <p className="analysis-summary-text">{result.summary}</p>
              <div className="analysis-summary-stats">
                <span className="analysis-summary-stat">
                  <strong>{result.chains.length}</strong> development chains identified
                </span>
                <span className="analysis-summary-stat">
                  <strong>{sources.length}</strong> source texts referenced
                </span>
              </div>
            </div>

            {/* Correction Chains */}
            <div className="analysis-chains">
              {result.chains.map((chain) => (
                <div key={chain.id} className="analysis-chain glass-card glass-card-hover">
                  <div className="analysis-chain-header">
                    <span className="analysis-chain-number">#{chain.id}</span>
                    <span
                      className="analysis-confidence-badge"
                      style={{
                        color: confidenceColor(chain.confidence),
                        borderColor: confidenceColor(chain.confidence),
                        background: `${confidenceColor(chain.confidence)}15`,
                      }}
                    >
                      {confidenceLabel(chain.confidence)}
                    </span>
                    {chain.development.relationship && (
                      <span className="analysis-relationship-tag">
                        {relationshipLabel(chain.development.relationship)}
                      </span>
                    )}
                  </div>

                  <div className="analysis-chain-comparison">
                    {/* Original position */}
                    <div className="analysis-chain-card analysis-chain-original">
                      <div className="analysis-chain-card-header">
                        <span className="analysis-chain-card-label">Original Position</span>
                        <span className="analysis-chain-era">{chain.original.era}</span>
                      </div>
                      <div className="analysis-chain-author">{chain.original.author}</div>
                      <div className="analysis-chain-source">{chain.original.source}</div>
                      <p className="analysis-chain-position">{chain.original.position}</p>
                    </div>

                    {/* Arrow */}
                    <div className="analysis-chain-arrow">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Development */}
                    <div className="analysis-chain-card analysis-chain-development">
                      <div className="analysis-chain-card-header">
                        <span className="analysis-chain-card-label">Later Development</span>
                        <span className="analysis-chain-era">{chain.development.era}</span>
                      </div>
                      <div className="analysis-chain-author">{chain.development.author}</div>
                      <div className="analysis-chain-source">{chain.development.source}</div>
                      <p className="analysis-chain-position">{chain.development.position}</p>
                    </div>
                  </div>

                  <div className="analysis-chain-significance">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a4 4 0 0 0-4 4c0 2 1.5 3.5 3 4.5V12h2v-1.5c1.5-1 3-2.5 3-4.5a4 4 0 0 0-4-4z" />
                      <path d="M9 18h6M10 22h4M12 12v4" />
                    </svg>
                    {chain.significance}
                  </div>
                </div>
              ))}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="analysis-sources glass-card">
                <h3 className="analysis-sources-title">Referenced Sources</h3>
                <div className="analysis-sources-list">
                  {sources.map((s, i) => (
                    <div key={i} className="analysis-source-item">
                      <span className="analysis-source-work">{s.work}</span>
                      <span className="analysis-source-ref">{s.sectionRef}</span>
                      {s.era && <span className="analysis-source-era">{s.era}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="analysis-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="m2 14 6-6 6 6" />
              <path d="m14 10 4-4 4 4" />
            </svg>
            <h3>Trace Halakhic Development</h3>
            <p>Enter a topic to see how understanding evolved from Tannaim through modern poskim, with side-by-side comparison of original positions and later refinements.</p>
          </div>
        )}
      </div>
    </div>
  );
}
