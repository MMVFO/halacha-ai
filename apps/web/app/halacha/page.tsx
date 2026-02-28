"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type SearchMode = "practical" | "deep_research" | "posek_view";
type CorpusTier = "canonical" | "apocrypha" | "pseudepigrapha" | "academic";

interface RetrievedSource {
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

interface QueryResponse {
  answer: string;
  sources: RetrievedSource[];
  error?: string;
}

const COMMUNITIES = [
  { value: "General", label: "All Communities" },
  { value: "Ashkenazi", label: "Ashkenazi" },
  { value: "Sephardi", label: "Sephardi" },
  { value: "Chabad", label: "Chabad" },
  { value: "Yemenite", label: "Yemenite" },
];

const MODES: { value: SearchMode; label: string; description: string; icon: string }[] = [
  { value: "practical", label: "Practical", description: "Opinions by sefer, conflicts noted", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { value: "deep_research", label: "Deep Analytic", description: "Sugya map, opinion matrix", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
  { value: "posek_view", label: "Posek View", description: "Shittot table, mar'ei mekomot", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" },
];

const TIERS: { value: CorpusTier; label: string; description: string }[] = [
  { value: "canonical", label: "Canonical", description: "SA, Rambam, MB, Responsa" },
  { value: "apocrypha", label: "Apocrypha", description: "Ben Sira, Maccabees" },
  { value: "pseudepigrapha", label: "Pseudepigrapha", description: "Enoch, Jubilees" },
  { value: "academic", label: "Academic", description: "Modern scholarship" },
];

function tierTagClass(tier: string) {
  switch (tier) {
    case "canonical": return "tag tag-canonical";
    case "apocrypha": return "tag tag-apocrypha";
    case "pseudepigrapha": return "tag tag-pseudepigrapha";
    case "academic": return "tag tag-academic";
    default: return "tag";
  }
}

export default function HalachaPage() {
  const [question, setQuestion] = useState("");
  const [community, setCommunity] = useState("General");
  const [mode, setMode] = useState<SearchMode>("practical");
  const [corpusTiers, setCorpusTiers] = useState<CorpusTier[]>(["canonical"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  function toggleTier(tier: CorpusTier) {
    setCorpusTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/halacha/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, community, mode, corpusTiers }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect to the research service. Ensure the database is running (docker compose up -d) and migrations are applied (pnpm db:migrate).");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (question.trim() && corpusTiers.length > 0 && !loading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(10, 14, 26, 0.85)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}>
              Halacha <span style={{ color: "var(--gold)" }}>AI</span>
            </span>
          </Link>
          <div style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
          }}>
            For learning and research only
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>
        <form onSubmit={handleSubmit}>
          {/* Question input */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What halakhic question would you like to research?"
              rows={4}
              className="input-field"
              style={{
                fontSize: 16,
                fontFamily: "var(--font-serif)",
                lineHeight: 1.8,
                minHeight: 120,
              }}
            />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {navigator?.platform?.includes("Mac") ? "Cmd" : "Ctrl"}+Enter to submit
              </span>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !question.trim() || corpusTiers.length === 0}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(10,14,26,0.2)",
                      borderTopColor: "#0a0e1a",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }} />
                    Researching...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Research
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Mode selection */}
            <div className="glass-card" style={{ padding: 20 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}>
                Research Mode
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: mode === m.value ? "var(--gold-dim)" : "transparent",
                      border: `1px solid ${mode === m.value ? "var(--border-accent)" : "transparent"}`,
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      color: mode === m.value ? "var(--gold)" : "var(--text-secondary)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                      <path d={m.icon} />
                    </svg>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Community + Corpus tiers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}>
                  Community
                </label>
                <select
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="select-field"
                  style={{ width: "100%" }}
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="glass-card" style={{ padding: 20, flex: 1 }}>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}>
                  Corpus
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {TIERS.map((t) => (
                    <label
                      key={t.value}
                      className={`checkbox-label ${corpusTiers.includes(t.value) ? "checked" : ""}`}
                      title={t.description}
                    >
                      <input
                        type="checkbox"
                        checked={corpusTiers.includes(t.value)}
                        onChange={() => toggleTier(t.value)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="glass-card fade-in" style={{
            padding: 20,
            borderColor: "rgba(239, 68, 68, 0.2)",
            background: "rgba(239, 68, 68, 0.05)",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--red-accent)", marginBottom: 4 }}>
                  Connection Error
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="fade-in" style={{ marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{
                width: 40, height: 40,
                border: "3px solid var(--border-subtle)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--text-secondary)" }}>
                Searching halakhic sources...
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                Analyzing {mode === "practical" ? "practical opinions" : mode === "deep_research" ? "sugya structure" : "shittot and precedent"}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="fade-in">
            {/* Answer */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 20, borderColor: "var(--border-accent)" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}>
                  Research Analysis
                </h2>
                <span className={tierTagClass("canonical")} style={{ marginLeft: "auto" }}>
                  {mode === "practical" ? "Practical" : mode === "deep_research" ? "Deep Analytic" : "Posek View"}
                </span>
              </div>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                lineHeight: 1.85,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
              }}>
                {result.answer}
              </div>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                  marginTop: 32,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <h3 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}>
                    Sources
                  </h3>
                  <span style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    background: "var(--bg-glass)",
                    padding: "3px 10px",
                    borderRadius: 100,
                    border: "1px solid var(--border-subtle)",
                  }}>
                    {result.sources.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.sources.map((s, i) => (
                    <div
                      key={s.id}
                      className="glass-card glass-card-hover fade-in"
                      style={{
                        padding: 20,
                        animationDelay: `${i * 30}ms`,
                        borderColor: s.corpusTier !== "canonical" ? "rgba(245, 158, 11, 0.15)" : undefined,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 16,
                              fontWeight: 700,
                              color: "var(--gold)",
                            }}>
                              {s.sectionRef}
                            </span>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                              {s.work}
                            </span>
                          </div>
                          {s.author && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                              {s.author}{s.era ? ` \u00b7 ${s.era}` : ""}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <span className={tierTagClass(s.corpusTier)}>{s.corpusTier}</span>
                          <span className="tag tag-community">{s.community}</span>
                        </div>
                      </div>

                      {s.corpusTier !== "canonical" && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "var(--amber-accent)",
                          fontWeight: 600,
                          marginBottom: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                          Non-canonical — no halachic authority
                        </div>
                      )}

                      <div style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        lineHeight: 1.75,
                        fontFamily: "var(--font-sans)",
                      }}>
                        {s.text.length > 400 ? s.text.slice(0, 400) + "..." : s.text}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state (no query yet) */}
        {!result && !loading && !error && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-muted)",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 16 }}>
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>
              Enter a question to begin your research
            </p>
            <p style={{ fontSize: 13, marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
              Ask about any halakhic topic — Shabbat, kashrut, tefillah, choshen mishpat, and more.
              Sources will be retrieved from the canonical corpus.
            </p>
          </div>
        )}
      </main>

      {/* Spinner keyframe (inline since globals.css might not have it) */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
