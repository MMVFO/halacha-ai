"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { RabbiTimeline } from "../components/RabbiTimeline";
import { RabbiMap } from "../components/RabbiMap";

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
  works_count: number;
}

const ERAS = ["Tanna", "Amora", "Gaon", "Rishon", "Acharon", "Modern"];
const COMMUNITIES = [
  "General", "Ashkenazi", "Sephardi", "Lithuanian", "Chassidic",
  "Chabad", "Breslov", "Hungarian", "Iraqi", "Jerusalem",
];

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

export default function TzadikimPage() {
  const [rabbis, setRabbis] = useState<Rabbi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eraFilter, setEraFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "timeline" | "map">("grid");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchRabbis = useCallback(async (s?: string, era?: string, community?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (era) params.set("era", era);
      if (community) params.set("community", community);
      const res = await fetch(`/api/rabbis?${params}`);
      const data = await res.json();
      setRabbis(data.rabbis || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRabbis();
  }, [fetchRabbis]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchRabbis(val, eraFilter, communityFilter);
    }, 300);
  }

  function handleEraChange(val: string) {
    setEraFilter(val);
    fetchRabbis(search, val, communityFilter);
  }

  function handleCommunityChange(val: string) {
    setCommunityFilter(val);
    fetchRabbis(search, eraFilter, val);
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
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500,
            color: "var(--gold)",
          }}>
            Tzadikim &amp; Poskim
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/reader" style={{
            textDecoration: "none", fontSize: 13, color: "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Library
          </Link>
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
        <div className="fade-in">
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <h1 style={{
              fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500,
              color: "var(--text-primary)", margin: 0,
            }}>
              Tzadikim &amp; Poskim
            </h1>
            <span style={{
              fontSize: 13, color: "var(--text-muted)",
              background: "var(--bg-glass)", padding: "4px 12px",
              borderRadius: 100, border: "1px solid var(--border-subtle)",
            }}>
              {rabbis.length} scholars
            </span>
          </div>

          {/* Search + Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by name (English or Hebrew)..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 40, height: 44 }}
              />
            </div>
            <select
              value={eraFilter}
              onChange={(e) => handleEraChange(e.target.value)}
              className="select-field"
              style={{ width: 150 }}
            >
              <option value="">All Eras</option>
              {ERAS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <select
              value={communityFilter}
              onChange={(e) => handleCommunityChange(e.target.value)}
              className="select-field"
              style={{ width: 170 }}
            >
              <option value="">All Communities</option>
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-toggle" style={{ marginBottom: 16 }}>
            {(["grid", "timeline", "map"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? "view-toggle-btn active" : "view-toggle-btn"}
              >
                {mode === "grid" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                )}
                {mode === "timeline" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18" r="2" />
                  </svg>
                )}
                {mode === "map" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                )}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <div style={{
                width: 40, height: 40,
                border: "3px solid var(--border-subtle)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              Loading scholars...
            </div>
          ) : rabbis.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              No scholars found matching your criteria.
            </div>
          ) : viewMode === "timeline" ? (
            <RabbiTimeline rabbis={rabbis} />
          ) : viewMode === "map" ? (
            <RabbiMap rabbis={rabbis} />
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 12,
            }}>
              {rabbis.map((r) => (
                <Link
                  key={r.id}
                  href={`/tzadikim/${r.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="glass-card glass-card-hover"
                    style={{
                      padding: 20,
                      cursor: "pointer",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-card)",
                      height: "100%",
                    }}
                  >
                    {/* Name */}
                    <div style={{
                      fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600,
                      color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.3,
                    }}>
                      {r.name_en}
                    </div>
                    {r.name_he && (
                      <div style={{
                        fontFamily: "'Noto Serif Hebrew', serif", fontSize: 15,
                        color: "var(--text-secondary)", direction: "rtl",
                        marginBottom: 10,
                      }}>
                        {r.name_he}
                      </div>
                    )}

                    {/* Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {r.era && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                          color: eraColor(r.era),
                          background: `${eraColor(r.era)}18`,
                          padding: "2px 8px", borderRadius: 100,
                        }}>
                          {r.era}
                        </span>
                      )}
                      {r.community !== "General" && (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: "var(--gold)",
                          background: "var(--gold-dim)",
                          padding: "2px 8px", borderRadius: 100,
                        }}>
                          {r.community}
                        </span>
                      )}
                      {r.works_count > 0 && (
                        <span style={{
                          fontSize: 11, color: "var(--text-muted)",
                          marginLeft: "auto",
                        }}>
                          {r.works_count} work{r.works_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Lifespan */}
                    {(r.birth_year || r.death_year) && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {lifespan(r.birth_year, r.death_year)}
                      </div>
                    )}
                    {r.location && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {r.location}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
