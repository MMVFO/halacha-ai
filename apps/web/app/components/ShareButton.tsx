"use client";

import { useState, useRef, useEffect } from "react";
import { generatePdf } from "../lib/generatePdf";

interface ShareButtonProps {
  work: string;
  section?: string;
  title?: string;
}

type ExportFormat = "text" | "markdown" | "html";

export function ShareButton({ work, section, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const getShareUrl = () => {
    const base = window.location.origin;
    const params = new URLSearchParams({ work });
    if (section) params.set("section", section);
    return `${base}/reader?${params.toString()}`;
  };

  const copyUrl = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = getShareUrl();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  };

  const exportAs = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ work, section, format }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const ext = format === "html" ? "html" : format === "markdown" ? "md" : "txt";
      const filename = `${work.replace(/[^a-zA-Z0-9]/g, "_")}${section ? `_${section.replace(/[^a-zA-Z0-9]/g, "_")}` : ""}.${ext}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: title || `${work}${section ? ` - ${section}` : ""}`,
        url: getShareUrl(),
      });
    } catch {
      // User cancelled
    }
    setOpen(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        title="Share or export"
        aria-label="Share or export"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {open && (
        <div
          className="share-menu fade-in"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-elevated)",
            padding: 4,
            zIndex: 100,
            minWidth: 200,
          }}
        >
          {/* Copy link */}
          <button onClick={copyUrl} disabled={copying} className="share-menu-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {copied ? "Copied!" : "Copy link"}
          </button>

          {/* Native share */}
          {hasNativeShare && (
            <button onClick={nativeShare} className="share-menu-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share...
            </button>
          )}

          <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />

          {/* Export options */}
          <div style={{ padding: "4px 12px 2px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Export as
          </div>
          <button onClick={() => exportAs("text")} disabled={exporting} className="share-menu-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Plain Text (.txt)
          </button>
          <button onClick={() => exportAs("markdown")} disabled={exporting} className="share-menu-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Markdown (.md)
          </button>
          <button onClick={() => exportAs("html")} disabled={exporting} className="share-menu-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            HTML (.html)
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ work, section, format: "text" }),
                });
                if (!res.ok) return;
                const text = await res.text();
                const pdfTitle = `${work}${section ? ` - ${section}` : ""}`;
                generatePdf(pdfTitle, text);
              } catch {
                // silently fail
              }
              setOpen(false);
            }}
            disabled={exporting}
            className="share-menu-item"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
            PDF (Print)
          </button>
        </div>
      )}
    </div>
  );
}
