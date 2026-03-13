"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MapRabbi {
  id: number;
  name_en: string;
  location: string | null;
  birth_year: string | null;
  death_year: string | null;
  community: string;
}

interface RabbiMapProps {
  rabbis: MapRabbi[];
}

// Approximate SVG coordinates for a simplified Mediterranean/Europe/Middle East map
// Map viewport: ~950 x 500, centered roughly on the Mediterranean
const LOCATION_COORDS: Record<string, [number, number]> = {
  Jerusalem: [720, 330],
  "Land of Israel": [720, 320],
  Israel: [720, 320],
  Tiberias: [720, 310],
  Caesarea: [710, 310],
  Safed: [715, 300],
  Hebron: [718, 335],
  Baghdad: [800, 290],
  Babylon: [790, 295],
  Babylonia: [790, 295],
  Sura: [785, 300],
  Pumbedita: [780, 285],
  Cairo: [680, 360],
  Egypt: [680, 360],
  Alexandria: [660, 355],
  Fez: [370, 310],
  Morocco: [360, 320],
  Cordoba: [340, 280],
  Spain: [340, 260],
  Granada: [345, 290],
  Toledo: [335, 265],
  Barcelona: [380, 250],
  Troyes: [385, 190],
  France: [380, 200],
  Paris: [380, 185],
  Provence: [395, 230],
  Vilna: [500, 130],
  Lithuania: [500, 130],
  Krakow: [470, 160],
  Poland: [480, 155],
  Warsaw: [475, 145],
  Amsterdam: [395, 145],
  Netherlands: [395, 145],
  Istanbul: [600, 250],
  Turkey: [610, 260],
  Rome: [445, 250],
  Italy: [450, 240],
  Venice: [445, 220],
  Prague: [445, 170],
  Vienna: [460, 185],
  Germany: [430, 160],
  Mainz: [415, 170],
  Worms: [415, 175],
  Budapest: [475, 185],
  Hungary: [475, 185],
  London: [370, 150],
  England: [370, 150],
  Tunis: [440, 300],
  Tunisia: [440, 300],
  Yemen: [770, 420],
  "Sana'a": [770, 420],
  Iran: [830, 280],
  Persia: [830, 280],
  Damascus: [730, 305],
  Syria: [730, 305],
  Volozhin: [510, 130],
  Lublin: [490, 150],
  Breslau: [460, 155],
  Pressburg: [470, 180],
};

// Simplified map outline paths (very basic Mediterranean region)
const MAP_PATHS = [
  // Europe outline (very simplified)
  "M320,100 L340,95 L380,100 L420,90 L460,95 L500,90 L540,100 L560,120 L580,140 L600,150 L620,160 L640,180 L620,200 L600,220 L610,240 L600,250 L580,260 L560,270 L540,280 L520,290 L500,285 L480,280 L460,270 L450,260 L440,240 L430,230 L420,240 L400,250 L390,260 L380,250 L370,240 L360,230 L345,240 L330,255 L320,270 L310,260 L320,240 L330,220 L340,200 L335,180 L330,160 L325,140 L330,120 Z",
  // North Africa coastline
  "M330,280 L360,300 L400,305 L440,300 L480,310 L520,310 L560,315 L600,320 L640,330 L680,340 L700,350 L720,340 L740,330 L760,340 L780,350",
  // Middle East
  "M700,280 L720,270 L740,280 L760,290 L780,280 L800,270 L830,260 L850,280 L840,310 L820,330 L800,340 L780,350 L760,340",
  // Italy boot
  "M440,220 L445,235 L450,250 L460,265 L465,280 L460,290 L450,285 L445,275",
  // British Isles
  "M355,110 L365,100 L380,105 L385,120 L375,135 L365,145 L355,140 L350,125 Z",
];

export function RabbiMap({ rabbis }: RabbiMapProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Group rabbis by location, assigning coordinates
  const plotted = rabbis
    .filter((r) => r.location)
    .map((r) => {
      const loc = r.location!;
      // Try exact match, then partial match
      let coords = LOCATION_COORDS[loc];
      if (!coords) {
        const key = Object.keys(LOCATION_COORDS).find(
          (k) => loc.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(loc.toLowerCase())
        );
        if (key) coords = LOCATION_COORDS[key];
      }
      return coords ? { ...r, cx: coords[0], cy: coords[1] } : null;
    })
    .filter((r): r is MapRabbi & { cx: number; cy: number } => r !== null);

  // Stack dots at same location with slight offset
  const locationCounts = new Map<string, number>();
  const withOffset = plotted.map((r) => {
    const key = `${r.cx},${r.cy}`;
    const count = locationCounts.get(key) ?? 0;
    locationCounts.set(key, count + 1);
    const angle = (count * 40) * (Math.PI / 180);
    const offsetR = count * 8;
    return {
      ...r,
      cx: r.cx + Math.cos(angle) * offsetR,
      cy: r.cy + Math.sin(angle) * offsetR,
    };
  });

  return (
    <div className="rabbi-map">
      <svg
        width="950"
        height="500"
        viewBox="280 80 600 380"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {/* Background */}
        <rect x="280" y="80" width="600" height="380" fill="rgba(10,14,26,0.5)" rx="8" />

        {/* Water hint */}
        <ellipse cx="520" cy="310" rx="180" ry="60" fill="rgba(59,130,246,0.04)" />

        {/* Map outlines */}
        {MAP_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Location labels for major cities (subtle) */}
        {[
          { name: "Jerusalem", x: 720, y: 345 },
          { name: "Baghdad", x: 800, y: 305 },
          { name: "Cairo", x: 680, y: 375 },
          { name: "Cordoba", x: 340, y: 295 },
          { name: "Vilna", x: 500, y: 125 },
        ].map((loc) => (
          <text
            key={loc.name}
            x={loc.x}
            y={loc.y}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={8}
            fontFamily="var(--font-sans)"
            opacity={0.5}
          >
            {loc.name}
          </text>
        ))}

        {/* Rabbi dots */}
        {withOffset.map((r) => {
          const isHovered = hoveredId === r.id;

          return (
            <g
              key={r.id}
              onClick={() => router.push(`/tzadikim/${r.id}`)}
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={r.cx}
                cy={r.cy}
                r={isHovered ? 6 : 4}
                className="rabbi-map-dot"
              />

              {isHovered && (
                <g>
                  <rect
                    x={r.cx - 75}
                    y={r.cy - 38}
                    width={150}
                    height={30}
                    rx={6}
                    fill="var(--bg-surface)"
                    stroke="var(--border-accent)"
                    strokeWidth="1"
                    opacity={0.95}
                  />
                  <text x={r.cx} y={r.cy - 24} textAnchor="middle" fill="var(--text-primary)" fontSize={10} fontFamily="var(--font-sans)" fontWeight={500}>
                    {r.name_en}
                  </text>
                  <text x={r.cx} y={r.cy - 13} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-sans)">
                    {r.birth_year ?? "?"} – {r.death_year ?? "?"} | {r.location}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {plotted.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>
          No rabbis with mapped locations found.
        </div>
      )}
    </div>
  );
}
