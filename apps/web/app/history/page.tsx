"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoryEntry {
  id: number;
  work: string;
  section_ref: string;
  time_spent_seconds: number;
  last_read_at: string;
}

interface ProgressEntry {
  id: number;
  work: string;
  total_sections: number;
  completed_sections: number;
  last_section_ref: string | null;
  updated_at: string;
}

const USER_ID = 1;

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/history?userId=${USER_ID}`).then((r) => r.json()),
      fetch(`/api/progress?userId=${USER_ID}`).then((r) => r.json()),
    ])
      .then(([histData, progData]) => {
        setHistory(histData.history || []);
        setProgress(progData.progress || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mostRecent = history[0] ?? null;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 16,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}>
            Study History
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Your reading activity and study progress
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 32, height: 32,
              border: "3px solid var(--border-subtle)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading history...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* Continue where you left off */}
            {mostRecent && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}>
                  Continue where you left off
                </div>
                <Link
                  href={`/reader?work=${encodeURIComponent(mostRecent.work)}&section=${encodeURIComponent(mostRecent.section_ref)}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "var(--shadow-glow)",
                    cursor: "pointer",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "var(--gold)",
                      marginBottom: 6,
                    }}>
                      {mostRecent.work}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                      {mostRecent.section_ref}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {timeAgo(mostRecent.last_read_at)} &middot; {formatTime(mostRecent.time_spent_seconds)} reading time
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Study progress */}
            {progress.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}>
                  Study Progress
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {progress.map((p) => {
                    const pct = p.total_sections > 0 ? Math.round((p.completed_sections / p.total_sections) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          padding: "14px 18px",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}>
                            {p.work}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
                            {pct}%
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{
                          height: 6,
                          background: "var(--bg-glass)",
                          borderRadius: 100,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, var(--gold), var(--gold-light))",
                            borderRadius: 100,
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                          {p.completed_sections} / {p.total_sections} sections
                          {p.last_section_ref && <span> &middot; Last: {p.last_section_ref}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}>
                Recent Activity
              </div>

              {history.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                }}>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>No reading history yet</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    Start reading in the Text Library to track your progress
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {history.map((entry, idx) => (
                    <Link
                      key={entry.id}
                      href={`/reader?work=${encodeURIComponent(entry.work)}&section=${encodeURIComponent(entry.section_ref)}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        borderRadius: "var(--radius-sm)",
                        transition: "background 0.15s ease",
                        cursor: "pointer",
                        borderLeft: idx === 0 ? "2px solid var(--gold)" : "2px solid var(--border-subtle)",
                      }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{
                          width: 8, height: 8,
                          borderRadius: "50%",
                          background: idx === 0 ? "var(--gold)" : "var(--border-subtle)",
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {entry.work}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {entry.section_ref}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {timeAgo(entry.last_read_at)}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.7 }}>
                            {formatTime(entry.time_spent_seconds)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
