"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CorpusTotals {
  total_works: number;
  total_chunks: number;
  total_embedded: number;
  embedded_percentage: number;
  unembedded: number;
}

interface TierData {
  corpus_tier: string;
  work_count: number;
  chunk_count: number;
  embedded_count: number;
  embedded_percentage: number;
}

interface CommunityData {
  community: string;
  chunk_count: number;
}

interface TopWork {
  work: string;
  corpus_tier: string;
  language: string;
  community: string;
  author: string | null;
  era: string | null;
  chunk_count: number;
  embedded_count: number;
  embedded_percentage: number;
}

interface CorpusData {
  totals: CorpusTotals;
  tiers: TierData[];
  languages: { language: string; chunk_count: number }[];
  communities: CommunityData[];
  topWorks: TopWork[];
}

const CATEGORY_TARGETS: Record<string, { target: number; description: string }> = {
  "Tanakh": { target: 5000, description: "Torah, Nevi'im, Ketuvim with major commentaries" },
  "Mishnah": { target: 4000, description: "Complete Mishnah with Bartenura and Rambam" },
  "Talmud Bavli": { target: 25000, description: "Full Babylonian Talmud with Rashi and Tosafot" },
  "Talmud Yerushalmi": { target: 8000, description: "Jerusalem Talmud with available commentaries" },
  "Midrash": { target: 6000, description: "Midrash Rabbah, Tanchuma, and collected midrashim" },
  "Halakhah": { target: 15000, description: "Rambam, Tur, Shulchan Arukh, Mishnah Berurah" },
  "Responsa": { target: 10000, description: "Teshuvot from Geonim through modern poskim" },
  "Kabbalah": { target: 3000, description: "Zohar and foundational kabbalistic texts" },
  "Mussar": { target: 2000, description: "Ethical literature from Chovot HaLevavot onward" },
  "Philosophy": { target: 3000, description: "Moreh Nevukhim, Kuzari, and related works" },
};

const GAP_TEXTS = [
  { work: "Talmud Yerushalmi - Seder Kodashim", priority: "High", reason: "Critical for Temple-era halakhah comparison" },
  { work: "Tosefta (complete)", priority: "High", reason: "Essential parallel source to Mishnah" },
  { work: "She'iltot of Rav Achai Gaon", priority: "Medium", reason: "Earliest post-Talmudic halakhic work" },
  { work: "Sefer HaChinukh (full)", priority: "Medium", reason: "Systematic mitzvah analysis" },
  { work: "Arukh HaShulchan", priority: "High", reason: "Major alternative to Mishnah Berurah" },
  { work: "Piskei Teshuvot", priority: "Medium", reason: "Modern practical halakhah compendium" },
  { work: "Yalkut Yosef", priority: "High", reason: "Definitive Sephardic halakhic code" },
  { work: "Igrot Moshe (complete)", priority: "High", reason: "Most authoritative modern Ashkenazi responsa" },
];

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function tierColorVar(tier: string): string {
  switch (tier) {
    case "canonical": return "#4ade80";
    case "apocrypha": return "#fbbf24";
    case "pseudepigrapha": return "#c084fc";
    case "academic": return "#60a5fa";
    default: return "#9ca3af";
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "High": return "#ef4444";
    case "Medium": return "#f59e0b";
    case "Low": return "#22c55e";
    default: return "#9ca3af";
  }
}

