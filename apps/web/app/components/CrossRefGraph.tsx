"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface GraphNode {
  id: string;
  label: string;
  work: string;
  section: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label?: string;
}

interface CrossReference {
  id: number;
  source_work: string;
  source_section: string;
  target_work: string;
  target_section: string;
  ref_type: string;
}

interface CrossRefGraphProps {
  work: string;
  section?: string;
  onNodeClick?: (work: string, section: string) => void;
  width?: number;
  height?: number;
}

const NODE_RADIUS = 28;
const EDGE_COLORS: Record<string, string> = {
  citation: "#d4af37",
  commentary: "#3b82f6",
  parallel: "#22c55e",
  contradiction: "#ef4444",
  default: "#6b7280",
};

function getNodeColor(work: string): string {
  const colors = ["#d4af37", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < work.length; i++) hash = ((hash << 5) - hash + work.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export function CrossRefGraph({
  work,
  section,
  onNodeClick,
  width = 700,
  height = 500,
}: CrossRefGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);

  // Fetch cross-references
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ work });
    if (section) params.set("section", section);

    fetch(`/api/analysis/cross-references?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const refs: CrossReference[] = data.references || [];
        buildGraph(refs);
      })
      .catch(() => {
        // Build demo graph if API not available
        buildGraph([]);
      })
      .finally(() => setLoading(false));
  }, [work, section]);

  const buildGraph = useCallback((refs: CrossReference[]) => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];

    // Add center node
    const centerId = `${work}|${section || ""}`;
    nodeMap.set(centerId, {
      id: centerId,
      label: section ? `${work} ${section}` : work,
      work,
      section: section || "",
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      pinned: true,
    });

    for (const ref of refs) {
      const sourceId = `${ref.source_work}|${ref.source_section}`;
      const targetId = `${ref.target_work}|${ref.target_section}`;

      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          label: `${ref.source_work} ${ref.source_section}`.trim(),
          work: ref.source_work,
          section: ref.source_section,
          x: width / 2 + (Math.random() - 0.5) * 300,
          y: height / 2 + (Math.random() - 0.5) * 300,
          vx: 0,
          vy: 0,
        });
      }

      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, {
          id: targetId,
          label: `${ref.target_work} ${ref.target_section}`.trim(),
          work: ref.target_work,
          section: ref.target_section,
          x: width / 2 + (Math.random() - 0.5) * 300,
          y: height / 2 + (Math.random() - 0.5) * 300,
          vx: 0,
          vy: 0,
        });
      }

      edgeList.push({
        source: sourceId,
        target: targetId,
        type: ref.ref_type || "default",
      });
    }

    // If no refs, add sample connected nodes for visual interest
    if (refs.length === 0) {
      const sampleWorks = ["Rashi", "Tosafot", "Rambam"];
      for (const sw of sampleWorks) {
        const nodeId = `${sw}|`;
        nodeMap.set(nodeId, {
          id: nodeId,
          label: sw,
          work: sw,
          section: "",
          x: width / 2 + (Math.random() - 0.5) * 250,
          y: height / 2 + (Math.random() - 0.5) * 250,
          vx: 0,
          vy: 0,
        });
        edgeList.push({ source: centerId, target: nodeId, type: "commentary" });
      }
    }

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [work, section, width, height]);

  // Force-directed simulation
  useEffect(() => {
    if (nodes.length < 2) return;

    let iteration = 0;
    const maxIterations = 200;

    const simulate = () => {
      if (iteration >= maxIterations) return;
      iteration++;

      setNodes((prev) => {
        const next = prev.map((n) => ({ ...n }));
        const k = 120; // Spring length
        const repulsion = 5000;
        const damping = 0.85;
        const dt = 0.3;

        // Repulsion between all nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!next[i].pinned) { next[i].vx -= fx * dt; next[i].vy -= fy * dt; }
            if (!next[j].pinned) { next[j].vx += fx * dt; next[j].vy += fy * dt; }
          }
        }

        // Attraction along edges
        for (const edge of edges) {
          const si = next.findIndex((n) => n.id === edge.source);
          const ti = next.findIndex((n) => n.id === edge.target);
          if (si === -1 || ti === -1) continue;

          const dx = next[ti].x - next[si].x;
          const dy = next[ti].y - next[si].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (dist - k) * 0.06;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!next[si].pinned) { next[si].vx += fx * dt; next[si].vy += fy * dt; }
          if (!next[ti].pinned) { next[ti].vx -= fx * dt; next[ti].vy -= fy * dt; }
        }

        // Center gravity
        for (const node of next) {
          if (node.pinned) continue;
          node.vx += (width / 2 - node.x) * 0.001;
          node.vy += (height / 2 - node.y) * 0.001;
        }

        // Apply velocity
        for (const node of next) {
          if (node.pinned) continue;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
          // Bound to SVG
          node.x = Math.max(NODE_RADIUS + 5, Math.min(width - NODE_RADIUS - 5, node.x));
          node.y = Math.max(NODE_RADIUS + 5, Math.min(height - NODE_RADIUS - 5, node.y));
        }

        return next;
      });

      if (iteration < maxIterations) {
        animRef.current = requestAnimationFrame(simulate);
      }
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [nodes.length, edges, width, height]);

  // Drag handlers
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragNode(nodeId);
  };

  useEffect(() => {
    if (!dragNode) return;

    const handleMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setNodes((prev) =>
        prev.map((n) => (n.id === dragNode ? { ...n, x, y, vx: 0, vy: 0, pinned: true } : n))
      );
    };

    const handleUp = () => setDragNode(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragNode]);

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  // Timeline view
  const renderTimeline = () => {
    const sorted = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
    return (
      <div className="crossref-timeline">
        <div className="crossref-timeline-line" />
        {sorted.map((node, i) => (
          <div
            key={node.id}
            className="crossref-timeline-item fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => onNodeClick?.(node.work, node.section)}
          >
            <div
              className="crossref-timeline-dot"
              style={{ background: getNodeColor(node.work) }}
            />
            <div className="crossref-timeline-label">{node.label}</div>
            <div className="crossref-timeline-connections">
              {edges
                .filter((e) => e.source === node.id || e.target === node.id)
                .map((e, ei) => {
                  const other = e.source === node.id ? e.target : e.source;
                  const otherNode = getNodeById(other);
                  return (
                    <span
                      key={ei}
                      className="crossref-timeline-conn"
                      style={{ color: EDGE_COLORS[e.type] || EDGE_COLORS.default }}
                    >
                      {e.type}: {otherNode?.label}
                    </span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="crossref-graph-container" style={{ width, height }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
          <div className="pane-spinner" />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading cross-references...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="crossref-graph-container">
      <div className="crossref-graph-header">
        <h3 className="crossref-graph-title">Cross-Reference Graph</h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`btn-ghost ${showTimeline ? "research-sidebar-toggle-active" : ""}`}
            style={{ fontSize: 12, padding: "4px 10px" }}
          >
            {showTimeline ? "Graph" : "Timeline"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="crossref-legend">
        {Object.entries(EDGE_COLORS).filter(([k]) => k !== "default").map(([type, color]) => (
          <span key={type} className="crossref-legend-item">
            <span className="crossref-legend-line" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>

      {showTimeline ? (
        renderTimeline()
      ) : (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="crossref-graph-svg"
          style={{ cursor: dragNode ? "grabbing" : "default" }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" opacity="0.5" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const source = getNodeById(edge.source);
            const target = getNodeById(edge.target);
            if (!source || !target) return null;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ox = (dx / dist) * NODE_RADIUS;
            const oy = (dy / dist) * NODE_RADIUS;

            const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
            const color = EDGE_COLORS[edge.type] || EDGE_COLORS.default;

            return (
              <line
                key={i}
                x1={source.x + ox}
                y1={source.y + oy}
                x2={target.x - ox}
                y2={target.y - oy}
                stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                opacity={isHighlighted ? 0.9 : 0.3}
                markerEnd="url(#arrowhead)"
                style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const color = getNodeColor(node.work);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
                onClick={() => onNodeClick?.(node.work, node.section)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={isHovered ? NODE_RADIUS + 4 : NODE_RADIUS}
                  fill={`${color}20`}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: "r 0.2s, stroke-width 0.2s" }}
                />
                {node.pinned && (
                  <circle r={NODE_RADIUS + 8} fill="none" stroke={color} strokeWidth="1" opacity="0.15" strokeDasharray="4 2" />
                )}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="var(--font-sans)"
                  style={{ pointerEvents: "none" }}
                >
                  {node.label.length > 14 ? node.label.slice(0, 12) + "..." : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
