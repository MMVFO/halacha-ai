"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PRESET_COLORS = [
  { name: "Gold", value: "#d4af37" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
];

const SUGGESTED_TAGS = [
  "important", "question", "insight", "review", "halacha",
  "mussar", "hashkafa", "commentary", "contradiction", "connection",
];

interface AnnotationEditorProps {
  chunkId: number;
  userId: number;
  onSave: () => void;
  onCancel: () => void;
}

/* Tag filter component for bookmarks/annotations list views */
export function TagFilter({
  allTags,
  selectedTags,
  onTagsChange,
}: {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-filter-container" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter{selectedTags.length > 0 ? ` (${selectedTags.length})` : ""}
      </button>

      {open && (
        <div
          className="tag-filter-dropdown fade-in"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-elevated)",
            padding: 8,
            zIndex: 100,
            minWidth: 180,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagsChange([])}
              style={{
                width: "100%",
                padding: "6px 10px",
                background: "transparent",
                border: "none",
                color: "var(--red-accent)",
                fontSize: 11,
                cursor: "pointer",
                textAlign: "left",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: 4,
                fontFamily: "var(--font-sans)",
              }}
            >
              Clear all filters
            </button>
          )}
          {allTags.length === 0 && (
            <div style={{ padding: "8px 10px", fontSize: 12, color: "var(--text-muted)" }}>
              No tags found
            </div>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 10px",
                background: selectedTags.includes(tag) ? "var(--gold-dim)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: selectedTags.includes(tag) ? "var(--gold)" : "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                border: selectedTags.includes(tag)
                  ? "1.5px solid var(--gold)"
                  : "1.5px solid var(--border-subtle)",
                background: selectedTags.includes(tag) ? "var(--gold)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "var(--bg-deep)",
                flexShrink: 0,
              }}>
                {selectedTags.includes(tag) ? "\u2713" : ""}
              </span>
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnnotationEditor({ chunkId, userId, onSave, onCancel }: AnnotationEditorProps) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing tags for autocomplete
  useEffect(() => {
    fetch(`/api/annotations?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const annotations = data.annotations || [];
        const tagSet = new Set<string>();
        for (const ann of annotations) {
          if (ann.tags) {
            for (const t of ann.tags) tagSet.add(t);
          }
        }
        setExistingTags(Array.from(tagSet));
      })
      .catch(() => {});
  }, [userId]);

  const currentTags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
  const lastTagPart = tagsInput.split(",").pop()?.trim().toLowerCase() || "";

  const filteredSuggestions = [...new Set([...SUGGESTED_TAGS, ...existingTags])]
    .filter(
      (tag) =>
        tag.toLowerCase().includes(lastTagPart) &&
        !currentTags.includes(tag)
    )
    .slice(0, 8);

  const addSuggestedTag = useCallback((tag: string) => {
    const parts = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    // Replace the last partial entry with the full tag
    parts.pop();
    parts.push(tag);
    setTagsInput(parts.join(", ") + ", ");
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  }, [tagsInput]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          chunkId,
          type: "note",
          content: content.trim(),
          color,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      onSave();
    } catch {
      setError("Could not save annotation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Color picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          Color:
        </span>
        {PRESET_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            title={c.name}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: c.value,
              border: color === c.value ? "2px solid var(--text-primary)" : "2px solid transparent",
              cursor: "pointer",
              transition: "border-color 0.15s ease, transform 0.15s ease",
              transform: color === c.value ? "scale(1.15)" : "scale(1)",
              boxShadow: color === c.value ? `0 0 8px ${c.value}40` : "none",
            }}
          />
        ))}
      </div>

      {/* Note content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={3}
        style={{
          width: "100%",
          background: "var(--bg-glass)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 12px",
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

      {/* Tags with autocomplete */}
      <div style={{ position: "relative" }}>
        {currentTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {currentTags.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 500,
                  background: "var(--gold-dim)",
                  color: "var(--gold)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                {tag}
                <button
                  onClick={() => {
                    const next = currentTags.filter((_, j) => j !== i);
                    setTagsInput(next.join(", ") + (next.length > 0 ? ", " : ""));
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {"\u00d7"}
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={tagInputRef}
          type="text"
          value={tagsInput}
          onChange={(e) => {
            setTagsInput(e.target.value);
            setShowTagSuggestions(true);
          }}
          placeholder="Tags (comma-separated)"
          style={{
            width: "100%",
            background: "var(--bg-glass)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            color: "var(--text-primary)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-accent)";
            setShowTagSuggestions(true);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            setTimeout(() => setShowTagSuggestions(false), 200);
          }}
        />
        {showTagSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="fade-in"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-elevated)",
              zIndex: 50,
              maxHeight: 160,
              overflowY: "auto",
            }}
          >
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSuggestedTag(tag);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.1s ease",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--gold-dim)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          fontSize: 13,
          color: "var(--red-accent)",
          padding: "6px 10px",
          background: "rgba(239, 68, 68, 0.08)",
          borderRadius: "var(--radius-sm)",
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "7px 16px",
            color: "var(--text-secondary)",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          style={{
            background: content.trim() ? "var(--gold-dim)" : "var(--bg-glass)",
            border: `1px solid ${content.trim() ? "var(--border-accent)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-sm)",
            padding: "7px 20px",
            color: content.trim() ? "var(--gold)" : "var(--text-muted)",
            fontSize: 13,
            fontWeight: 600,
            cursor: saving || !content.trim() ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
