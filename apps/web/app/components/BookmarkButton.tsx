"use client";

import { useState, useCallback } from "react";

interface BookmarkButtonProps {
  chunkId: number;
  userId: number;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ chunkId, userId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading) return;
    setBookmarked((prev) => !prev);
    setLoading(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, chunkId }),
      });
      if (!res.ok) {
        setBookmarked((prev) => !prev);
      }
    } catch {
      setBookmarked((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }, [userId, chunkId, loading]);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      style={{
        background: "transparent",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        fontSize: 20,
        lineHeight: 1,
        padding: "4px 6px",
        color: bookmarked ? "var(--gold)" : "var(--text-muted)",
        transition: "color 0.2s ease, transform 0.15s ease",
        transform: bookmarked ? "scale(1.1)" : "scale(1)",
        filter: bookmarked ? "drop-shadow(0 0 6px rgba(212, 175, 55, 0.4))" : "none",
      }}
      onMouseOver={(e) => {
        if (!bookmarked) e.currentTarget.style.color = "var(--gold-light)";
      }}
      onMouseOut={(e) => {
        if (!bookmarked) e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {bookmarked ? "\u2605" : "\u2606"}
    </button>
  );
}
