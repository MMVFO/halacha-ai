"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type DiscoveryMode = "connections" | "consensus" | "whatif" | "cross_community" | "unanswerable" | "patterns" | "lost_context" | "paper";

interface SourceRef {
  id: number;
  work: string;
  sectionRef: string;
  era: string | null;
  community: string;
}

const TABS: { id: DiscoveryMode; label: string; icon?: string; emoji?: string; placeholder: string }[] = [
  {
    id: "connections",
    label: "Undiscovered Connections",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    placeholder: "Enter a concept to find hidden parallels across distant works...",
  },
  {
    id: "consensus",
    label: "Consensus Mapping",
    icon: "M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3",
    placeholder: "Enter a halakhic question to map the spectrum of opinions...",
  },
  {
    id: "whatif",
    label: "What If?",
    icon: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01",
    placeholder: "Describe a modern scenario to trace applicable precedents...",
  },
  {
    id: "cross_community",
    label: "Cross-Community",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    placeholder: "Enter a topic to compare Ashkenazi and Sephardi approaches...",
  },
  {
    id: "unanswerable",
    label: "Unanswerable",
    emoji: "\u2753",
    placeholder: "Enter an unresolved question (teku, open machloket)...",
  },
  {
    id: "patterns",
    label: "Pattern Detection",
    emoji: "\uD83D\uDD0D",
    placeholder: "Describe a halakhic reasoning pattern to search for...",
  },
  {
    id: "lost_context",
    label: "Lost Context",
    emoji: "\uD83D\uDD0E",
    placeholder: "Paste a cryptic or terse passage...",
  },
  {
    id: "paper",
    label: "Paper Draft",
    emoji: "\uD83D\uDCDD",
    placeholder: "Enter a thesis or research question...",
  },
];

function noveltyColor(n: string) {
  switch (n) {
    case "high": return "#4ade80";
    case "medium": return "#fbbf24";
    case "low": return "#9ca3af";
    default: return "#9ca3af";
  }
}

function stancePosition(stance: string): number {
  switch (stance) {
    case "most_lenient": return 0;
    case "lenient": return 25;
    case "moderate": return 50;
    case "stringent": return 75;
    case "most_stringent": return 100;
    default: return 50;
  }
}

