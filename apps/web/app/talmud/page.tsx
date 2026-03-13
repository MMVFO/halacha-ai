"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TalmudLayout, { type TalmudChunk } from "../components/TalmudLayout";
import { useAppStore } from "../store";

interface ApiChunk {
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

interface TextResponse {
  work: string;
  chunks: ApiChunk[];
  total: number;
  hasMore: boolean;
}

interface CommentaryResponse {
  commentaries: Record<string, ApiChunk[]>;
}

export default function TalmudPage() {
  const searchParams = useSearchParams();
  const work = searchParams.get("work") || "";
  const section = searchParams.get("section") || "";

  const { fontSize, setFontSize } = useAppStore();

  const [mainChunks, setMainChunks] = useState<TalmudChunk[]>([]);
  const [rashiChunks, setRashiChunks] = useState<TalmudChunk[]>([]);
  const [tosafotChunks, setTosafotChunks] = useState<TalmudChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedSegment, setHighlightedSegment] = useState<string | null>(null);

  // Navigation state
  const [workInput, setWorkInput] = useState(work);
  const [sectionInput, setSectionInput] = useState(section);

  const fetchData = useCallback(async () => {
    if (!work) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch main text
      const textParams = new URLSearchParams({ work });
      if (section) textParams.set("section", section);
      textParams.set("limit", "100");

      const textRes = await fetch(`/api/reader/text?${textParams}`);
      if (!textRes.ok) throw new Error("Failed to fetch text");
      const textData: TextResponse = await textRes.json();

      const mainResult: TalmudChunk[] = textData.chunks.map((c) => ({
        id: c.id,
        work: c.work,
        section_ref: c.section_ref,
        parent_ref: c.parent_ref,
        language: c.language,
        text: c.text,
      }));
      setMainChunks(mainResult);

      // Fetch commentaries for each section_ref in the main text
      const sectionRefs = [...new Set(mainResult.map((c) => c.section_ref))];
      const allRashi: TalmudChunk[] = [];
      const allTosafot: TalmudChunk[] = [];
      const seenIds = new Set<number>();

      // Batch fetch commentaries for all section refs
      for (const ref of sectionRefs.slice(0, 20)) {
        try {
          const commentaryParams = new URLSearchParams({
            work,
            sectionRef: ref,
          });
          const commentaryRes = await fetch(
            `/api/reader/commentaries?${commentaryParams}`,
          );
          if (!commentaryRes.ok) continue;
          const commentaryData: CommentaryResponse = await commentaryRes.json();

          for (const [commentatorWork, chunks] of Object.entries(
            commentaryData.commentaries,
          )) {
            const workLower = commentatorWork.toLowerCase();
            const isRashi = workLower.includes("rashi");
            const isTosafot =
              workLower.includes("tosafot") || workLower.includes("tosaphot");

            for (const c of chunks) {
              if (seenIds.has(c.id)) continue;
              seenIds.add(c.id);

              const chunk: TalmudChunk = {
                id: c.id,
                work: c.work,
                section_ref: c.section_ref,
                parent_ref: c.parent_ref,
                language: c.language,
                text: c.text,
              };

              if (isRashi) allRashi.push(chunk);
              else if (isTosafot) allTosafot.push(chunk);
            }
          }
        } catch {
          // Skip failed commentary fetches
        }
      }

      setRashiChunks(allRashi);
      setTosafotChunks(allTosafot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [work, section]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update inputs when URL params change
  useEffect(() => {
    setWorkInput(work);
    setSectionInput(section);
  }, [work, section]);

  const handleNavigate = () => {
    if (!workInput.trim()) return;
    const params = new URLSearchParams();
    params.set("work", workInput.trim());
    if (sectionInput.trim()) params.set("section", sectionInput.trim());
    window.history.pushState({}, "", `/talmud?${params}`);
    // Trigger re-fetch
    window.location.href = `/talmud?${params}`;
  };

  return (
    <div className="talmud-page">
      {/* Header */}
      <header className="talmud-header">
        <div className="talmud-header-left">
          <Link href="/reader" className="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Reader
          </Link>
          <div className="talmud-header-divider" />
          <h1 className="talmud-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            Traditional Talmud Layout
          </h1>
        </div>

        <div className="talmud-header-controls">
          {/* Font size */}
          <div className="talmud-font-controls">
            <button
              className="btn-ghost"
              onClick={() => setFontSize(Math.max(0.7, fontSize - 0.1))}
              title="Decrease font size"
            >
              A-
            </button>
            <span className="talmud-font-size">{Math.round(fontSize * 100)}%</span>
            <button
              className="btn-ghost"
              onClick={() => setFontSize(Math.min(2.0, fontSize + 0.1))}
              title="Increase font size"
            >
              A+
            </button>
          </div>
        </div>
      </header>

      {/* Navigation bar */}
      <div className="talmud-nav-bar">
        <div className="talmud-nav-inputs">
          <input
            className="input-field talmud-nav-input"
            type="text"
            placeholder="Work (e.g. Berakhot)"
            value={workInput}
            onChange={(e) => setWorkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
          />
          <input
            className="input-field talmud-nav-input"
            type="text"
            placeholder="Section (e.g. 2a)"
            value={sectionInput}
            onChange={(e) => setSectionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
          />
          <button className="btn-primary talmud-nav-go" onClick={handleNavigate}>
            Open
          </button>
        </div>
        {work && (
          <div className="talmud-nav-breadcrumb">
            <span className="talmud-nav-work">{work}</span>
            {section && (
              <>
                <span className="talmud-nav-sep">/</span>
                <span className="talmud-nav-section">{section}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="talmud-content">
        {loading && (
          <div className="talmud-loading">
            <div className="talmud-loading-spinner" />
            <span>Loading text and commentaries...</span>
          </div>
        )}

        {error && (
          <div className="talmud-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !work && (
          <div className="talmud-welcome">
            <div className="talmud-welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M8 7h6" /><path d="M8 11h8" /><path d="M8 15h4" />
              </svg>
            </div>
            <h2>Traditional Talmud View</h2>
            <p>
              Enter a work name and optional section above to view text in the
              classic three-column layout with Rashi and Tosafot commentaries.
            </p>
          </div>
        )}

        {!loading && !error && work && (
          <TalmudLayout
            mainChunks={mainChunks}
            rashiChunks={rashiChunks}
            tosafotChunks={tosafotChunks}
            fontSize={fontSize}
            highlightedSegment={highlightedSegment}
            onHighlight={setHighlightedSegment}
          />
        )}
      </main>
    </div>
  );
}
