"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Topic {
  id: number;
  name: string;
  name_he: string | null;
  description: string | null;
  count: number;
}

interface TopicChunk {
  id: number;
  work: string;
  section_ref: string;
  language: string;
  text: string;
  author: string | null;
  era: string | null;
  community: string;
  corpus_tier: string;
  relevance: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [chunks, setChunks] = useState<TopicChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [expandedTopicData, setExpandedTopicData] = useState<Topic | null>(null);

  // Fetch topics
  const fetchTopics = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/topics?search=${encodeURIComponent(query)}`
        : "/api/topics";
      const res = await fetch(url);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopics(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchTopics]);

  // Expand topic to show chunks
  const toggleTopic = async (topic: Topic) => {
    if (expandedTopic === topic.id) {
      setExpandedTopic(null);
      setChunks([]);
      setExpandedTopicData(null);
      return;
    }

    setExpandedTopic(topic.id);
    setExpandedTopicData(topic);
    setChunksLoading(true);

    try {
      const res = await fetch(`/api/topics?id=${topic.id}`);
      const data = await res.json();
      setChunks(data.chunks || []);
    } catch {
      setChunks([]);
    } finally {
      setChunksLoading(false);
    }
  };

  // Size factor for tag cloud based on count
  const maxCount = Math.max(...topics.map((t) => t.count), 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "rgba(255, 255, 255, 0.9)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "32px 32px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#d4af37",
                margin: 0,
                fontFamily: "var(--font-serif, Georgia, serif)",
              }}
            >
              Topics
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.4)", margin: "4px 0 0" }}>
              Browse halakhic topics and their source passages
            </p>
          </div>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.4)",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
            }}
          >
            Home
          </Link>
        </div>

        {/* Search */}
        <div
          style={{
            position: "relative",
            maxWidth: 480,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid rgba(255, 255, 255, 0.06)",
                borderTopColor: "#d4af37",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        ) : topics.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255, 255, 255, 0.3)" }}>
            No topics found{search ? ` for "${search}"` : ""}.
          </div>
        ) : (
          <>
            {/* Tag cloud / grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: expandedTopic ? 24 : 0,
              }}
            >
              {topics.map((topic) => {
                const scale = 0.7 + (topic.count / maxCount) * 0.6;
                const isExpanded = expandedTopic === topic.id;

                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: "8px 16px",
                      background: isExpanded
                        ? "rgba(212, 175, 55, 0.12)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${isExpanded ? "rgba(212, 175, 55, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: Math.round(13 * scale),
                      color: isExpanded ? "#d4af37" : "rgba(255, 255, 255, 0.7)",
                      fontWeight: isExpanded ? 600 : 400,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{topic.name}</span>
                    {topic.name_he && (
                      <span
                        style={{
                          fontFamily: "'Noto Serif Hebrew', serif",
                          direction: "rtl",
                          fontSize: Math.round(12 * scale),
                          opacity: 0.6,
                        }}
                      >
                        {topic.name_he}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: 100,
                        color: "rgba(255, 255, 255, 0.35)",
                      }}
                    >
                      {topic.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expanded topic passages */}
            {expandedTopic && expandedTopicData && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#d4af37",
                        margin: 0,
                        fontFamily: "var(--font-serif, Georgia, serif)",
                      }}
                    >
                      {expandedTopicData.name}
                      {expandedTopicData.name_he && (
                        <span
                          style={{
                            marginLeft: 10,
                            fontFamily: "'Noto Serif Hebrew', serif",
                            direction: "rtl",
                            fontSize: 16,
                            opacity: 0.7,
                          }}
                        >
                          {expandedTopicData.name_he}
                        </span>
                      )}
                    </h2>
                    {expandedTopicData.description && (
                      <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.45)", margin: "4px 0 0" }}>
                        {expandedTopicData.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setExpandedTopic(null); setChunks([]); setExpandedTopicData(null); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.3)",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: "0 4px",
                    }}
                  >
                    x
                  </button>
                </div>

                {chunksLoading ? (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: "2px solid rgba(255, 255, 255, 0.06)",
                        borderTopColor: "#d4af37",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                ) : chunks.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255, 255, 255, 0.3)" }}>
                    No passages linked to this topic yet.
                  </div>
                ) : (
                  <div style={{ maxHeight: 500, overflowY: "auto" }}>
                    {chunks.map((chunk) => (
                      <div
                        key={chunk.id}
                        style={{
                          padding: "14px 20px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        {/* Chunk header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <Link
                            href={`/reader?work=${encodeURIComponent(chunk.work)}&section=${encodeURIComponent(chunk.section_ref)}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#d4af37",
                              textDecoration: "none",
                            }}
                          >
                            {chunk.work}
                          </Link>
                          <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.35)" }}>
                            {chunk.section_ref}
                          </span>
                          {chunk.community !== "General" && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                background: "rgba(139, 92, 246, 0.1)",
                                border: "1px solid rgba(139, 92, 246, 0.2)",
                                borderRadius: 100,
                                color: "#a78bfa",
                              }}
                            >
                              {chunk.community}
                            </span>
                          )}
                        </div>

                        {/* Text preview */}
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: "rgba(255, 255, 255, 0.7)",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            direction: chunk.language === "he" || chunk.language === "arc" ? "rtl" : "ltr",
                            fontFamily:
                              chunk.language === "he" || chunk.language === "arc"
                                ? "'Noto Serif Hebrew', serif"
                                : "inherit",
                          }}
                        >
                          {chunk.text}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Link
                            href={`/reader?work=${encodeURIComponent(chunk.work)}&section=${encodeURIComponent(chunk.section_ref)}`}
                            style={{
                              fontSize: 11,
                              color: "rgba(255, 255, 255, 0.4)",
                              textDecoration: "none",
                              padding: "3px 10px",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: 100,
                              transition: "all 0.2s",
                            }}
                          >
                            Open in Reader
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
