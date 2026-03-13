"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

// --- Types ---

export interface TalmudChunk {
  id: number;
  work: string;
  section_ref: string;
  parent_ref: string | null;
  language: string;
  text: string;
}

interface SegmentPosition {
  top: number;
  height: number;
  ref: string;
}

interface TalmudLayoutProps {
  mainChunks: TalmudChunk[];
  rashiChunks: TalmudChunk[];
  tosafotChunks: TalmudChunk[];
  fontSize: number;
  languageFilter?: "all" | "he" | "en" | "arc";
  highlightedSegment: string | null;
  onHighlight: (ref: string | null) => void;
}

// --- Alignment Engine ---

function useVerticalAlignment(
  mainRef: React.RefObject<HTMLDivElement | null>,
  commentaryRef: React.RefObject<HTMLDivElement | null>,
  mainChunks: TalmudChunk[],
  commentaryChunks: TalmudChunk[],
  fontSize: number,
  mainToCommentaryMap: Map<string, string[]>,
) {
  const [offsets, setOffsets] = useState<Map<string, number>>(new Map());

  const calculate = useCallback(() => {
    if (!mainRef.current || !commentaryRef.current) return;

    const mainSegments: SegmentPosition[] = [];
    mainRef.current.querySelectorAll("[data-segment-ref]").forEach((el) => {
      const ref = el.getAttribute("data-segment-ref")!;
      const rect = el as HTMLElement;
      mainSegments.push({
        top: rect.offsetTop,
        height: rect.offsetHeight,
        ref,
      });
    });

    const commentarySegments = new Map<string, HTMLElement>();
    commentaryRef.current.querySelectorAll("[data-commentary-ref]").forEach((el) => {
      const ref = el.getAttribute("data-commentary-ref")!;
      commentarySegments.set(ref, el as HTMLElement);
    });

    const newOffsets = new Map<string, number>();
    let lastBottom = 0;

    for (const mainSeg of mainSegments) {
      const commentaryRefs = mainToCommentaryMap.get(mainSeg.ref) || [];
      for (const cRef of commentaryRefs) {
        const cEl = commentarySegments.get(cRef);
        if (!cEl) continue;

        const desiredTop = mainSeg.top;
        const naturalTop = cEl.offsetTop;
        let offset = desiredTop - naturalTop;

        // Push-down: don't overlap with previous commentary block
        const actualTop = naturalTop + offset;
        if (actualTop < lastBottom + 8) {
          offset = lastBottom + 8 - naturalTop;
        }

        newOffsets.set(cRef, offset);
        lastBottom = naturalTop + offset + cEl.offsetHeight;
      }
    }

    setOffsets(newOffsets);
  }, [mainRef, commentaryRef, mainChunks, commentaryChunks, mainToCommentaryMap]);

  useEffect(() => {
    const timer = setTimeout(calculate, 100);
    return () => clearTimeout(timer);
  }, [calculate, fontSize]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculate();
    });
    if (mainRef.current) observer.observe(mainRef.current);
    if (commentaryRef.current) observer.observe(commentaryRef.current);
    return () => observer.disconnect();
  }, [calculate, mainRef, commentaryRef]);

  return { offsets, recalculate: calculate };
}

// --- Build anchor map ---

function buildAnchorMap(
  mainChunks: TalmudChunk[],
  commentaryChunks: TalmudChunk[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const commentary of commentaryChunks) {
    const anchor =
      commentary.parent_ref ||
      findClosestMainRef(commentary.section_ref, mainChunks);

    if (anchor) {
      const existing = map.get(anchor) || [];
      existing.push(commentary.section_ref);
      map.set(anchor, existing);
    }
  }

  // For unmatched commentary, assign to the first main chunk
  const assignedRefs = new Set(Array.from(map.values()).flat());
  const unmatched = commentaryChunks.filter(
    (c) => !assignedRefs.has(c.section_ref),
  );
  if (unmatched.length > 0 && mainChunks.length > 0) {
    const firstRef = mainChunks[0].section_ref;
    const existing = map.get(firstRef) || [];
    for (const c of unmatched) {
      existing.push(c.section_ref);
    }
    map.set(firstRef, existing);
  }

  return map;
}

