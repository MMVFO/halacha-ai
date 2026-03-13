"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useAppStore } from "../store";

type ChatMode = "practical" | "deep_analytic" | "posek_view";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { id: number; work: string; sectionRef: string; community: string }[];
}

interface SourceCitation {
  id: number;
  work: string;
  sectionRef: string;
  community: string;
}

const MODES: { value: ChatMode; label: string; description: string; icon: string }[] = [
  { value: "practical", label: "Practical", description: "Give me the bottom-line halakhic ruling", icon: "P" },
  { value: "deep_analytic", label: "Deep Analytic", description: "Analyze all opinions, trace the sugya", icon: "D" },
  { value: "posek_view", label: "Posek View", description: "Answer as a selected posek would rule", icon: "R" },
];

const QUICK_ACTIONS = [
  { label: "Explain", prompt: "Explain this passage in clear terms." },
  { label: "Compare opinions", prompt: "Compare the different opinions on this topic." },
  { label: "Trace concept", prompt: "Trace this concept through the major sources." },
];

const POSKIM = [
  { id: "rambam", name: "Rambam (Maimonides)", era: "Rishon" },
  { id: "shulchan_aruch", name: "Shulchan Aruch (R. Yosef Karo)", era: "Acharon" },
  { id: "rema", name: "Rema (R. Moshe Isserles)", era: "Acharon" },
  { id: "mishnah_berurah", name: "Mishnah Berurah (Chofetz Chaim)", era: "Acharon" },
  { id: "rashi", name: "Rashi", era: "Rishon" },
  { id: "ramban", name: "Ramban (Nachmanides)", era: "Rishon" },
  { id: "rosh", name: "Rosh (R. Asher ben Yechiel)", era: "Rishon" },
  { id: "ben_ish_chai", name: "Ben Ish Chai", era: "Acharon" },
  { id: "rav_ovadia", name: "Rav Ovadia Yosef", era: "Contemporary" },
  { id: "rav_moshe", name: "Rav Moshe Feinstein", era: "Contemporary" },
];

const INLINE_REF_REGEX = /\(([A-Z][A-Za-z\u0590-\u05FF]+(?:[\s,]+[A-Za-z\u0590-\u05FF]+)*[\s,]+[\w.:]+(?:\s*[\w.:]+)*)\)/g;

function parseInlineRef(ref: string): { work: string; section: string } {
  const trimmed = ref.trim();
  const commaIdx = trimmed.indexOf(",");
  if (commaIdx > 0) {
    return { work: trimmed.slice(0, commaIdx).trim(), section: trimmed.slice(commaIdx + 1).trim() };
  }
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 0) {
    return { work: trimmed.slice(0, lastSpace).trim(), section: trimmed.slice(lastSpace + 1).trim() };
  }
  return { work: trimmed, section: "" };
}

function renderWithInlineCitations(text: string, keyOffset: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_REF_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx, match.index)}</span>);
    }
    const { work, section } = parseInlineRef(match[1]);
    nodes.push(
      <a
        key={`c-${keyOffset}-${match.index}`}
        className="ai-citation-link"
        href={`/reader?work=${encodeURIComponent(work)}&section=${encodeURIComponent(section)}`}
        title={match[1]}
      >
        ({match[1]})
      </a>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    nodes.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx)}</span>);
  }
  return nodes;
}

function renderContentWithCitations(content: string, sources: SourceCitation[]): React.ReactNode[] {
  const parts = content.split(/(\[Source \d+\]|\[\d+\])/g);
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    const match = part.match(/\[(?:Source )?(\d+)\]/);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      const source = sources[idx];
      if (source) {
        nodes.push(
          <a
            key={i}
            href={`/reader?work=${encodeURIComponent(source.work)}&section=${encodeURIComponent(source.sectionRef)}`}
            style={{
              color: "#d4af37",
              textDecoration: "none",
              borderBottom: "1px dotted rgba(212, 175, 55, 0.4)",
              fontSize: "0.85em",
              fontWeight: 500,
            }}
            title={`${source.work} ${source.sectionRef}`}
          >
            [{match[1]}]
          </a>
        );
        return;
      }
    }
    nodes.push(...renderWithInlineCitations(part, i));
  });
  return nodes;
}

