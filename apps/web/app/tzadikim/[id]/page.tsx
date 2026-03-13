"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Rabbi {
  id: number;
  name_en: string;
  name_he: string | null;
  era: string | null;
  generation: string | null;
  community: string;
  birth_year: string | null;
  death_year: string | null;
  location: string | null;
  bio: string | null;
}

interface RabbiWork {
  id: number;
  rabbi_id: number;
  work_name: string;
  chunk_count: number;
}

interface Chunk {
  id: number;
  work: string;
  section_ref: string;
  language: string;
  text: string;
  era: string | null;
  community: string;
  corpus_tier: string;
}

function eraColor(era: string | null): string {
  switch (era) {
    case "Tanna": return "#4ade80";
    case "Amora": return "#60a5fa";
    case "Gaon": return "#c084fc";
    case "Rishon": return "#fbbf24";
    case "Acharon": return "#f97316";
    case "Modern": return "#22d3ee";
    default: return "#9ca3af";
  }
}

function lifespan(birth: string | null, death: string | null): string {
  if (!birth && !death) return "";
  const b = birth?.startsWith("-") ? `${birth.slice(1)} BCE` : (birth ?? "?");
  const d = death === "" ? "present" : (death ?? "?");
  return `${b} – ${d}`;
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

export default function RabbiProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [rabbi, setRabbi] = useState<Rabbi | null>(null);
  const [works, setWorks] = useState<RabbiWork[]>([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [recentChunks, setRecentChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI panel
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rabbis?id=${id}`);
      if (!res.ok) {
        setError("Scholar not found.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRabbi(data.rabbi);
      setWorks(data.works || []);
      setChunkCount(data.chunkCount || 0);
      setRecentChunks(data.recentChunks || []);
    } catch {
      setError("Failed to load profile.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleAiAsk() {
    if (!aiQuestion.trim() || !rabbi) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/halacha/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `According to ${rabbi.name_en}: ${aiQuestion}`,
          mode: "deep_research",
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "No answer generated.");
    } catch {
      setAiAnswer("Failed to get a response. Please try again.");
    }
    setAiLoading(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid var(--border-subtle)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading profile...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !rabbi) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#128214;</div>
          <div style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 24 }}>
            {error || "Scholar not found."}
          </div>
          <Link href="/tzadikim" className="btn-ghost" style={{ textDecoration: "none" }}>
            Back to Tzadikim
          </Link>
        </div>
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
          <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <Link href="/tzadikim" style={{
              textDecoration: "none", color: "var(--text-muted)",
              fontFamily: "var(--font-sans)", fontWeight: 500,
            }}>
              Tzadikim
            </Link>
            <span style={{ color: "var(--text-muted)" }}>&#8250;</span>
            <span style={{ color: "var(--gold)", fontFamily: "var(--font-serif)" }}>
              {rabbi.name_en}
            </span>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 80px" }}>
        <div className="fade-in" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Hero */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                {/* Name icon */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${eraColor(rabbi.era)}22, ${eraColor(rabbi.era)}44)`,
                  border: `2px solid ${eraColor(rabbi.era)}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontFamily: "'Noto Serif Hebrew', serif",
                  color: eraColor(rabbi.era), flexShrink: 0,
                }}>
                  {rabbi.name_he?.[0] || rabbi.name_en[0]}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 style={{
                    fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 600,
                    color: "var(--text-primary)", margin: 0, lineHeight: 1.2,
                  }}>
                    {rabbi.name_en}
                  </h1>
                  {rabbi.name_he && (
                    <div style={{
                      fontFamily: "'Noto Serif Hebrew', serif", fontSize: 22,
                      color: "var(--gold)", direction: "rtl", marginTop: 4,
                    }}>
                      {rabbi.name_he}
                    </div>
                  )}

                  {/* Badges row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {rabbi.era && (
                      <span style={{
                        fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                        color: eraColor(rabbi.era),
                        background: `${eraColor(rabbi.era)}18`,
                        padding: "3px 12px", borderRadius: 100,
                        border: `1px solid ${eraColor(rabbi.era)}33`,
                      }}>
                        {rabbi.era}
                      </span>
                    )}
                    {rabbi.generation && (
                      <span style={{
                        fontSize: 12, color: "var(--text-secondary)",
                        background: "var(--bg-glass)", padding: "3px 12px",
                        borderRadius: 100, border: "1px solid var(--border-subtle)",
                      }}>
                        {rabbi.generation}
                      </span>
                    )}
                    {rabbi.community !== "General" && (
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: "var(--gold)",
                        background: "var(--gold-dim)",
                        padding: "3px 12px", borderRadius: 100,
                        border: "1px solid var(--border-accent)",
                      }}>
                        {rabbi.community}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                    {(rabbi.birth_year || rabbi.death_year) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {lifespan(rabbi.birth_year, rabbi.death_year)}
                      </div>
                    )}
                    {rabbi.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {rabbi.location}
                      </div>
                    )}
                    {chunkCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {chunkCount.toLocaleString()} source passages
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {rabbi.bio && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
                }}>
                  Biography
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: 15,
                  lineHeight: 1.85, color: "var(--text-primary)",
                }}>
                  {rabbi.bio}
                </div>
              </div>
            )}

            {/* Works */}
            {works.length > 0 && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16,
                }}>
                  Major Works
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {works.map((w) => (
                    <div key={w.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px",
                      background: "var(--bg-glass)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span style={{
                        fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600,
                        color: "var(--text-primary)", flex: 1,
                      }}>
                        {w.work_name}
                      </span>
                      {w.chunk_count > 0 && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {w.chunk_count.toLocaleString()} chunks
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent passages */}
            {recentChunks.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16,
                }}>
                  Passages by this Author
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentChunks.map((c) => (
                    <div key={c.id} style={{
                      background: "var(--bg-glass)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700, color: "var(--gold)",
                          fontFamily: "var(--font-serif)",
                        }}>
                          {c.section_ref}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.work}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                          color: tierColor(c.corpus_tier),
                          background: `${tierColor(c.corpus_tier)}18`,
                          padding: "1px 6px", borderRadius: 100, marginLeft: "auto",
                        }}>
                          {c.corpus_tier}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7,
                        fontFamily: c.language === "he" || c.language === "arc"
                          ? "'Noto Serif Hebrew', var(--font-serif)"
                          : "var(--font-serif)",
                        direction: c.language === "he" || c.language === "arc" ? "rtl" : "ltr",
                        textAlign: c.language === "he" || c.language === "arc" ? "right" : "left",
                      }}>
                        {c.text.length > 300 ? c.text.slice(0, 300) + "..." : c.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div style={{
            width: 300, flexShrink: 0,
            position: "sticky", top: 80, alignSelf: "flex-start",
          }}>
            {/* Ask AI */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
              }}>
                Ask about {rabbi.name_en.split(" ")[0]}
              </div>
              {!aiOpen ? (
                <button
                  onClick={() => setAiOpen(true)}
                  className="btn-primary"
                  style={{ width: "100%", fontSize: 14, padding: "10px 20px" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Ask about {rabbi.name_en.split("(")[0].trim().split(" ").pop()}
                </button>
              ) : (
                <div>
                  <textarea
                    placeholder={`What did ${rabbi.name_en.split("(")[0].trim().split(" ").pop()} say about...`}
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="input-field"
                    rows={3}
                    style={{ marginBottom: 8, fontSize: 14 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiAsk();
                      }
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleAiAsk}
                      className="btn-primary"
                      disabled={aiLoading || !aiQuestion.trim()}
                      style={{ flex: 1, fontSize: 13, padding: "8px 16px" }}
                    >
                      {aiLoading ? "Researching..." : "Ask"}
                    </button>
                    <button
                      onClick={() => { setAiOpen(false); setAiAnswer(""); setAiQuestion(""); }}
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: "8px 12px" }}
                    >
                      Close
                    </button>
                  </div>
                  {aiAnswer && (
                    <div style={{
                      marginTop: 12, padding: 14,
                      background: "var(--bg-glass)", border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 13, lineHeight: 1.7, color: "var(--text-primary)",
                      whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto",
                    }}>
                      {aiAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
              }}>
                Quick Info
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                {rabbi.era && (
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Era: </span>
                    <span style={{ color: eraColor(rabbi.era), fontWeight: 600 }}>{rabbi.era}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Community: </span>
                  <span style={{ color: "var(--text-secondary)" }}>{rabbi.community}</span>
                </div>
                {(rabbi.birth_year || rabbi.death_year) && (
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Lifespan: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{lifespan(rabbi.birth_year, rabbi.death_year)}</span>
                  </div>
                )}
                {rabbi.location && (
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Location: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{rabbi.location}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Works: </span>
                  <span style={{ color: "var(--text-secondary)" }}>{works.length}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Source passages: </span>
                  <span style={{ color: "var(--text-secondary)" }}>{chunkCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
              }}>
                Navigation
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Link
                  href="/tzadikim"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", fontSize: 13, textDecoration: "none" }}
                >
                  &#8592; All Tzadikim
                </Link>
                <Link
                  href="/reader"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", fontSize: 13, textDecoration: "none" }}
                >
                  &#128214; Library
                </Link>
                <Link
                  href="/halacha"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", fontSize: 13, textDecoration: "none" }}
                >
                  &#128269; AI Research
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
