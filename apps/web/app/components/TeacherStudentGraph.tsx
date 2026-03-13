"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface RabbiNode {
  id: number;
  name: string;
}

interface Relationship {
  from: RabbiNode;
  to: RabbiNode;
  type: "teacher" | "student" | "colleague";
}

interface TeacherStudentGraphProps {
  rabbiId: number;
  relationships: Relationship[];
}

interface GraphNode {
  id: number;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

interface GraphEdge {
  sourceId: number;
  targetId: number;
  type: "teacher" | "student" | "colleague";
}

const NODE_RADIUS = 30;
const WIDTH = 700;
const HEIGHT = 500;

const EDGE_STYLES: Record<string, { color: string; dash: string; label: string }> = {
  teacher: { color: "#3b82f6", dash: "", label: "Teacher → Student" },
  student: { color: "#3b82f6", dash: "", label: "Teacher → Student" },
  colleague: { color: "#22c55e", dash: "6 3", label: "Colleague" },
};

export function TeacherStudentGraph({ rabbiId, relationships }: TeacherStudentGraphProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [dragNode, setDragNode] = useState<number | null>(null);

  // Build graph from relationships
  useEffect(() => {
    const nodeMap = new Map<number, GraphNode>();
    const edgeList: GraphEdge[] = [];

    for (const rel of relationships) {
      if (!nodeMap.has(rel.from.id)) {
        nodeMap.set(rel.from.id, {
          id: rel.from.id,
          name: rel.from.name,
          x: WIDTH / 2 + (Math.random() - 0.5) * 300,
          y: HEIGHT / 2 + (Math.random() - 0.5) * 300,
          vx: 0,
          vy: 0,
          pinned: rel.from.id === rabbiId,
        });
      }
      if (!nodeMap.has(rel.to.id)) {
        nodeMap.set(rel.to.id, {
          id: rel.to.id,
          name: rel.to.name,
          x: WIDTH / 2 + (Math.random() - 0.5) * 300,
          y: HEIGHT / 2 + (Math.random() - 0.5) * 300,
          vx: 0,
          vy: 0,
          pinned: rel.to.id === rabbiId,
        });
      }

      if (rel.type === "teacher") {
        edgeList.push({ sourceId: rel.from.id, targetId: rel.to.id, type: "teacher" });
      } else if (rel.type === "student") {
        edgeList.push({ sourceId: rel.from.id, targetId: rel.to.id, type: "student" });
      } else {
        edgeList.push({ sourceId: rel.from.id, targetId: rel.to.id, type: "colleague" });
      }
    }

    // Center the main rabbi
    const main = nodeMap.get(rabbiId);
    if (main) {
      main.x = WIDTH / 2;
      main.y = HEIGHT / 2;
      main.pinned = true;
    }

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [rabbiId, relationships]);

  // Force simulation
  useEffect(() => {
    if (nodes.length < 2) return;
    let iteration = 0;
    const maxIter = 180;

    const simulate = () => {
      if (iteration >= maxIter) return;
      iteration++;

      setNodes((prev) => {
        const next = prev.map((n) => ({ ...n }));
        const k = 130;
        const repulsion = 6000;
        const damping = 0.84;
        const dt = 0.3;

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

        for (const edge of edges) {
          const si = next.findIndex((n) => n.id === edge.sourceId);
          const ti = next.findIndex((n) => n.id === edge.targetId);
          if (si === -1 || ti === -1) continue;
          const dx = next[ti].x - next[si].x;
          const dy = next[ti].y - next[si].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (dist - k) * 0.05;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!next[si].pinned) { next[si].vx += fx * dt; next[si].vy += fy * dt; }
          if (!next[ti].pinned) { next[ti].vx -= fx * dt; next[ti].vy -= fy * dt; }
        }

        for (const node of next) {
          if (node.pinned) continue;
          node.vx += (WIDTH / 2 - node.x) * 0.001;
          node.vy += (HEIGHT / 2 - node.y) * 0.001;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
          node.x = Math.max(NODE_RADIUS + 5, Math.min(WIDTH - NODE_RADIUS - 5, node.x));
          node.y = Math.max(NODE_RADIUS + 5, Math.min(HEIGHT - NODE_RADIUS - 5, node.y));
        }

        return next;
      });

      if (iteration < maxIter) {
        animRef.current = requestAnimationFrame(simulate);
      }
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [nodes.length, edges]);

  // Drag
  useEffect(() => {
    if (dragNode === null) return;
    const handleMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragNode
            ? { ...n, x: e.clientX - rect.left, y: e.clientY - rect.top, vx: 0, vy: 0, pinned: true }
            : n
        )
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

  const getNode = useCallback((id: number) => nodes.find((n) => n.id === id), [nodes]);

  return (
    <div className="teacher-student-graph">
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ cursor: dragNode !== null ? "grabbing" : "default", maxWidth: "100%", height: "auto" }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <defs>
          <marker id="ts-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" opacity="0.7" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = getNode(edge.sourceId);
          const target = getNode(edge.targetId);
          if (!source || !target) return null;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const ox = (dx / dist) * NODE_RADIUS;
          const oy = (dy / dist) * NODE_RADIUS;

          const style = EDGE_STYLES[edge.type];
          const isHighlighted = hoveredNode === edge.sourceId || hoveredNode === edge.targetId;

          return (
            <line
              key={i}
              x1={source.x + ox}
              y1={source.y + oy}
              x2={target.x - ox}
              y2={target.y - oy}
              stroke={style.color}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={style.dash}
              opacity={isHighlighted ? 0.9 : 0.35}
              markerEnd={edge.type !== "colleague" ? "url(#ts-arrow)" : undefined}
              style={{ transition: "opacity 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isCenter = node.id === rabbiId;
          const isHovered = hoveredNode === node.id;
          const r = isHovered ? NODE_RADIUS + 4 : NODE_RADIUS;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onMouseDown={(e) => { e.preventDefault(); setDragNode(node.id); }}
              onClick={() => router.push(`/tzadikim/${node.id}`)}
              style={{ cursor: "pointer" }}
            >
              {/* Glow ring for center */}
              {isCenter && (
                <circle r={r + 8} fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 2" />
              )}
              <circle
                r={r}
                fill={isCenter ? "rgba(212,175,55,0.2)" : "rgba(59,130,246,0.12)"}
                stroke={isCenter ? "#d4af37" : "#3b82f6"}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: "all 0.2s" }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={10}
                fontWeight={isCenter ? 600 : 400}
                fontFamily="var(--font-sans)"
                style={{ pointerEvents: "none" }}
              >
                {node.name.length > 16 ? node.name.slice(0, 14) + "..." : node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, padding: "8px 0", fontSize: 11, color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#ts-arrow)" /></svg>
          Teacher &rarr; Student
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" /></svg>
          Colleague
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(212,175,55,0.4)", border: "1.5px solid #d4af37", display: "inline-block" }} />
          Selected Rabbi
        </span>
      </div>
    </div>
  );
}
