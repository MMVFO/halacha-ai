"use client";

import { useState } from "react";

interface Annotation {
  id: number;
  content: string;
  color: string;
  annotation_type: string;
  tags?: string[];
  created_at: string;
}

interface MarginNoteIndicatorProps {
  annotations: Annotation[];
  segmentIndex: number;
}

export function MarginNoteIndicator({ annotations, segmentIndex }: MarginNoteIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  if (annotations.length === 0) return null;

  return (
    <div className="margin-note-container" data-segment={segmentIndex}>
      <button
        className={`margin-note-dot ${expanded ? "expanded" : ""}`}
        onClick={() => setExpanded(!expanded)}
        title={`${annotations.length} note${annotations.length !== 1 ? "s" : ""}`}
        aria-label={`${annotations.length} annotation${annotations.length !== 1 ? "s" : ""}`}
      >
        <span className="margin-note-count">{annotations.length}</span>
      </button>

      {expanded && (
        <div className="margin-notes-panel fade-in">
          <div className="margin-notes-header">
            <span className="margin-notes-title">
              {annotations.length} Note{annotations.length !== 1 ? "s" : ""}
            </span>
            <button
              className="margin-notes-close"
              onClick={() => setExpanded(false)}
              aria-label="Close notes"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {annotations.map((ann) => (
            <div key={ann.id} className="margin-note-item" style={{ borderLeftColor: ann.color || "var(--gold)" }}>
              <div className="margin-note-type">{ann.annotation_type}</div>
              <div className="margin-note-content">{ann.content}</div>
              {ann.tags && ann.tags.length > 0 && (
                <div className="margin-note-tags">
                  {ann.tags.map((tag, i) => (
                    <span key={i} className="margin-note-tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="margin-note-date">
                {new Date(ann.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MarginNotesColumnProps {
  annotationsBySegment: Map<number, Annotation[]>;
  segmentCount: number;
}

export function MarginNotesColumn({ annotationsBySegment, segmentCount }: MarginNotesColumnProps) {
  return (
    <div className="margin-notes-column">
      {Array.from({ length: segmentCount }, (_, i) => (
        <MarginNoteIndicator
          key={i}
          annotations={annotationsBySegment.get(i) || []}
          segmentIndex={i}
        />
      ))}
    </div>
  );
}