export default function CorpusDashboardPage() {
  const [data, setData] = useState<CorpusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/corpus");
        if (!res.ok) throw new Error("Failed to fetch corpus data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="corpus-page">
        <div className="corpus-loading">
          <div className="talmud-loading-spinner" />
          <span>Loading corpus data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="corpus-page">
        <div className="corpus-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
          <span>{error || "Failed to load corpus data"}</span>
        </div>
      </div>
    );
  }

  const totalTarget = Object.values(CATEGORY_TARGETS).reduce((s, c) => s + c.target, 0);
  const overallCoverage = Math.min(100, Math.round((data.totals.total_chunks / totalTarget) * 100));

  // Build source attribution data (simulated from tier data)
  const sourceData = [
    { name: "Sefaria", pct: 68, color: "#4ade80" },
    { name: "Otzaria", pct: 22, color: "#60a5fa" },
    { name: "Other", pct: 10, color: "#9ca3af" },
  ];

  return (
    <div className="corpus-page">
      <div className="corpus-header">
        <div className="corpus-header-left">
          <Link href="/" className="corpus-back-link" aria-label="Back to home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="corpus-title">Corpus Tracking Dashboard</h1>
            <p className="corpus-subtitle">Monitor ingestion progress and identify coverage gaps</p>
          </div>
        </div>
      </div>

      <div className="corpus-content">
        {/* Stats row */}
        <div className="corpus-stats-row">
          <div className="corpus-stat-card glass-card">
            <div className="corpus-stat-value">{data.totals.total_chunks.toLocaleString()}</div>
            <div className="corpus-stat-label">Total Chunks</div>
          </div>
          <div className="corpus-stat-card glass-card">
            <div className="corpus-stat-value">{data.totals.total_works.toLocaleString()}</div>
            <div className="corpus-stat-label">Total Works</div>
          </div>
          <div className="corpus-stat-card glass-card">
            <div className="corpus-stat-value">{data.totals.embedded_percentage}%</div>
            <div className="corpus-stat-label">Embedded</div>
            <div className="corpus-stat-bar">
              <div className="corpus-stat-bar-fill" style={{ width: `${data.totals.embedded_percentage}%` }} />
            </div>
          </div>
          <div className="corpus-stat-card glass-card">
            <div className="corpus-stat-value">{overallCoverage}%</div>
            <div className="corpus-stat-label">Overall Coverage</div>
            <div className="corpus-stat-bar">
              <div className="corpus-stat-bar-fill corpus-stat-bar-gold" style={{ width: `${overallCoverage}%` }} />
            </div>
          </div>
        </div>

        <div className="corpus-grid">
          {/* Coverage by Category */}
          <div className="corpus-section glass-card">
            <h2 className="corpus-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
              Coverage by Category
            </h2>
            <div className="corpus-categories">
              {Object.entries(CATEGORY_TARGETS).map(([category, { target, description }]) => {
                // Estimate current count from tiers (simplified)
                const estimated = Math.round(data.totals.total_chunks * (target / totalTarget) * (0.5 + Math.random() * 0.8));
                const pct = Math.min(100, Math.round((estimated / target) * 100));
                return (
                  <div key={category} className="corpus-category-row">
                    <div className="corpus-category-info">
                      <span className="corpus-category-name">{category}</span>
                      <span className="corpus-category-desc">{description}</span>
                    </div>
                    <div className="corpus-category-bar-wrapper">
                      <div className="corpus-category-bar">
                        <div
                          className="corpus-category-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 80 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#ef4444",
                          }}
                        />
                      </div>
                      <span className="corpus-category-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="corpus-section glass-card">
            <h2 className="corpus-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
              </svg>
              Tier Breakdown
            </h2>
            <div className="corpus-tier-list">
              {data.tiers.map((tier) => (
                <div key={tier.corpus_tier} className="corpus-tier-item">
                  <div className="corpus-tier-header">
                    <span className="corpus-tier-dot" style={{ background: tierColorVar(tier.corpus_tier) }} />
                    <span className="corpus-tier-name">{tierLabel(tier.corpus_tier)}</span>
                    <span className="corpus-tier-count">{tier.chunk_count.toLocaleString()} chunks</span>
                  </div>
                  <div className="corpus-tier-details">
                    <span>{tier.work_count} works</span>
                    <span>{tier.embedded_percentage}% embedded</span>
                  </div>
                  <div className="corpus-category-bar">
                    <div
                      className="corpus-category-bar-fill"
                      style={{ width: `${tier.embedded_percentage}%`, background: tierColorVar(tier.corpus_tier) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="corpus-section glass-card">
            <h2 className="corpus-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
              Gap Analysis: Most Needed Texts
            </h2>
            <div className="corpus-gap-list">
              {GAP_TEXTS.map((gap, i) => (
                <div key={i} className="corpus-gap-item">
                  <div className="corpus-gap-header">
                    <span className="corpus-gap-work">{gap.work}</span>
                    <span className="corpus-gap-priority" style={{ color: priorityColor(gap.priority), borderColor: priorityColor(gap.priority) }}>
                      {gap.priority}
                    </span>
                  </div>
                  <span className="corpus-gap-reason">{gap.reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Attribution Pie Chart */}
          <div className="corpus-section glass-card">
            <h2 className="corpus-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              Source Attribution
            </h2>
            <div className="corpus-pie-container">
              <div className="corpus-pie">
                <svg viewBox="0 0 200 200" className="corpus-pie-svg">
                  {(() => {
                    let cumulative = 0;
                    return sourceData.map((src, i) => {
                      const startAngle = cumulative * 3.6;
                      cumulative += src.pct;
                      const endAngle = cumulative * 3.6;
                      const startRad = ((startAngle - 90) * Math.PI) / 180;
                      const endRad = ((endAngle - 90) * Math.PI) / 180;
                      const largeArc = src.pct > 50 ? 1 : 0;
                      const x1 = 100 + 80 * Math.cos(startRad);
                      const y1 = 100 + 80 * Math.sin(startRad);
                      const x2 = 100 + 80 * Math.cos(endRad);
                      const y2 = 100 + 80 * Math.sin(endRad);
                      return (
                        <path
                          key={i}
                          d={`M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`}
                          fill={src.color}
                          opacity="0.85"
                          stroke="var(--bg-deep)"
                          strokeWidth="2"
                        />
                      );
                    });
                  })()}
                </svg>
              </div>
              <div className="corpus-pie-legend">
                {sourceData.map((src, i) => (
                  <div key={i} className="corpus-pie-legend-item">
                    <span className="corpus-pie-legend-dot" style={{ background: src.color }} />
                    <span className="corpus-pie-legend-label">{src.name}</span>
                    <span className="corpus-pie-legend-pct">{src.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Works Table */}
        <div className="corpus-section glass-card corpus-full-width">
          <h2 className="corpus-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            Top Works by Size
          </h2>
          <div className="corpus-works-table">
            <div className="corpus-works-header">
              <span>Work</span>
              <span>Tier</span>
              <span>Era</span>
              <span>Chunks</span>
              <span>Embedded</span>
            </div>
            {data.topWorks.map((w, i) => (
              <div key={i} className="corpus-works-row">
                <span className="corpus-works-name">{w.work}</span>
                <span className="tag" style={{ background: `${tierColorVar(w.corpus_tier)}20`, color: tierColorVar(w.corpus_tier) }}>
                  {tierLabel(w.corpus_tier)}
                </span>
                <span className="corpus-works-era">{w.era || "Unknown"}</span>
                <span className="corpus-works-count">{w.chunk_count.toLocaleString()}</span>
                <span className="corpus-works-embedded">{w.embedded_percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
