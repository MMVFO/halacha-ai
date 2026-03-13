"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type ExplanationLevel = "eli5" | "simple" | "intermediate" | "technical" | "expert";
type ExplanationContext =
  | "talmud" | "mishnah" | "halacha" | "kabbalah" | "tanakh"
  | "midrash" | "mussar" | "philosophy" | "history" | "general";

interface ExplanationLink {
  label: string;
  concept: string;
}

interface ExplanationResponse {
  explanation: string;
  level: ExplanationLevel;
  context: ExplanationContext;
  relatedConcepts: ExplanationLink[];
  hebrewTerm?: string;
  cached?: boolean;
}

const LEVELS: { value: ExplanationLevel; label: string; icon: string }[] = [
  { value: "eli5", label: "ELI5", icon: "🌱" },
  { value: "simple", label: "Simple", icon: "📖" },
  { value: "intermediate", label: "Intermediate", icon: "📚" },
  { value: "technical", label: "Technical", icon: "🔬" },
  { value: "expert", label: "Expert", icon: "🎓" },
];

const CONTEXTS: { value: ExplanationContext; label: string }[] = [
  { value: "general", label: "General" },
  { value: "talmud", label: "Talmud" },
  { value: "mishnah", label: "Mishnah" },
  { value: "halacha", label: "Halacha" },
  { value: "kabbalah", label: "Kabbalah" },
  { value: "tanakh", label: "Tanakh" },
  { value: "midrash", label: "Midrash" },
  { value: "mussar", label: "Mussar" },
  { value: "philosophy", label: "Philosophy" },
  { value: "history", label: "History" },
];

// --- Hook ---

function useExplanation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ExplanationResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchExplanation = useCallback(async (
    concept: string,
    level: ExplanationLevel,
    context: ExplanationContext,
    opts?: { surroundingText?: string; sourceWork?: string; fromLevel?: ExplanationLevel }
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, level, context, ...opts }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setResponse(data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Could not connect to the explanation service.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setResponse(null);
  }, []);

  return { loading, error, response, fetchExplanation, reset };
}

// --- ExplainModal ---

interface ExplainModalProps {
  concept: string;
  initialContext?: ExplanationContext;
  sourceWork?: string;
  surroundingText?: string;
  onClose: () => void;
  onNavigate?: (concept: string) => void;
}

export function ExplainModal({
  concept,
  initialContext = "general",
  sourceWork,
  surroundingText,
  onClose,
  onNavigate,
}: ExplainModalProps) {
  const [level, setLevel] = useState<ExplanationLevel>("simple");
  const [context, setContext] = useState<ExplanationContext>(initialContext);
  const { loading, error, response, fetchExplanation, reset } = useExplanation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch on mount and when level/context changes
  useEffect(() => {
    fetchExplanation(concept, level, context, {
      surroundingText,
      sourceWork,
      fromLevel: response?.level,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept, level, context]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleRelatedClick(related: ExplanationLink) {
    if (onNavigate) {
      onNavigate(related.concept);
    } else {
      reset();
      fetchExplanation(related.concept, level, context);
    }
  }

  return (
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
        ref={modalRef}
        className="fade-in"
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "85vh",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-elevated), 0 0 80px rgba(212, 175, 55, 0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}>
              Explain Concept
            </div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--gold)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {concept}
            </div>
            {response?.hebrewTerm && (
              <div style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginTop: 4,
                fontFamily: "'Noto Serif Hebrew', serif",
                direction: "rtl",
              }}>
                {response.hebrewTerm}
              </div>
            )}
            {sourceWork && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                From: {sourceWork}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
              fontSize: 20,
              lineHeight: 1,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Level selector */}
        <div style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
        }}>
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                background: level === l.value ? "var(--gold-dim)" : "transparent",
                border: `1px solid ${level === l.value ? "var(--border-accent)" : "transparent"}`,
                borderRadius: 100,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: level === l.value ? 600 : 400,
                color: level === l.value ? "var(--gold)" : "var(--text-secondary)",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <span>{l.icon}</span>
              {l.label}
            </button>
          ))}
        </div>

        {/* Context selector */}
        <div style={{
          padding: "8px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}>
            Domain:
          </span>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as ExplanationContext)}
            className="select-field"
            style={{ fontSize: 13, padding: "4px 28px 4px 10px" }}
          >
            {CONTEXTS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {response?.cached && (
            <span style={{
              fontSize: 10,
              color: "var(--text-muted)",
              background: "var(--bg-glass)",
              padding: "2px 8px",
              borderRadius: 100,
              marginLeft: "auto",
            }}>
              cached
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 24px 24px",
        }}>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 32,
                height: 32,
                border: "3px solid var(--border-subtle)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: 15,
                color: "var(--text-secondary)",
              }}>
                Generating {level} explanation...
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{
              padding: 16,
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "var(--radius-sm)",
              color: "var(--red-accent)",
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {/* Explanation content */}
          {response && !loading && (
            <div className="fade-in">
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                lineHeight: 1.85,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
              }}>
                {response.explanation}
              </div>

              {/* Related concepts */}
              {response.relatedConcepts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}>
                    Explore Related
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {response.relatedConcepts.map((rc, i) => (
                      <button
                        key={i}
                        onClick={() => handleRelatedClick(rc)}
                        className="btn-ghost"
                        style={{
                          fontSize: 12,
                          padding: "5px 12px",
                          borderRadius: 100,
                        }}
                      >
                        {rc.label}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                marginTop: 24,
                padding: "10px 14px",
                background: "var(--gold-glow)",
                border: "1px solid rgba(212, 175, 55, 0.1)",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                color: "var(--text-muted)",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}>
                For learning and research only. Consult a competent rabbi for practical halacha.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ExplainButton (inline trigger) ---

interface ExplainButtonProps {
  concept: string;
  context?: ExplanationContext;
  sourceWork?: string;
  surroundingText?: string;
  style?: React.CSSProperties;
}

export function ExplainButton({
  concept,
  context = "general",
  sourceWork,
  surroundingText,
  style,
}: ExplainButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Explain: ${concept}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "var(--gold-dim)",
          border: "1px solid var(--border-accent)",
          borderRadius: 100,
          padding: "2px 10px 2px 6px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--gold)",
          transition: "all 0.2s ease",
          verticalAlign: "middle",
          ...style,
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Explain
      </button>
      {open && (
        <ExplainModal
          concept={concept}
          initialContext={context}
          sourceWork={sourceWork}
          surroundingText={surroundingText}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
