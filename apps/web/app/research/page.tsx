"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import Link from "next/link";
import { ResearchPane, ResearchPaneHandle } from "../components/ResearchPane";

interface ResearchSession {
  id: number;
  title: string | null;
  context_work: string | null;
  context_section: string | null;
  messages: { role: string; content: string; references?: string[] }[];
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { id: number; work: string; sectionRef: string; community: string }[];
  references?: string[];
}

function generatePaneId() {
  return `pane-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ResearchWorkbench() {
  // Pane management
  const [paneIds, setPaneIds] = useState<string[]>(() => [generatePaneId(), generatePaneId()]);
  const paneRefs = useRef<Map<string, ResearchPaneHandle>>(new Map());

  // Sync-scroll
  const [syncedPanes, setSyncedPanes] = useState<Set<string>>(new Set());
  const isSyncing = useRef(false);

  // AI session
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [, setActiveSession] = useState<ResearchSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Session search
  const [sessionSearch, setSessionSearch] = useState("");

  // Layout save/restore
  const [savedLayouts, setSavedLayouts] = useState<{ id: string; name: string; panes: { work: string; section: string }[]; createdAt: string }[]>([]);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Add pane
  const addPane = () => {
    if (paneIds.length >= 4) return;
    setPaneIds((prev) => [...prev, generatePaneId()]);
  };

  // Remove pane
  const removePane = (id: string) => {
    if (paneIds.length <= 1) return;
    setPaneIds((prev) => prev.filter((p) => p !== id));
    setSyncedPanes((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    paneRefs.current.delete(id);
  };

  // Toggle sync for a pane
  const toggleSync = (id: string) => {
    setSyncedPanes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sync scroll handler
  useEffect(() => {
    const syncedIds = Array.from(syncedPanes);
    if (syncedIds.length < 2) return;

    const handleScroll = (sourceId: string) => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      const sourcePane = paneRefs.current.get(sourceId);
      const sourceEl = sourcePane?.scrollRef?.current;
      if (!sourceEl) { isSyncing.current = false; return; }

      const ratio = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);

      for (const targetId of syncedIds) {
        if (targetId === sourceId) continue;
        const targetPane = paneRefs.current.get(targetId);
        const targetEl = targetPane?.scrollRef?.current;
        if (targetEl) {
          targetEl.scrollTop = ratio * (targetEl.scrollHeight - targetEl.clientHeight);
        }
      }

      requestAnimationFrame(() => { isSyncing.current = false; });
    };

    const listeners: { el: HTMLDivElement; handler: () => void }[] = [];
    for (const id of syncedIds) {
      const pane = paneRefs.current.get(id);
      const el = pane?.scrollRef?.current;
      if (el) {
        const handler = () => handleScroll(id);
        el.addEventListener("scroll", handler, { passive: true });
        listeners.push({ el, handler });
      }
    }

    return () => {
      for (const { el, handler } of listeners) {
        el.removeEventListener("scroll", handler);
      }
    };
  }, [syncedPanes, paneIds]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/research/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Fetch saved layouts
  const fetchLayouts = useCallback(async () => {
    try {
      const res = await fetch("/api/research/layouts?userId=1");
      if (res.ok) {
        const data = await res.json();
        setSavedLayouts(data.layouts || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLayouts(); }, [fetchLayouts]);

  // Save current layout
  const saveLayout = useCallback(async (name: string) => {
    const paneContexts: { work: string; section: string }[] = [];
    for (const id of paneIds) {
      const pane = paneRefs.current.get(id);
      const ctx = pane?.getContext?.();
      if (ctx) paneContexts.push({ work: ctx.work, section: ctx.section });
    }

    if (paneContexts.length === 0) return;

    try {
      await fetch("/api/research/layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, name, panes: paneContexts }),
      });
      fetchLayouts();
      setShowSaveDialog(false);
      setLayoutName("");
    } catch { /* ignore */ }
  }, [paneIds, fetchLayouts]);

  // Load layout
  const loadLayout = useCallback((layout: { panes: { work: string; section: string }[] }) => {
    const newPaneIds = layout.panes.map(() => generatePaneId());
    setPaneIds(newPaneIds);
    // Panes will need to load content based on the layout data
    // Store layout data so ResearchPane can pick it up
    setTimeout(() => {
      for (let i = 0; i < layout.panes.length; i++) {
        const pane = paneRefs.current.get(newPaneIds[i]);
        if (pane?.loadWork) {
          pane.loadWork(layout.panes[i].work, layout.panes[i].section);
        }
      }
    }, 500);
    setShowLayoutMenu(false);
  }, []);

  // Filter sessions by search
  const filteredSessions = sessionSearch.trim()
    ? sessions.filter((s) => {
        const q = sessionSearch.toLowerCase();
        if (s.title?.toLowerCase().includes(q)) return true;
        if (s.messages?.some((m) => m.content.toLowerCase().includes(q))) return true;
        return false;
      })
    : sessions;

  // Load session
  const loadSession = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        const session = data.session as ResearchSession;
        setActiveSession(session);
        setActiveSessionId(sessionId);
        setMessages(
          (session.messages || []).map((m: { role: string; content: string; references?: string[] }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            references: m.references,
          }))
        );
      }
    } catch { /* ignore */ }
  }, []);

  // Create new session
  const createSession = useCallback(async () => {
    const paneContexts: string[] = [];
    for (const id of paneIds) {
      const pane = paneRefs.current.get(id);
      const ctx = pane?.getContext?.();
      if (ctx) paneContexts.push(`${ctx.work} - ${ctx.section}`);
    }

    try {
      const res = await fetch("/api/research/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: paneContexts.length > 0
            ? `Research: ${paneContexts.join(" + ")}`
            : `Research Session`,
          contextWork: paneContexts[0]?.split(" - ")[0],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSessionId(data.session.id);
        setActiveSession(data.session);
        setMessages([]);
        fetchSessions();
      }
    } catch { /* ignore */ }
  }, [paneIds, fetchSessions]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading) return;

    // Gather context from all panes
    const paneContexts: { work: string; section: string; text: string }[] = [];
    for (const id of paneIds) {
      const pane = paneRefs.current.get(id);
      const ctx = pane?.getContext?.();
      if (ctx) paneContexts.push(ctx);
    }

    const references = paneContexts.map((c) => `${c.work} ${c.section}`);
    const userMsg: ChatMessage = { role: "user", content: text.trim(), references };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    // Ensure session exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const res = await fetch("/api/research/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Research: ${references.join(" + ") || "General"}`,
            contextWork: paneContexts[0]?.work,
            contextSection: paneContexts[0]?.section,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          sessionId = data.session.id;
          setActiveSessionId(sessionId);
          setActiveSession(data.session);
          fetchSessions();
        }
      } catch { /* ignore */ }
    }

    // Build combined context text
    const combinedContext = paneContexts.length > 0
      ? paneContexts.map((c) => `[${c.work} ${c.section}]\n${c.text}`).join("\n\n---\n\n")
      : undefined;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          mode: "deep_analytic",
          community: "General",
          corpusTiers: ["canonical"],
          context: combinedContext
            ? { work: paneContexts[0]?.work, section: paneContexts[0]?.section, text: combinedContext }
            : undefined,
          sessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errData.error || "Request failed"}` },
        ]);
        setChatLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Error: No response stream" }]);
        setChatLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullContent = "";
      let sources: ChatMessage["sources"] = [];

      setMessages((prev) => [...prev, { role: "assistant", content: "", references }]);

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
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, sources };
                }
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to AI service." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [paneIds, activeSessionId, chatLoading, fetchSessions]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput);
    }
  };

  return (
    <div className="research-workbench">
      {/* Top toolbar */}
      <div className="research-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="research-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="research-title">Research Workbench</h1>
            <div className="research-subtitle">
              {paneIds.length} pane{paneIds.length !== 1 ? "s" : ""}
              {syncedPanes.size >= 2 && " \u00b7 scroll synced"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={addPane}
            disabled={paneIds.length >= 4}
            className="btn-ghost research-add-pane-btn"
            title="Add pane (max 4)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Pane
          </button>

          {/* Save Layout */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="btn-ghost"
              title="Save current layout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </button>
            {showSaveDialog && (
              <div className="layout-save-dialog fade-in" style={{
                position: "absolute", top: "100%", right: 0, marginTop: 4,
                background: "var(--bg-surface)", border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-elevated)",
                padding: 12, zIndex: 100, width: 220,
              }}>
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="Layout name..."
                  autoFocus
                  style={{
                    width: "100%", padding: "8px 10px", background: "var(--bg-glass)",
                    border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-sans)",
                    outline: "none", marginBottom: 8,
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter" && layoutName.trim()) saveLayout(layoutName.trim()); }}
                />
                <button
                  onClick={() => layoutName.trim() && saveLayout(layoutName.trim())}
                  disabled={!layoutName.trim()}
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "center", background: layoutName.trim() ? "var(--gold-dim)" : undefined, color: layoutName.trim() ? "var(--gold)" : undefined }}
                >
                  Save Layout
                </button>
              </div>
            )}
          </div>

          {/* Load Layout */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="btn-ghost"
              title="Load saved layout"
              disabled={savedLayouts.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Layouts{savedLayouts.length > 0 ? ` (${savedLayouts.length})` : ""}
            </button>
            {showLayoutMenu && savedLayouts.length > 0 && (
              <div className="layout-menu fade-in" style={{
                position: "absolute", top: "100%", right: 0, marginTop: 4,
                background: "var(--bg-surface)", border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-elevated)",
                padding: 4, zIndex: 100, minWidth: 200, maxHeight: 240, overflowY: "auto",
              }}>
                {savedLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => loadLayout(layout)}
                    style={{
                      display: "block", width: "100%", padding: "8px 12px",
                      background: "transparent", border: "none", cursor: "pointer",
                      textAlign: "left", borderRadius: "var(--radius-sm)",
                      transition: "all 0.15s ease", fontFamily: "var(--font-sans)",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "var(--gold-dim)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{layout.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {layout.panes.length} pane{layout.panes.length !== 1 ? "s" : ""} &middot; {new Date(layout.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`btn-ghost ${showSidebar ? "research-sidebar-toggle-active" : ""}`}
            title="Toggle AI sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            AI Research
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="research-main">
        {/* Panes area */}
        <div className="research-panes-container" style={{ flex: 1 }}>
          <PanelGroup orientation="horizontal">
            {paneIds.map((id, idx) => (
              <PanelGroupItem key={id}>
                {idx > 0 && (
                  <PanelResizeHandle className="research-resize-handle">
                    <div className="research-resize-handle-bar" />
                  </PanelResizeHandle>
                )}
                <Panel minSize={15} defaultSize={100 / paneIds.length}>
                  <ResearchPane
                    ref={(handle) => {
                      if (handle) paneRefs.current.set(id, handle);
                      else paneRefs.current.delete(id);
                    }}
                    paneId={id}
                    onRemove={removePane}
                    isSynced={syncedPanes.has(id)}
                    onSyncToggle={toggleSync}
                    showSyncButton={paneIds.length >= 2}
                  />
                </Panel>
              </PanelGroupItem>
            ))}
          </PanelGroup>
        </div>

        {/* AI Session sidebar */}
        {showSidebar && (
          <div className="session-sidebar">
            {/* Session list header */}
            <div className="session-sidebar-header">
              <span className="session-sidebar-title">Sessions</span>
              <button onClick={createSession} className="session-new-btn" title="New session">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Session search */}
            <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ position: "relative" }}>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Search sessions..."
                  style={{
                    width: "100%", padding: "6px 10px 6px 30px",
                    background: "var(--bg-glass)", border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                    fontSize: 12, fontFamily: "var(--font-sans)", outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Session list */}
            <div className="session-list">
              {filteredSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className={`session-list-item ${activeSessionId === s.id ? "active" : ""}`}
                >
                  <div className="session-list-item-title">
                    {s.title || `Session #${s.id}`}
                  </div>
                  <div className="session-list-item-meta">
                    {new Date(s.updated_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {filteredSessions.length === 0 && (
                <div style={{ padding: "16px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                  {sessionSearch ? "No matching sessions" : "No sessions yet"}
                </div>
              )}
            </div>

            {/* Chat messages */}
            <div className="session-messages">
              {messages.length === 0 && (
                <div className="session-messages-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)", opacity: 0.25, marginBottom: 8 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <div>Ask about the texts you are reading</div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`session-message session-message-${msg.role}`}>
                  {msg.references && msg.references.length > 0 && (
                    <div className="session-message-refs">
                      {msg.references.map((r, ri) => (
                        <span key={ri} className="session-message-ref-tag">{r}</span>
                      ))}
                    </div>
                  )}
                  <div className="session-message-content">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="session-message-sources">
                      {msg.sources.map((s, si) => (
                        <a
                          key={si}
                          href={`/reader?work=${encodeURIComponent(s.work)}&section=${encodeURIComponent(s.sectionRef)}`}
                          className="session-message-source-link"
                        >
                          [{si + 1}] {s.work} {s.sectionRef}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="session-message session-message-assistant">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="pane-spinner" />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Researching...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="session-input-area">
              <div className="session-input-wrapper">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask about the texts..."
                  rows={1}
                  className="session-input"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 100) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(chatInput)}
                  disabled={!chatInput.trim() || chatLoading}
                  className="session-send-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to render PanelGroup children with resize handles interleaved
function PanelGroupItem({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