function findClosestMainRef(
  commentaryRef: string,
  mainChunks: TalmudChunk[],
): string | null {
  const parts = commentaryRef.split(/[:\s.]+/);
  for (let i = parts.length; i > 0; i--) {
    const candidate = parts.slice(-i).join(":");
    const match = mainChunks.find(
      (m) =>
        m.section_ref === candidate ||
        m.section_ref.endsWith(candidate) ||
        candidate.endsWith(m.section_ref),
    );
    if (match) return match.section_ref;
  }

  const nums = commentaryRef.match(/(\d+[:.]\d+)/);
  if (nums) {
    const match = mainChunks.find((m) => m.section_ref.includes(nums[1]));
    if (match) return match.section_ref;
  }

  return mainChunks.length > 0 ? mainChunks[0].section_ref : null;
}

// --- Reverse map: commentary ref -> main ref ---

function buildReverseMap(anchorMap: Map<string, string[]>): Map<string, string> {
  const reverse = new Map<string, string>();
  for (const [mainRef, commentaryRefs] of anchorMap.entries()) {
    for (const cRef of commentaryRefs) {
      reverse.set(cRef, mainRef);
    }
  }
  return reverse;
}

// --- Strip HTML tags for safe text rendering ---

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// --- Components ---

function SegmentBlock({
  chunk,
  fontSize,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  dataAttr,
  isCommentary,
  offset,
}: {
  chunk: TalmudChunk;
  fontSize: number;
  isHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  dataAttr: string;
  isCommentary?: boolean;
  offset?: number;
}) {
  const isHebrew = chunk.language === "he" || chunk.language === "arc";
  const baseFontSize = isCommentary ? fontSize * 0.85 : fontSize;

  const style: CSSProperties = {
    fontSize: `${baseFontSize}rem`,
    lineHeight: isCommentary ? 1.6 : 1.8,
    direction: isHebrew ? "rtl" : "ltr",
    textAlign: isHebrew ? "right" : "left",
    fontFamily: isHebrew
      ? "'Noto Serif Hebrew', var(--font-serif)"
      : "var(--font-serif)",
    ...(offset !== undefined ? { transform: `translateY(${offset}px)` } : {}),
  };

  return (
    <div
      className={`talmud-segment ${isHighlighted ? "talmud-segment-highlighted" : ""} ${isCommentary ? "talmud-commentary-block" : ""}`}
      {...{ [`data-${dataAttr}`]: chunk.section_ref }}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="talmud-segment-ref-label" dir="ltr">
        {chunk.section_ref}
      </span>
      <div className="talmud-segment-text">
        {stripHtml(chunk.text)}
      </div>
    </div>
  );
}

function CommentaryPanel({
  title,
  chunks,
  fontSize,
  highlightedSegment,
  onHighlight,
  anchorMap,
  reverseMap,
  panelRef,
  offsets,
  side,
}: {
  title: string;
  chunks: TalmudChunk[];
  fontSize: number;
  highlightedSegment: string | null;
  onHighlight: (ref: string | null) => void;
  anchorMap: Map<string, string[]>;
  reverseMap: Map<string, string>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  offsets: Map<string, number>;
  side: "left" | "right";
}) {
  if (chunks.length === 0) {
    return (
      <div className="talmud-panel talmud-commentary-panel" data-side={side}>
        <div className="talmud-panel-header">
          <span className="talmud-panel-title">{title}</span>
        </div>
        <div className="talmud-empty-state">
          No {title} commentary found for this section
        </div>
      </div>
    );
  }

  return (
    <div className="talmud-panel talmud-commentary-panel" data-side={side} ref={panelRef}>
      <div className="talmud-panel-header">
        <span className="talmud-panel-title">{title}</span>
        <span className="talmud-panel-count">{chunks.length}</span>
      </div>
      <div className="talmud-panel-content">
        {chunks.map((chunk) => {
          const mainRef = reverseMap.get(chunk.section_ref);
          const isHighlighted =
            highlightedSegment === chunk.section_ref ||
            (mainRef != null && highlightedSegment === mainRef);

          return (
            <SegmentBlock
              key={chunk.id}
              chunk={chunk}
              fontSize={fontSize}
              isHighlighted={isHighlighted}
              onMouseEnter={() => {
                onHighlight(chunk.section_ref);
              }}
              onMouseLeave={() => onHighlight(null)}
              dataAttr="commentary-ref"
              isCommentary
              offset={offsets.get(chunk.section_ref)}
            />
          );
        })}
      </div>
    </div>
  );
}

// --- Main Export ---

