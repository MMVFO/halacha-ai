"use client";

import { useAppStore } from "../store";

interface CommentatorInfo {
  name: string;
  era: string | null;
  count: number;
}

interface CommentarySelectorProps {
  commentators: CommentatorInfo[];
  onToggle?: (name: string) => void;
}

export default function CommentarySelector({
  commentators,
  onToggle,
}: CommentarySelectorProps) {
  const { activeCommentators, setActiveCommentators } = useAppStore();

  const handleToggle = (name: string) => {
    if (onToggle) {
      onToggle(name);
      return;
    }
    if (activeCommentators.includes(name)) {
      setActiveCommentators(activeCommentators.filter((c) => c !== name));
    } else {
      setActiveCommentators([...activeCommentators, name]);
    }
  };

  const selectAll = () => {
    setActiveCommentators(commentators.map((c) => c.name));
  };

  const selectNone = () => {
    setActiveCommentators([]);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Commentators
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={selectAll}
            style={{
              background: "none",
              border: "none",
              fontSize: 10,
              color: "var(--gold)",
              cursor: "pointer",
              padding: "2px 4px",
              opacity: 0.8,
            }}
          >
            All
          </button>
          <button
            onClick={selectNone}
            style={{
              background: "none",
              border: "none",
              fontSize: 10,
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            None
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {commentators.map((c) => {
          const isActive = activeCommentators.includes(c.name);
          return (
            <label
              key={c.name}
              className={`checkbox-label ${isActive ? "checked" : ""}`}
              style={{ fontSize: 12 }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleToggle(c.name)}
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
      {activeCommentators.length > 0 && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          {activeCommentators.length} of {commentators.length} selected
        </div>
      )}
    </div>
  );
}