function relationshipColor(rel: string): string {
  switch (rel) {
    case "convergent": return "#4ade80";
    case "divergent": return "#f87171";
    case "parallel": return "#60a5fa";
    case "unique": return "#c084fc";
    default: return "#9ca3af";
  }
}

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState<DiscoveryMode>("connections");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleDiscover() {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSources([]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: activeTab, query: query.trim() }),
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
            // partial chunk
          }
        }
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Could not parse discovery response");
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Discovery failed");
    } finally {
      setLoading(false);
    }
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="discovery-page">
      <div className="discovery-header">
        <div className="discovery-header-left">
          <Link href="/" className="corpus-back-link" aria-label="Back to home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="discovery-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 14.14 14.14" />
                <path d="M12 2a10 10 0 0 0 0 20" />
              </svg>
              Novel Discovery Engine
            </h1>
            <p className="discovery-subtitle">
              Uncover hidden patterns, connections, and insights across the halakhic corpus
            </p>
          </div>
        </div>
      </div>

      <div className="discovery-content">
        {/* Tab bar */}
        <div className="discovery-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`discovery-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
                setError("");
              }}
            >
              {tab.icon ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
              ) : (
                <span style={{ fontSize: 14, lineHeight: 1 }}>{tab.emoji}</span>
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="discovery-search glass-card">
          <div className="discovery-search-inner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="analysis-search-input"
              placeholder={currentTab.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
              disabled={loading}
            />
            <button
              className="btn-primary"
              onClick={handleDiscover}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="pane-spinner" />
                  Discovering...
                </>
              ) : (
                "Discover"
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="analysis-loading">
            <div className="analysis-loading-content">
              <div className="talmud-loading-spinner" />
              <p>Searching the corpus for novel insights...</p>
              <p className="analysis-loading-sub">Analyzing patterns across eras and communities</p>
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
          <div className="discovery-results fade-in">
            {/* Summary */}
            <div className="discovery-summary glass-card">
              <p className="discovery-summary-text">{(result as Record<string, unknown>).summary as string}</p>
            </div>

            {/* Connections mode */}
            {activeTab === "connections" && Array.isArray((result as Record<string, unknown>).discoveries) && (
              <div className="discovery-items">
                {((result as Record<string, unknown>).discoveries as Array<Record<string, unknown>>).map((d, i) => (
                  <div key={i} className="discovery-connection glass-card glass-card-hover">
                    <div className="discovery-connection-header">
                      <h3 className="discovery-connection-title">{d.title as string}</h3>
                      <span className="discovery-novelty" style={{ color: noveltyColor(d.novelty as string), borderColor: noveltyColor(d.novelty as string) }}>
                        {(d.novelty as string || "").toUpperCase()} NOVELTY
                      </span>
                    </div>
                    <p className="discovery-connection-desc">{d.description as string}</p>
                    <div className="discovery-connection-sources">
                      {[d.source_a, d.source_b].map((src, j) => {
                        const s = src as Record<string, string>;
                        return s ? (
                          <div key={j} className="discovery-source-card">
                            <div className="discovery-source-header">
                              <span className="discovery-source-work">{s.work}</span>
                              <span className="discovery-source-era">{s.era}</span>
                            </div>
                            <span className="discovery-source-ref">{s.ref}</span>
                            {s.excerpt && <p className="discovery-source-excerpt">{s.excerpt}</p>}
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="discovery-insight">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a4 4 0 0 0-4 4c0 2 1.5 3.5 3 4.5V12h2v-1.5c1.5-1 3-2.5 3-4.5a4 4 0 0 0-4-4z" />
                        <path d="M9 18h6M10 22h4M12 12v4" />
                      </svg>
                      {d.insight as string}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Consensus mode */}
            {activeTab === "consensus" && Array.isArray((result as Record<string, unknown>).spectrum) && (
              <div className="discovery-items">
                <div className="discovery-spectrum glass-card">
                  <div className="discovery-spectrum-bar">
                    <span className="discovery-spectrum-label-left">Lenient</span>
                    <div className="discovery-spectrum-track">
                      {((result as Record<string, unknown>).spectrum as Array<Record<string, unknown>>).map((pos, i) => (
                        <div
                          key={i}
                          className="discovery-spectrum-dot"
                          style={{ left: `${stancePosition(pos.stance as string)}%` }}
                          title={pos.position as string}
                        />
                      ))}
                    </div>
                    <span className="discovery-spectrum-label-right">Stringent</span>
                  </div>
                </div>
                {((result as Record<string, unknown>).spectrum as Array<Record<string, unknown>>).map((pos, i) => (
                  <div key={i} className="discovery-consensus-item glass-card glass-card-hover">
                    <div className="discovery-consensus-header">
                      <span className="discovery-consensus-stance" style={{
                        color: pos.stance === "moderate" ? "#fbbf24" : (pos.stance as string || "").includes("lenient") ? "#4ade80" : "#f87171",
                      }}>
                        {(pos.stance as string || "").replace(/_/g, " ").toUpperCase()}
                      </span>
                      {!!pos.is_majority && <span className="discovery-majority-badge">Majority View</span>}
                    </div>
                    <p className="discovery-consensus-position">{pos.position as string}</p>
                    <div className="discovery-consensus-meta">
                      <div className="discovery-consensus-authorities">
                        {Array.isArray(pos.authorities) && (pos.authorities as string[]).map((a, j) => (
                          <span key={j} className="discovery-authority-tag">{a}</span>
                        ))}
                      </div>
                      <p className="discovery-consensus-reasoning">{pos.reasoning as string}</p>
                      {Array.isArray(pos.communities) && (pos.communities as string[]).length > 0 && (
                        <div className="discovery-consensus-communities">
                          Followed by: {(pos.communities as string[]).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!!(result as Record<string, unknown>).practical_note && (
                  <div className="discovery-practical-note glass-card">
                    <strong>Practical Note:</strong> {String((result as Record<string, unknown>).practical_note)}
                  </div>
                )}
              </div>
            )}

            {/* What If mode */}
            {activeTab === "whatif" && (
              <div className="discovery-items">
                {Array.isArray((result as Record<string, unknown>).precedents) && (
                  <div className="discovery-whatif-section glass-card">
                    <h3 className="discovery-section-heading">Applicable Precedents</h3>
                    {((result as Record<string, unknown>).precedents as Array<Record<string, unknown>>).map((p, i) => (
                      <div key={i} className="discovery-precedent-item">
                        <div className="discovery-precedent-header">
                          <span className="discovery-precedent-principle">{p.principle as string}</span>
                          <span className="discovery-precedent-type">{(p.reasoning_type as string || "").replace(/_/g, " ")}</span>
                        </div>
                        <div className="discovery-precedent-source">{p.source as string} ({p.authority as string})</div>
                        <p className="discovery-precedent-application">{p.application as string}</p>
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).approaches) && (
                  <div className="discovery-whatif-section glass-card">
                    <h3 className="discovery-section-heading">Possible Approaches</h3>
                    {((result as Record<string, unknown>).approaches as Array<Record<string, unknown>>).map((a, i) => (
                      <div key={i} className="discovery-approach-item glass-card-hover">
                        <div className="discovery-approach-header">
                          <span className="discovery-approach-name">{a.perspective as string}</span>
                        </div>
                        <p className="discovery-approach-ruling">{a.ruling as string}</p>
                        <p className="discovery-approach-basis">{a.basis as string}</p>
                        {Array.isArray(a.likely_authorities) && (
                          <div className="discovery-consensus-authorities">
                            {(a.likely_authorities as string[]).map((auth, j) => (
                              <span key={j} className="discovery-authority-tag">{auth}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!!(result as Record<string, unknown>).unresolved && (
                  <div className="discovery-practical-note glass-card">
                    <strong>Unresolved:</strong> {String((result as Record<string, unknown>).unresolved)}
                  </div>
                )}
              </div>
            )}

            {/* Cross-Community mode */}
            {activeTab === "cross_community" && Array.isArray((result as Record<string, unknown>).comparisons) && (
              <div className="discovery-items">
                {((result as Record<string, unknown>).comparisons as Array<Record<string, unknown>>).map((comp, i) => {
                  const ashk = comp.ashkenazi as Record<string, string> | null;
                  const seph = comp.sephardi as Record<string, string> | null;
                  return (
                    <div key={i} className="discovery-comparison glass-card glass-card-hover">
                      <div className="discovery-comparison-header">
                        <h3 className="discovery-comparison-aspect">{comp.aspect as string}</h3>
                        <span className="discovery-comparison-rel" style={{ color: relationshipColor(comp.relationship as string) }}>
                          {(comp.relationship as string || "").toUpperCase()}
                        </span>
                      </div>
                      <div className="discovery-comparison-sides">
                        <div className="discovery-comparison-side discovery-side-ashkenazi">
                          <div className="discovery-side-label">Ashkenazi</div>
                          {ashk && (
                            <>
                              <p className="discovery-side-position">{ashk.position}</p>
                              <span className="discovery-side-authority">{ashk.key_authority}</span>
                              <span className="discovery-side-source">{ashk.source}</span>
                            </>
                          )}
                        </div>
                        <div className="discovery-comparison-divider" />
                        <div className="discovery-comparison-side discovery-side-sephardi">
                          <div className="discovery-side-label">Sephardi</div>
                          {seph && (
                            <>
                              <p className="discovery-side-position">{seph.position}</p>
                              <span className="discovery-side-authority">{seph.key_authority}</span>
                              <span className="discovery-side-source">{seph.source}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!!comp.reason_for_difference && (
                        <div className="discovery-comparison-reason">
                          <strong>Reason:</strong> {String(comp.reason_for_difference)}
                        </div>
                      )}
                      {!!comp.modern_trend && (
                        <div className="discovery-comparison-trend">
                          <strong>Modern trend:</strong> {String(comp.modern_trend)}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!!(result as Record<string, unknown>).synthesis && (
                  <div className="discovery-practical-note glass-card">
                    <strong>Synthesis:</strong> {String((result as Record<string, unknown>).synthesis)}
                  </div>
                )}
              </div>
            )}

            {/* Unanswerable mode */}
            {activeTab === "unanswerable" && result && (
              <div className="discovery-items">
                {!!(result as Record<string, unknown>).question && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Original Question</div>
                    <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.6 }}>{String((result as Record<string, unknown>).question)}</p>
                  </div>
                )}
                {!!(result as Record<string, unknown>).proposed_resolution && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Proposed Resolution</h3>
                    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7 }}>{String((result as Record<string, unknown>).proposed_resolution)}</p>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).source_chain) && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Source Chain</h3>
                    <div className="discovery-source-chain">
                      {((result as Record<string, unknown>).source_chain as Array<Record<string, string>>).map((s, i) => (
                        <div key={i} className="discovery-source-chain-item">
                          <div className="discovery-source-chain-dot" />
                          <div className="discovery-source-chain-content">
                            <span className="discovery-source-work">{s.source}</span>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0" }}>{s.text}</p>
                            <span style={{ fontSize: 11, color: "var(--gold)", fontStyle: "italic" }}>{s.relevance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!!(result as Record<string, unknown>).confidence && (
                  <div className="glass-card" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Confidence</span>
                    <span className="discovery-novelty" style={{
                      color: noveltyColor((result as Record<string, unknown>).confidence as string),
                      borderColor: noveltyColor((result as Record<string, unknown>).confidence as string),
                    }}>
                      {String((result as Record<string, unknown>).confidence).toUpperCase()}
                    </span>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).caveats) && ((result as Record<string, unknown>).caveats as string[]).length > 0 && (
                  <div className="glass-card discovery-caveats">
                    <h3 className="discovery-section-heading">Caveats</h3>
                    <ul>
                      {((result as Record<string, unknown>).caveats as string[]).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).remaining_uncertainties) && (
                  <div className="discovery-practical-note glass-card">
                    <strong>Remaining Uncertainties:</strong> {((result as Record<string, unknown>).remaining_uncertainties as string[]).join("; ")}
                  </div>
                )}
              </div>
            )}

            {/* Patterns mode */}
            {activeTab === "patterns" && result && (
              <div className="discovery-items">
                {!!(result as Record<string, unknown>).pattern_name && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 style={{ fontSize: 16, color: "var(--gold)", marginBottom: 6 }}>{String((result as Record<string, unknown>).pattern_name)}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{String((result as Record<string, unknown>).description)}</p>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).instances) && (
                  <div className="discovery-items">
                    {((result as Record<string, unknown>).instances as Array<Record<string, string>>).map((inst, i) => (
                      <div key={i} className="glass-card glass-card-hover" style={{ padding: "14px 18px" }}>
                        <div className="discovery-connection-header">
                          <span className="discovery-source-work">{inst.source}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <span className="discovery-source-era">{inst.era}</span>
                            <span className="discovery-authority-tag">{inst.community}</span>
                          </div>
                        </div>
                        <p className="discovery-source-excerpt" style={{ margin: "8px 0" }}>{inst.excerpt}</p>
                        <span className="discovery-precedent-type">{(inst.reasoning_type || "").replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!!(result as Record<string, unknown>).frequency && (
                  <div className="glass-card" style={{ padding: "12px 20px" }}>
                    <strong style={{ color: "var(--gold)" }}>Frequency:</strong> <span style={{ color: "var(--text-secondary)" }}>{String((result as Record<string, unknown>).frequency)}</span>
                  </div>
                )}
                {!!(result as Record<string, unknown>).evolution && (
                  <div className="discovery-practical-note glass-card">
                    <strong>Evolution:</strong> {String((result as Record<string, unknown>).evolution)}
                  </div>
                )}
              </div>
            )}

            {/* Lost Context mode */}
            {activeTab === "lost_context" && result && (
              <div className="discovery-items">
                {!!(result as Record<string, unknown>).original_passage && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Original Passage</div>
                    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, fontStyle: "italic" }}>{String((result as Record<string, unknown>).original_passage)}</p>
                  </div>
                )}
                {!!(result as Record<string, unknown>).historical_context && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Historical Context</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{String((result as Record<string, unknown>).historical_context)}</p>
                  </div>
                )}
                {!!(result as Record<string, unknown>).likely_reasoning && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Likely Reasoning</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{String((result as Record<string, unknown>).likely_reasoning)}</p>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).supporting_sources) && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Supporting Sources</h3>
                    <div className="discovery-source-chain">
                      {((result as Record<string, unknown>).supporting_sources as Array<Record<string, string>>).map((s, i) => (
                        <div key={i} className="discovery-source-chain-item">
                          <div className="discovery-source-chain-dot" />
                          <div className="discovery-source-chain-content">
                            <span className="discovery-source-work">{s.source}</span>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0" }}>{s.text}</p>
                            <span style={{ fontSize: 11, color: "var(--gold)", fontStyle: "italic" }}>{s.connection}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).alternative_interpretations) && ((result as Record<string, unknown>).alternative_interpretations as string[]).length > 0 && (
                  <div className="glass-card discovery-caveats">
                    <h3 className="discovery-section-heading">Alternative Interpretations</h3>
                    <ul>
                      {((result as Record<string, unknown>).alternative_interpretations as string[]).map((alt, i) => (
                        <li key={i}>{typeof alt === "string" ? alt : String(alt)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!(result as Record<string, unknown>).confidence && (
                  <div className="glass-card" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Confidence</span>
                    <span className="discovery-novelty" style={{
                      color: noveltyColor((result as Record<string, unknown>).confidence as string),
                      borderColor: noveltyColor((result as Record<string, unknown>).confidence as string),
                    }}>
                      {String((result as Record<string, unknown>).confidence).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Paper Draft mode */}
            {activeTab === "paper" && result && (
              <div className="discovery-items">
                {!!(result as Record<string, unknown>).title && (
                  <div className="glass-card" style={{ padding: "20px 24px", textAlign: "center" }}>
                    <h2 style={{ fontSize: 20, color: "var(--gold)", fontFamily: "var(--font-serif)", fontWeight: 600 }}>{String((result as Record<string, unknown>).title)}</h2>
                  </div>
                )}
                {!!(result as Record<string, unknown>).abstract && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Abstract</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>{String((result as Record<string, unknown>).abstract)}</p>
                  </div>
                )}
                {!!(result as Record<string, unknown>).methodology_note && (
                  <div className="glass-card" style={{ padding: "12px 20px" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Methodology:</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 8 }}>{String((result as Record<string, unknown>).methodology_note)}</span>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).sections) && (
                  ((result as Record<string, unknown>).sections as Array<Record<string, unknown>>).map((sec, i) => (
                    <div key={i} className="discovery-paper-section glass-card">
                      <h3 style={{ fontSize: 15, color: "var(--gold)", marginBottom: 10, fontFamily: "var(--font-serif)" }}>{sec.heading as string}</h3>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{sec.content as string}</p>
                      {Array.isArray(sec.citations) && (sec.citations as Array<Record<string, string>>).length > 0 && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {(sec.citations as Array<Record<string, string>>).map((cit, j) => (
                            <div key={j} style={{ fontSize: 12, color: "var(--text-muted)", padding: "2px 0" }}>
                              <span style={{ color: "var(--gold)" }}>{cit.source}:</span> {cit.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {!!(result as Record<string, unknown>).conclusion && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Conclusion</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{String((result as Record<string, unknown>).conclusion)}</p>
                  </div>
                )}
                {Array.isArray((result as Record<string, unknown>).bibliography) && (
                  <div className="glass-card" style={{ padding: "16px 20px" }}>
                    <h3 className="discovery-section-heading">Bibliography</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {((result as Record<string, unknown>).bibliography as string[]).map((b, i) => (
                        <li key={i} style={{ fontSize: 12, color: "var(--text-muted)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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
                      <span className="analysis-source-community">{s.community}</span>
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
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 14.14 14.14" />
              <path d="M12 2a10 10 0 0 0 0 20" />
            </svg>
            <h3>{currentTab.label}</h3>
            <p>
              {activeTab === "connections" && "Find hidden thematic parallels across distant works separated by era, genre, or community."}
              {activeTab === "consensus" && "Map the full spectrum of halakhic opinions from most lenient to most stringent on any question."}
              {activeTab === "whatif" && "Trace applicable precedents for new modern situations using traditional halakhic reasoning."}
              {activeTab === "cross_community" && "Compare how Ashkenazi and Sephardi traditions converge and diverge on any topic."}
              {activeTab === "unanswerable" && "Attempt to resolve teku questions and open machlokot by searching the full corpus for overlooked source combinations."}
              {activeTab === "patterns" && "Detect recurring halakhic reasoning patterns across centuries and communities."}
              {activeTab === "lost_context" && "Reconstruct the likely context and reasoning behind cryptic or terse passages."}
              {activeTab === "paper" && "Generate structured Torah scholarship paper drafts with sources and bibliography."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