export default function TalmudLayout({
  mainChunks,
  rashiChunks,
  tosafotChunks,
  fontSize,
  highlightedSegment,
  onHighlight,
}: TalmudLayoutProps) {
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const rashiPanelRef = useRef<HTMLDivElement>(null);
  const tosafotPanelRef = useRef<HTMLDivElement>(null);

  const rashiAnchorMap = useMemo(
    () => buildAnchorMap(mainChunks, rashiChunks),
    [mainChunks, rashiChunks],
  );
  const tosafotAnchorMap = useMemo(
    () => buildAnchorMap(mainChunks, tosafotChunks),
    [mainChunks, tosafotChunks],
  );
  const rashiReverseMap = useMemo(
    () => buildReverseMap(rashiAnchorMap),
    [rashiAnchorMap],
  );
  const tosafotReverseMap = useMemo(
    () => buildReverseMap(tosafotAnchorMap),
    [tosafotAnchorMap],
  );

  const { offsets: rashiOffsets } = useVerticalAlignment(
    mainPanelRef,
    rashiPanelRef,
    mainChunks,
    rashiChunks,
    fontSize,
    rashiAnchorMap,
  );
  const { offsets: tosafotOffsets } = useVerticalAlignment(
    mainPanelRef,
    tosafotPanelRef,
    mainChunks,
    tosafotChunks,
    fontSize,
    tosafotAnchorMap,
  );

  // Determine which main segments are highlighted via commentary hover
  const highlightedMainRef = useMemo(() => {
    if (!highlightedSegment) return null;
    const fromRashi = rashiReverseMap.get(highlightedSegment);
    if (fromRashi) return fromRashi;
    const fromTosafot = tosafotReverseMap.get(highlightedSegment);
    if (fromTosafot) return fromTosafot;
    if (mainChunks.some((c) => c.section_ref === highlightedSegment))
      return highlightedSegment;
    return null;
  }, [highlightedSegment, rashiReverseMap, tosafotReverseMap, mainChunks]);

  return (
    <div className="talmud-layout">
      <Group orientation="horizontal" className="talmud-panel-group">
        {/* Rashi (left/start) */}
        <Panel id="rashi" defaultSize={25} minSize={15} className="talmud-panel-wrapper">
          <CommentaryPanel
            title="Rashi"
            chunks={rashiChunks}
            fontSize={fontSize}
            highlightedSegment={highlightedSegment}
            onHighlight={onHighlight}
            anchorMap={rashiAnchorMap}
            reverseMap={rashiReverseMap}
            panelRef={rashiPanelRef}
            offsets={rashiOffsets}
            side="left"
          />
        </Panel>

        <Separator className="talmud-resize-handle">
          <div className="talmud-resize-line" />
        </Separator>

        {/* Main text (center) */}
        <Panel id="main" defaultSize={50} minSize={25} className="talmud-panel-wrapper">
          <div className="talmud-panel talmud-main-panel" ref={mainPanelRef}>
            <div className="talmud-panel-header">
              <span className="talmud-panel-title">
                {mainChunks.length > 0 ? mainChunks[0].work : "Main Text"}
              </span>
            </div>
            <div className="talmud-panel-content">
              {mainChunks.map((chunk) => {
                const isHighlighted = highlightedMainRef === chunk.section_ref;

                return (
                  <SegmentBlock
                    key={chunk.id}
                    chunk={chunk}
                    fontSize={fontSize}
                    isHighlighted={isHighlighted}
                    onMouseEnter={() => onHighlight(chunk.section_ref)}
                    onMouseLeave={() => onHighlight(null)}
                    dataAttr="segment-ref"
                  />
                );
              })}
              {mainChunks.length === 0 && (
                <div className="talmud-empty-state">
                  No text loaded. Select a work and section to begin.
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Separator className="talmud-resize-handle">
          <div className="talmud-resize-line" />
        </Separator>

        {/* Tosafot (right/end) */}
        <Panel id="tosafot" defaultSize={25} minSize={15} className="talmud-panel-wrapper">
          <CommentaryPanel
            title="Tosafot"
            chunks={tosafotChunks}
            fontSize={fontSize}
            highlightedSegment={highlightedSegment}
            onHighlight={onHighlight}
            anchorMap={tosafotAnchorMap}
            reverseMap={tosafotReverseMap}
            panelRef={tosafotPanelRef}
            offsets={tosafotOffsets}
            side="right"
          />
        </Panel>
      </Group>
    </div>
  );
}
