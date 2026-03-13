"use client";

import { useRef, useState, useCallback } from "react";

interface SwipeNavigatorProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export function SwipeNavigator({
  onSwipeLeft,
  onSwipeRight,
  children,
  threshold = 50,
}: SwipeNavigatorProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const [indicator, setIndicator] = useState<"left" | "right" | null>(null);
  const [indicatorOpacity, setIndicatorOpacity] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = touch.clientX;
    swiping.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // If vertical scrolling dominates, cancel swipe detection
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
        swiping.current = false;
        setIndicator(null);
        setIndicatorOpacity(0);
        return;
      }

      currentX.current = touch.clientX;
      const absDx = Math.abs(deltaX);

      if (absDx > 15) {
        const dir = deltaX > 0 ? "right" : "left";
        setIndicator(dir);
        setIndicatorOpacity(Math.min(absDx / (threshold * 2), 0.7));
      } else {
        setIndicator(null);
        setIndicatorOpacity(0);
      }
    },
    [threshold]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    swiping.current = false;

    const deltaX = currentX.current - startX.current;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    setIndicator(null);
    setIndicatorOpacity(0);
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return (
    <div
      style={{ position: "relative", touchAction: "pan-y" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}

      {/* Left arrow indicator (swipe right = go back) */}
      {indicator === "right" && (
        <div
          className="swipe-indicator swipe-indicator-left"
          style={{ opacity: indicatorOpacity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
      )}

      {/* Right arrow indicator (swipe left = go forward) */}
      {indicator === "left" && (
        <div
          className="swipe-indicator swipe-indicator-right"
          style={{ opacity: indicatorOpacity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </div>
  );
}
