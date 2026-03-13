"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TimelineRabbi {
  id: number;
  name_en: string;
  name_he?: string | null;
  birth_year: string | null;
  death_year: string | null;
  era: string | null;
  community: string;
}

interface RabbiTimelineProps {
  rabbis: TimelineRabbi[];
}

const ERA_BANDS: { name: string; start: number; end: number; color: string }[] = [
  { name: "Tannaim", start: -200, end: 220, color: "rgba(74,222,128,0.08)" },
  { name: "Amoraim", start: 220, end: 500, color: "rgba(96,165,250,0.08)" },
  { name: "Geonim", start: 500, end: 1040, color: "rgba(192,132,252,0.08)" },
  { name: "Rishonim", start: 1040, end: 1550, color: "rgba(251,191,36,0.08)" },
  { name: "Acharonim", start: 1550, end: 1900, color: "rgba(249,115,22,0.08)" },
  { name: "Modern", start: 1900, end: 2000, color: "rgba(34,211,238,0.08)" },
];

const ERA_LABEL_COLORS: Record<string, string> = {
  Tannaim: "#4ade80",
  Amoraim: "#60a5fa",
  Geonim: "#c084fc",
  Rishonim: "#fbbf24",
  Acharonim: "#f97316",
  Modern: "#22d3ee",
};

const TOTAL_START = -200;
const TOTAL_END = 2000;
const TOTAL_RANGE = TOTAL_END - TOTAL_START;

function parseYear(y: string | null): number | null {
  if (!y) return null;
  const n = parseInt(y, 10);
  return isNaN(n) ? null : n;
}

