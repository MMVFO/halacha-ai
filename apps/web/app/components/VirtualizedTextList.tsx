"use client";

import { useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface TextItem {
  id: number;
  text: string;
  section_ref: string;
  language: string;
}

interface VirtualizedTextListProps {
  items: TextItem[];
  estimateSize?: number;
  className?: string;
  onItemVisible?: (item: TextItem) => void;
}

const RTL_LANGUAGES = new Set(["hebrew", "aramaic", "he", "arc"]);

function isRtl(language: string): boolean {
  return RTL_LANGUAGES.has(language.toLowerCase());
}

export default function VirtualizedTextList({
  items,
  estimateSize = 80,
  className,
  onItemVisible,
}: VirtualizedTextListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef<Set<number>>(new Set());

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 5,
  });

  const handleVisibility = useCallback(
    (index: number) => {
      if (onItemVisible && !visibleRef.current.has(index)) {
        visibleRef.current.add(index);
        onItemVisible(items[index]);
      }
    },
    [items, onItemVisible]
  );

  useEffect(() => {
    if (!onItemVisible) return;
    const virtualItems = virtualizer.getVirtualItems();
    for (const vItem of virtualItems) {
      handleVisibility(vItem.index);
    }
  }, [virtualizer.getVirtualItems(), handleVisibility, onItemVisible]);

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height: "100%",
        overflow: "auto",
        contain: "strict",
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          const rtl = isRtl(item.language);

          return (
            <div
              key={item.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                dir={rtl ? "rtl" : "ltr"}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "rgba(212, 175, 55, 0.6)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.section_ref}
                </span>
                <span
                  style={{
                    fontSize: rtl ? "1.15rem" : "1rem",
                    lineHeight: 1.7,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {item.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
