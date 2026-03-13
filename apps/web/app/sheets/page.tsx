"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Sheet {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

const USER_ID = 1;

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, []);

  function fetchSheets() {
    setLoading(true);
    fetch(`/api/sheets?userId=${USER_ID}`)
      .then((r) => r.json())
      .then((data) => setSheets(data.sheets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDesc("");
        setShowCreate(false);
        fetchSheets();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: 32,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}>
                Study Sheets
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Curated collections of passages for focused study
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: "var(--gold-dim)",
                border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 20px",
                color: "var(--gold)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.25)";
                e.currentTarget.style.borderColor = "var(--gold)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--gold-dim)";
                e.currentTarget.style.borderColor = "var(--border-accent)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Sheet
            </button>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: 20,
          }}>
            <div
              className="fade-in"
              style={{
                width: "100%",
                maxWidth: 480,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-elevated)",
                padding: 24,
              }}
            >
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 20,
              }}>
                New Study Sheet
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Sheet title"
                  autoFocus
                  style={{
                    width: "100%",
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  style={{
                    width: "100%",
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => { setShowCreate(false); setNewTitle(""); setNewDesc(""); }}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 18px",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  style={{
                    background: newTitle.trim() ? "var(--gold-dim)" : "var(--bg-glass)",
                    border: `1px solid ${newTitle.trim() ? "var(--border-accent)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 24px",
                    color: newTitle.trim() ? "var(--gold)" : "var(--text-muted)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: creating || !newTitle.trim() ? "default" : "pointer",
                    opacity: creating ? 0.6 : 1,
                  }}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
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
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading sheets...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && sheets.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 8 }}>No study sheets yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Create a sheet to collect and organize passages for study
            </div>
          </div>
        )}

        {/* Sheet cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/sheets/${sheet.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px 20px",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  cursor: "pointer",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  height: "100%",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-accent)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--gold)",
                  marginBottom: 6,
                }}>
                  {sheet.title}
                </div>
                {sheet.description && (
                  <div style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}>
                    {sheet.description}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>{new Date(sheet.created_at).toLocaleDateString()}</span>
                  {sheet.is_public && (
                    <span style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                      padding: "1px 8px",
                      borderRadius: 100,
                      fontWeight: 600,
                    }}>
                      Public
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