export function RabbiTimeline({ rabbis }: RabbiTimelineProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Filter to rabbis with at least one year
  const timelineRabbis = rabbis.filter((r) => parseYear(r.birth_year) !== null || parseYear(r.death_year) !== null);

  // Sort by midpoint year
  const sorted = [...timelineRabbis].sort((a, b) => {
    const midA = (parseYear(a.birth_year) ?? parseYear(a.death_year) ?? 0);
    const midB = (parseYear(b.birth_year) ?? parseYear(b.death_year) ?? 0);
    return midA - midB;
  });

  const yearToPercent = (year: number): number => {
    return ((year - TOTAL_START) / TOTAL_RANGE) * 100;
  };

  if (isMobile) {
    // Vertical timeline
    const SVG_HEIGHT = Math.max(800, sorted.length * 50);
    const SVG_WIDTH = 300;

    return (
      <div className="rabbi-timeline" ref={containerRef} style={{ overflowY: "auto", maxHeight: "70vh" }}>
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          {/* Era bands */}
          {ERA_BANDS.map((band) => {
            const y1 = (yearToPercent(band.start) / 100) * SVG_HEIGHT;
            const y2 = (yearToPercent(band.end) / 100) * SVG_HEIGHT;
            return (
              <g key={band.name}>
                <rect x={0} y={y1} width={SVG_WIDTH} height={y2 - y1} fill={band.color} />
                <text x={SVG_WIDTH - 4} y={y1 + 14} textAnchor="end" fill={ERA_LABEL_COLORS[band.name]} fontSize={9} opacity={0.7} fontFamily="var(--font-sans)">
                  {band.name}
                </text>
              </g>
            );
          })}

          {/* Center line */}
          <line x1={50} y1={0} x2={50} y2={SVG_HEIGHT} stroke="var(--border-subtle)" strokeWidth="1" />

          {/* Dots */}
          {sorted.map((r) => {
            const year = parseYear(r.birth_year) ?? parseYear(r.death_year) ?? 0;
            const cy = (yearToPercent(year) / 100) * SVG_HEIGHT;
            const isHovered = hoveredId === r.id;

            return (
              <g
                key={r.id}
                onClick={() => router.push(`/tzadikim/${r.id}`)}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={50} cy={cy} r={isHovered ? 6 : 4} className="rabbi-map-dot" />
                <text x={62} y={cy + 4} fill="var(--text-primary)" fontSize={11} fontFamily="var(--font-sans)">
                  {r.name_en}
                </text>
                <text x={62} y={cy + 16} fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-sans)">
                  {year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Horizontal timeline
  const SVG_WIDTH = Math.max(1200, sorted.length * 30);
  const SVG_HEIGHT = 320;

  return (
    <div className="rabbi-timeline" ref={containerRef}>
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ minWidth: SVG_WIDTH }}>
        {/* Era bands */}
        {ERA_BANDS.map((band) => {
          const x1 = (yearToPercent(band.start) / 100) * SVG_WIDTH;
          const x2 = (yearToPercent(band.end) / 100) * SVG_WIDTH;
          return (
            <g key={band.name}>
              <rect x={x1} y={0} width={x2 - x1} height={SVG_HEIGHT} fill={band.color} />
              <text x={x1 + 6} y={20} fill={ERA_LABEL_COLORS[band.name]} fontSize={11} opacity={0.7} fontWeight={600} fontFamily="var(--font-sans)">
                {band.name}
              </text>
            </g>
          );
        })}

        {/* Axis line */}
        <line x1={0} y1={SVG_HEIGHT / 2} x2={SVG_WIDTH} y2={SVG_HEIGHT / 2} stroke="var(--border-subtle)" strokeWidth="1" />

        {/* Century markers */}
        {Array.from({ length: 23 }, (_, i) => (i - 2) * 100).map((yr) => {
          const x = (yearToPercent(yr) / 100) * SVG_WIDTH;
          return (
            <g key={yr}>
              <line x1={x} y1={SVG_HEIGHT / 2 - 6} x2={x} y2={SVG_HEIGHT / 2 + 6} stroke="var(--text-muted)" strokeWidth="0.5" opacity={0.4} />
              <text x={x} y={SVG_HEIGHT / 2 + 20} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-sans)">
                {yr < 0 ? `${Math.abs(yr)} BCE` : `${yr}`}
              </text>
            </g>
          );
        })}

        {/* Rabbi dots */}
        {sorted.map((r, idx) => {
          const year = parseYear(r.birth_year) ?? parseYear(r.death_year) ?? 0;
          const cx = (yearToPercent(year) / 100) * SVG_WIDTH;
          // Alternate above/below to avoid overlap
          const cy = SVG_HEIGHT / 2 + (idx % 2 === 0 ? -40 - (idx % 4) * 12 : 40 + (idx % 4) * 12);
          const isHovered = hoveredId === r.id;

          return (
            <g
              key={r.id}
              onClick={() => router.push(`/tzadikim/${r.id}`)}
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Line from axis to dot */}
              <line x1={cx} y1={SVG_HEIGHT / 2} x2={cx} y2={cy} stroke="var(--border-subtle)" strokeWidth="0.5" opacity={0.5} />
              <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} className="rabbi-map-dot" />
              <text
                x={cx}
                y={cy + (cy < SVG_HEIGHT / 2 ? -10 : 14)}
                textAnchor="middle"
                fill={isHovered ? "var(--gold)" : "var(--text-primary)"}
                fontSize={10}
                fontFamily="var(--font-sans)"
                fontWeight={isHovered ? 600 : 400}
              >
                {r.name_en.length > 18 ? r.name_en.slice(0, 16) + "..." : r.name_en}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={cx - 80}
                    y={cy + (cy < SVG_HEIGHT / 2 ? -50 : 18)}
                    width={160}
                    height={32}
                    rx={6}
                    fill="var(--bg-surface)"
                    stroke="var(--border-accent)"
                    strokeWidth="1"
                  />
                  <text
                    x={cx}
                    y={cy + (cy < SVG_HEIGHT / 2 ? -38 : 30)}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize={10}
                    fontFamily="var(--font-sans)"
                  >
                    {r.name_en}
                  </text>
                  <text
                    x={cx}
                    y={cy + (cy < SVG_HEIGHT / 2 ? -26 : 42)}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize={9}
                    fontFamily="var(--font-sans)"
                  >
                    {r.birth_year ?? "?"} – {r.death_year ?? "?"} | {r.community}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