export function AIPanel() {
  const open = useAppStore((s) => s.aiPanelOpen);
  const setOpen = useAppStore((s) => s.setAiPanelOpen);
  const aiContext = useAppStore((s) => s.aiContext);
  const setAiContext = useAppStore((s) => s.setAiContext);

  const [mode, setMode] = useState<ChatMode>("practical");
  const [selectedPosek, setSelectedPosek] = useState(POSKIM[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [savingSheet, setSavingSheet] = useState(false);
  const [sheetSaved, setSheetSaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Cmd+/ to toggle
  useHotkeys("mod+slash", (e) => {
    e.preventDefault();
    setOpen(!open);
  }, { enableOnFormTags: true }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setSheetSaved(false);

      try {
        // Build the request with posek info if in posek_view mode
        const requestBody: Record<string, unknown> = {
          question: text.trim(),
          mode,
          community: "General",
          corpusTiers: ["canonical"],
          context: aiContext || undefined,
          sessionId,
        };

        if (mode === "posek_view") {
          const posek = POSKIM.find((p) => p.id === selectedPosek);
          if (posek) {
            requestBody.question = `[Answering as ${posek.name} would rule] ${text.trim()}`;
          }
        }

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          const errData = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${errData.error || "Request failed"}` },
          ]);
          return;
        }

        // Parse SSE stream
        const reader = res.body?.getReader();
        if (!reader) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Error: No response stream" },
          ]);
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = "";
        let sources: SourceCitation[] = [];

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const jsonStr = trimmed.slice(6);

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "text") {
                fullContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = { ...last, content: fullContent };
                  }
                  return updated;
                });
              } else if (parsed.type === "meta") {
                sources = parsed.sources || [];
                if (parsed.sessionId) setSessionId(parsed.sessionId);
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = { ...last, sources };
                  }
                  return updated;
                });
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error: Could not connect to AI service." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [mode, aiContext, sessionId, loading, selectedPosek]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setAiContext(null);
    setSheetSaved(false);
  };

  const saveAsStudySheet = async () => {
    if (messages.length === 0 || savingSheet) return;
    setSavingSheet(true);

    try {
      const title = messages.find((m) => m.role === "user")?.content.slice(0, 80) || "AI Study Sheet";
      const content = messages
        .map((m) => `**${m.role === "user" ? "Question" : "Answer"}:**\n${m.content}`)
        .join("\n\n---\n\n");

      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Study Sheet: ${title}`,
          content,
          mode,
          sources: messages
            .filter((m) => m.sources)
            .flatMap((m) => m.sources || []),
        }),
      });

      if (res.ok) {
        setSheetSaved(true);
      }
    } catch {
      // silently fail
    } finally {
      setSavingSheet(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 9990,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: "100vw",
          zIndex: 9991,
          background: "rgba(10, 14, 26, 0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(212, 175, 55, 0.1)",
          boxShadow: open ? "-8px 0 40px rgba(0, 0, 0, 0.5)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#d4af37" }}>
              AI Research
            </div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>
              Cmd+/ to toggle
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Save as Sheet */}
            {messages.length > 0 && (
              <button
                onClick={saveAsStudySheet}
                disabled={savingSheet || sheetSaved}
                className="ai-save-sheet-btn"
                title="Save conversation as study sheet"
              >
                {sheetSaved ? "Saved" : savingSheet ? "..." : "Save Sheet"}
              </button>
            )}
            <button
              onClick={clearChat}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 6,
                color: "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                fontSize: 12,
                padding: "4px 10px",
              }}
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                fontSize: 18,
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              x
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div
          style={{
            display: "flex",
            padding: "8px 16px",
            gap: 4,
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              title={m.description}
              className={`ai-mode-tab ${mode === m.value ? "ai-mode-tab-active" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <div
          style={{
            padding: "6px 16px",
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.35)",
            fontStyle: "italic",
            borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
          }}
        >
          {MODES.find((m) => m.value === mode)?.description}
        </div>

        {/* Posek selector (only in posek_view mode) */}
        {mode === "posek_view" && (
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Select Posek
            </div>
            <select
              value={selectedPosek}
              onChange={(e) => setSelectedPosek(e.target.value)}
              className="select-field"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 13,
              }}
            >
              {POSKIM.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.era})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Context badge */}
        {aiContext && (
          <div
            style={{
              margin: "8px 16px 0",
              padding: "8px 12px",
              background: "rgba(212, 175, 55, 0.06)",
              border: "1px solid rgba(212, 175, 55, 0.15)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Asking about passage
              </div>
              <div style={{ fontSize: 12, color: "#d4af37", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {aiContext.work} {aiContext.section && `- ${aiContext.section}`}
              </div>
            </div>
            <button
              onClick={() => setAiContext(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                fontSize: 14,
                padding: 2,
                flexShrink: 0,
              }}
            >
              x
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", color: "#d4af37" }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.4)", marginBottom: 16 }}>
                Ask a halakhic question
              </div>

              {/* Quick actions */}
              <div className="ai-quick-actions">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => {
                      if (aiContext?.text) {
                        sendMessage(qa.prompt);
                      } else {
                        setInput(qa.prompt);
                        inputRef.current?.focus();
                      }
                    }}
                    className="ai-quick-action-btn"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "90%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background:
                    msg.role === "user"
                      ? "rgba(212, 175, 55, 0.12)"
                      : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${
                    msg.role === "user"
                      ? "rgba(212, 175, 55, 0.2)"
                      : "rgba(255, 255, 255, 0.06)"
                  }`,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(255, 255, 255, 0.88)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.role === "assistant" && msg.sources
                  ? renderContentWithCitations(msg.content, msg.sources)
                  : msg.content}

                {/* Source list */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      Sources
                    </div>
                    {msg.sources.map((s, si) => (
                      <a
                        key={si}
                        href={`/reader?work=${encodeURIComponent(s.work)}&section=${encodeURIComponent(s.sectionRef)}`}
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#d4af37",
                          textDecoration: "none",
                          padding: "2px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        [{si + 1}] {s.work} {s.sectionRef}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    borderTopColor: "#d4af37",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>
                  Researching...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "8px 12px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a halakhic question..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                lineHeight: 1.5,
                resize: "none",
                maxHeight: 120,
                fontFamily: "inherit",
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() ? "#d4af37" : "rgba(255, 255, 255, 0.06)",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: input.trim() ? "pointer" : "default",
                color: input.trim() ? "#0a0e1a" : "rgba(255, 255, 255, 0.2)",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.25)", marginTop: 6, textAlign: "center" }}>
            For learning only. Consult a rabbi for practical halacha.
          </div>
        </div>
      </div>
    </>
  );
}
