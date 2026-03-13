"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "../store";

interface Chunk {
  id: number;
  work: string;
  section_ref: string;
  parent_ref: string | null;
  language: string;
  text: string;
  author: string | null;
  era: string | null;
  community: string;
  corpus_tier: string;
  tags: string[];
  topics: string[];
}

interface CommentarySidebarProps {
  sectionRef: string;
  work: string;
  onClose: () => void;
}

function CommentarySelector({
  commentators,
  active,
  onToggle,
}: {
  commentators: { name: string; era: string | null; count: number }[];
  active: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        Commentators
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {commentators.map((c) => {
          const isActive = active.includes(c.name);
          return (
            <label
              key={c.name}
              className={`checkbox-label ${isActive ? "checked" : ""}`}
              style={{ fontSize: 12 }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggle(c.name)}
              />
              <span style={{ flex: 1 }}>
                {c.name}
                {c.era && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginLeft: 6,
                    }}
                  >
                    {c.era}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  background: "var(--bg-glass)",
                  padding: "1px 6px",
                  borderRadius: 100,
                }}
              >
                {c.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function CommentaryBlock({
  commentator,
  era,
  chunks,
}: {
  commentator: string;
  era: string | null;
  chunks: Chunk[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: 12,
        marginBottom: 12,
      }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 0",
          textAlign: "left",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--gold)",
          }}
        >
          {commentator}
        </span>
        {era && (
          <span className="tag tag-era" style={{ fontSize: 9, padding: "2px 6px" }}>
            {era}
          </span>
        )}
      </button>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {chunks.map((chunk) => {
            const isRTL = chunk.language === "he" || chunk.language === "arc";
            return (
              <div
                key={chunk.id}
                style={{
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    direction: "ltr",
                    textAlign: "left",
                  }}
                >
                  {chunk.section_ref}
                </div>
                <div
                  style={{
                    fontSize: "85%",
                    lineHeight: 1.8,
                    color: "var(--text-primary)",
                    fontFamily: isRTL
                      ? "'Noto Serif Hebrew', var(--font-serif)"
                      : "var(--font-serif)",
                    direction: isRTL ? "rtl" : "ltr",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {chunk.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CommentarySidebar({
  sectionRef,
  work,
  onClose,
}: CommentarySidebarProps) {
  const [commentaries, setCommentaries] = useState<Record<string, Chunk[]>>({});
  const [loading, setLoading] = useState(true);
  const { activeCommentators, setActiveCommentators } = useAppStore();

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    fetch(
      `/api/reader/commentaries?sectionRef=${encodeURIComponent(sectionRef)}&work=${encodeURIComponent(work)}`,
      { signal: abort.signal },
    )
      .then((r) => r.json())
      .then((data) => {
        setCommentaries(data.commentaries || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => abort.abort();
  }, [sectionRef, work]);

  const commentatorList = Object.entries(commentaries).map(([name, chunks]) => ({
    name,
    era: chunks[0]?.era ?? null,
    count: chunks.length,
  }));

  const toggleCommentator = (name: string) => {
    if (activeCommentators.includes(name)) {
      setActiveCommentators(activeCommentators.filter((c) => c !== name));
    } else {
      setActiveCommentators([...activeCommentators, name]);
    }
  };

  const visibleCommentators =
    activeCommentators.length > 0
      ? commentatorList.filter((c) => activeCommentators.includes(c.name))
      : commentatorList;

  return (
    <div
      className="glass-card"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        maxWidth: "100vw",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        borderLeft: "1px solid var(--border-accent)",
        background: "rgba(10, 14, 26, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--gold)",
              margin: 0,
            }}
          >
            Commentary
          </h3>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {sectionRef}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-muted)",
            cursor: "pointer",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
          }}
        >
          x
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 20,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid var(--border-subtle)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Loading commentaries...
          </div>
        ) : commentatorList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            No commentaries found for this section.
          </div>
        ) : (
          <>
            <CommentarySelector
              commentators={commentatorList}
              active={activeCommentators}
              onToggle={toggleCommentator}
            />

            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: 16,
              }}
            >
              {visibleCommentators.map((c) => (
                <CommentaryBlock
                  key={c.name}
                  commentator={c.name}
                  era={c.era}
                  chunks={commentaries[c.name] || []}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
