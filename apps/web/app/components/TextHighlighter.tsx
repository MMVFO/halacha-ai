"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const HIGHLIGHT_COLORS = [
  { name: "Gold", value: "#d4af37" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
];

interface Highlight {
  id: number;
  start: number;
  end: number;
  color: string;
  text: string;
}

interface TextHighlighterProps {
  text: string;
  chunkId: number;
  userId: number;
  highlights?: Highlight[];
  onHighlightCreated?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TextHighlighter({
  text,
  chunkId,
  userId,
  highlights = [],
  onHighlightCreated,
  className,
  style,
}: TextHighlighterProps) {
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      setToolbarPos(null);
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setToolbarPos(null);
      setSelection(null);
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText) {
      setToolbarPos(null);
      setSelection(null);
      return;
    }

    // Calculate offsets within the text
    const start = text.indexOf(selectedText);
    if (start === -1) {
      setToolbarPos(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setToolbarPos({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
    setSelection({ start, end: start + selectedText.length, text: selectedText });
  }, [text]);

  const handleColorClick = useCallback(
    async (color: string) => {
      if (!selection || saving) return;
      setSaving(true);

      try {
        const res = await fetch("/api/annotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            chunkId,
            type: "highlight",
            content: selection.text,
            highlightStart: selection.start,
            highlightEnd: selection.end,
            color,
          }),
        });

        if (res.ok) {
          onHighlightCreated?.();
        }
      } catch {
        // silently fail
      } finally {
        setSaving(false);
        setToolbarPos(null);
        setSelection(null);
        window.getSelection()?.removeAllRanges();
      }
    },
    [selection, saving, userId, chunkId, onHighlightCreated]
  );

  // Dismiss toolbar on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setToolbarPos(null);
        setSelection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render text with highlights applied
  const renderHighlightedText = () => {
    if (highlights.length === 0) return text;

    // Sort highlights by start position
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    for (const hl of sorted) {
      if (hl.start > lastEnd) {
        parts.push(text.slice(lastEnd, hl.start));
      }
      parts.push(
        <span
          key={hl.id}
          className="text-highlight-span"
          style={{ backgroundColor: `${hl.color}25`, borderBottom: `2px solid ${hl.color}` }}
          title={`Highlighted: "${hl.text}"`}
        >
          {text.slice(hl.start, hl.end)}
        </span>
      );
      lastEnd = Math.max(lastEnd, hl.end);
    }

    if (lastEnd < text.length) {
      parts.push(text.slice(lastEnd));
    }

    return parts;
  };

  return (
    <div ref={containerRef} className={`text-highlighter ${className || ""}`} style={{ position: "relative", ...style }}>
      <div onMouseUp={handleMouseUp}>{renderHighlightedText()}</div>

      {toolbarPos && (
        <div
          className="highlight-toolbar fade-in"
          style={{
            position: "absolute",
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: "translate(-50%, -100%)",
            zIndex: 50,
          }}
        >
          <div className="highlight-toolbar-inner">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleColorClick(c.value)}
                disabled={saving}
                className="highlight-color-btn"
                title={c.name}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <div className="highlight-toolbar-arrow" />
        </div>
      )}
    </div>
  );
}
