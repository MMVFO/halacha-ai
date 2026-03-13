"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface SheetData {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

interface SheetItem {
  id: number;
  sheet_id: number;
  chunk_id: number | null;
  note: string | null;
  sort_order: number;
  created_at: string;
  work: string | null;
  section_ref: string | null;
  text: string | null;
  language: string | null;
  author: string | null;
  era: string | null;
  corpus_tier: string | null;
}

export default function SheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [items, setItems] = useState<SheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetch(`/api/sheets/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSheet(data.sheet || null);
        setItems(data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function moveItem(idx: number, direction: -1 | 1) {
    const target = idx + direction;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    setItems(newItems);
  }

  function startEditNote(itemId: number, currentNote: string | null) {
    setEditingNote(itemId);
    setNoteText(currentNote || "");
  }

  function cancelEditNote() {
    setEditingNote(null);
    setNoteText("");
  }

  const shareUrl = sheet?.is_public && sheet?.share_slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/sheets/share/${sheet.share_slug}`
    : null;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Navigation */}
        <Link
          href="/sheets"
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
          All Sheets
        </Link>

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
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading sheet...</div>
          </div>
        )}

        {!loading && !sheet && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>Sheet not found</div>
          </div>
        )}

        {!loading && sheet && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: 32,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}>
                {sheet.title}
              </h1>
              {sheet.description && (
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {sheet.description}
                </p>
              )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-muted)",
              }}>
                <span>{items.length} passage{items.length !== 1 ? "s" : ""}</span>
                <span>&middot;</span>
                <span>Created {new Date(sheet.created_at).toLocaleDateString()}</span>
                {sheet.is_public && (
                  <>
                    <span>&middot;</span>
                    <span style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                      padding: "1px 8px",
                      borderRadius: 100,
                      fontWeight: 600,
                    }}>
                      Public
                    </span>
                  </>
                )}
              </div>

              {/* Share URL */}
              {shareUrl && (
                <div style={{
                  marginTop: 12,
                  padding: "8px 14px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    {shareUrl}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
              }}>
                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>No passages in this sheet yet</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Add passages from the reader to build your study sheet
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {items.map((item, idx) => (
                  <div key={item.id}>
                    {/* Passage card */}
                    {item.chunk_id && item.text && (
                      <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "18px 20px",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}>
                        {/* Header row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 15,
                              fontWeight: 600,
                              color: "var(--gold)",
                            }}>
                              {item.work}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                              {item.section_ref}
                              {item.author && <span> &middot; {item.author}</span>}
                            </div>
                          </div>

                          {/* Reorder buttons */}
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => moveItem(idx, -1)}
                              disabled={idx === 0}
                              style={{
                                background: "transparent",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: 4,
                                width: 24, height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: idx === 0 ? "default" : "pointer",
                                color: idx === 0 ? "var(--border-subtle)" : "var(--text-muted)",
                                fontSize: 12,
                              }}
                              title="Move up"
                            >
                              {"\u25B2"}
                            </button>
                            <button
                              onClick={() => moveItem(idx, 1)}
                              disabled={idx === items.length - 1}
                              style={{
                                background: "transparent",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: 4,
                                width: 24, height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: idx === items.length - 1 ? "default" : "pointer",
                                color: idx === items.length - 1 ? "var(--border-subtle)" : "var(--text-muted)",
                                fontSize: 12,
                              }}
                              title="Move down"
                            >
                              {"\u25BC"}
                            </button>
                          </div>
                        </div>

                        {/* Text */}
                        <div style={{
                          fontSize: 15,
                          lineHeight: 1.85,
                          color: "var(--text-primary)",
                          fontFamily: item.language === "he" || item.language === "arc" ? "'Noto Serif Hebrew', serif" : "var(--font-sans)",
                          direction: item.language === "he" || item.language === "arc" ? "rtl" : "ltr",
                        }}>
                          {item.text}
                        </div>
                      </div>
                    )}

                    {/* Note display / editor */}
                    {editingNote === item.id ? (
                      <div style={{ marginTop: 8 }}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          rows={2}
                          autoFocus
                          style={{
                            width: "100%",
                            background: "var(--bg-glass)",
                            border: "1px solid var(--border-accent)",
                            borderRadius: "var(--radius-sm)",
                            padding: "8px 12px",
                            color: "var(--text-primary)",
                            fontSize: 13,
                            fontFamily: "var(--font-sans)",
                            lineHeight: 1.6,
                            resize: "vertical",
                            outline: "none",
                          }}
                        />
                        <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                          <button
                            onClick={cancelEditNote}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 12px",
                              color: "var(--text-secondary)",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setItems((prev) =>
                                prev.map((it) =>
                                  it.id === item.id ? { ...it, note: noteText } : it
                                )
                              );
                              cancelEditNote();
                            }}
                            style={{
                              background: "var(--gold-dim)",
                              border: "1px solid var(--border-accent)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 14px",
                              color: "var(--gold)",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : item.note ? (
                      <div
                        onClick={() => startEditNote(item.id, item.note)}
                        style={{
                          marginTop: 8,
                          padding: "10px 14px",
                          background: "var(--gold-glow)",
                          border: "1px solid rgba(212, 175, 55, 0.1)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          cursor: "pointer",
                        }}
                      >
                        {item.note}
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditNote(item.id, null)}
                        style={{
                          marginTop: 6,
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: "2px 0",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        + Add note
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
