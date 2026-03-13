"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BookmarkWithChunk {
  id: number;
  user_id: number;
  chunk_id: number;
  label: string | null;
  color: string;
  created_at: string;
  work: string;
  section_ref: string;
  text: string;
  language: string;
  author: string | null;
  era: string | null;
  corpus_tier: string;
}

const USER_ID = 1;

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithChunk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookmarks?userId=${USER_ID}`)
      .then((r) => r.json())
      .then((data) => setBookmarks(data.bookmarks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeBookmark(chunkId: number) {
    setBookmarks((prev) => prev.filter((b) => b.chunk_id !== chunkId));
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, chunkId }),
      });
    } catch {
      // Refetch on error
      const res = await fetch(`/api/bookmarks?userId=${USER_ID}`);
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    }
  }

  function truncateText(text: string, len = 200) {
    if (text.length <= len) return text;
    return text.slice(0, len) + "...";
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
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}>
            Bookmarks
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Your saved passages and references
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 32,
              height: 32,
              border: "3px solid var(--border-subtle)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading bookmarks...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && bookmarks.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>{"\u2606"}</div>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 8 }}>No bookmarks yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Use the star icon while reading to bookmark passages
            </div>
          </div>
        )}

        {/* Bookmark list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderLeft: `3px solid ${bm.color || "var(--gold)"}`,
                transition: "border-color 0.2s ease",
              }}
            >
              {/* Top row: work info + actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <Link
                    href={`/reader?work=${encodeURIComponent(bm.work)}&section=${encodeURIComponent(bm.section_ref)}`}
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--gold)",
                      textDecoration: "none",
                    }}
                  >
                    {bm.work}
                  </Link>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {bm.section_ref}
                    {bm.author && <span> &middot; {bm.author}</span>}
                    {bm.era && <span> &middot; {bm.era}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(bm.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => removeBookmark(bm.chunk_id)}
                    title="Remove bookmark"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "2px 4px",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--red-accent)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    {"\u2715"}
                  </button>
                </div>
              </div>

              {/* Text preview */}
              <div style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                fontFamily: bm.language === "he" || bm.language === "arc" ? "'Noto Serif Hebrew', serif" : "var(--font-sans)",
                direction: bm.language === "he" || bm.language === "arc" ? "rtl" : "ltr",
              }}>
                {truncateText(bm.text)}
              </div>

              {bm.label && (
                <div style={{
                  marginTop: 8,
                  display: "inline-block",
                  fontSize: 11,
                  color: "var(--gold)",
                  background: "var(--gold-dim)",
                  padding: "2px 8px",
                  borderRadius: 100,
                }}>
                  {bm.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
