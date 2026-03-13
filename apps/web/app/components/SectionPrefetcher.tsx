"use client";

import { useRef, useEffect, useCallback } from "react";

interface PrefetchedData {
  texts: unknown[];
  timestamp: number;
}

const prefetchCache = new Map<string, PrefetchedData>();

function cacheKey(work: string, section: string): string {
  return `${work}:${section}`;
}

export function usePrefetchedSection(
  work: string,
  section: string
): PrefetchedData | null {
  const key = cacheKey(work, section);
  return prefetchCache.get(key) ?? null;
}

interface SectionPrefetcherProps {
  work: string;
  currentSection: string;
  allSections: string[];
}

export default function SectionPrefetcher({
  work,
  currentSection,
  allSections,
}: SectionPrefetcherProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prefetchingRef = useRef<Set<string>>(new Set());

  const getNextSection = useCallback((): string | null => {
    const idx = allSections.indexOf(currentSection);
    if (idx === -1 || idx >= allSections.length - 1) return null;
    return allSections[idx + 1];
  }, [currentSection, allSections]);

  const prefetchSection = useCallback(
    async (section: string) => {
      const key = cacheKey(work, section);
      if (prefetchCache.has(key) || prefetchingRef.current.has(key)) return;

      prefetchingRef.current.add(key);

      try {
        const params = new URLSearchParams({ work, section });
        const res = await fetch(`/api/reader/text?${params}`, {
          priority: "low",
        } as RequestInit);

        if (res.ok) {
          const data = await res.json();
          prefetchCache.set(key, {
            texts: data as unknown[],
            timestamp: Date.now(),
          });
        }
      } catch {
        // Silently fail — prefetch is best-effort
      } finally {
        prefetchingRef.current.delete(key);
      }
    },
    [work]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          const next = getNextSection();
          if (next) {
            prefetchSection(next);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [getNextSection, prefetchSection]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{
        height: 1,
        width: "100%",
        pointerEvents: "none",
        opacity: 0,
      }}
    />
  );
}
