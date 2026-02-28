"use client";

import { useState } from "react";

type SearchMode = "practical" | "deep_research" | "posek_view";
type CorpusTier = "canonical" | "apocrypha" | "pseudepigrapha" | "academic";

interface RetrievedSource {
  id: number;
  work: string;
  sectionRef: string;
  parentRef: string | null;
  community: string;
  corpusTier: string;
  author: string | null;
  era: string | null;
  text: string;
}

interface QueryResponse {
  answer: string;
  sources: RetrievedSource[];
  error?: string;
}

const COMMUNITIES = ["General", "Ashkenazi", "Sephardi", "Chabad", "Yemenite"];
const MODES: { value: SearchMode; label: string }[] = [
  { value: "practical", label: "Practical Research" },
  { value: "deep_research", label: "Deep Analytic" },
  { value: "posek_view", label: "Posek View" },
];
const TIERS: { value: CorpusTier; label: string }[] = [
  { value: "canonical", label: "Canonical" },
  { value: "apocrypha", label: "Apocrypha" },
  { value: "pseudepigrapha", label: "Pseudepigrapha" },
  { value: "academic", label: "Academic" },
];

export default function HalachaPage() {
  const [question, setQuestion] = useState("");
  const [community, setCommunity] = useState("General");
  const [mode, setMode] = useState<SearchMode>("practical");
  const [corpusTiers, setCorpusTiers] = useState<CorpusTier[]>(["canonical"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleTier(tier: CorpusTier) {
    setCorpusTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/halacha/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, community, mode, corpusTiers }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ marginBottom: 4 }}>Halacha Research</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 32, fontSize: 14, fontStyle: "italic" }}>
        This tool is for learning and research only — it does not issue psak halacha.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your halakhic question..."
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
              Community
            </label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" }}
            >
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SearchMode)}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" }}
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
              Corpus Tiers
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {TIERS.map((t) => (
                <label key={t.value} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={corpusTiers.includes(t.value)}
                    onChange={() => toggleTier(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim() || corpusTiers.length === 0}
          style={{
            marginTop: 16,
            padding: "10px 24px",
            background: loading ? "#999" : "#1a365d",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: loading ? "wait" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Researching..." : "Research"}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: 24,
          padding: 16,
          background: "#fee",
          borderRadius: 8,
          color: "#c00",
          border: "1px solid #fcc",
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>Answer</h2>
          <div style={{
            background: "white",
            padding: 24,
            borderRadius: 8,
            border: "1px solid #ddd",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}>
            {result.answer}
          </div>

          {result.sources.length > 0 && (
            <>
              <h2 style={{ marginTop: 32 }}>Sources ({result.sources.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.sources.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: s.corpusTier !== "canonical" ? "#fff8e1" : "white",
                      padding: 16,
                      borderRadius: 8,
                      border: `1px solid ${s.corpusTier !== "canonical" ? "#ffe082" : "#ddd"}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <strong>{s.sectionRef}</strong>
                      <span style={{ color: "#666" }}>{s.work}</span>
                      {s.author && <span style={{ color: "#888" }}>by {s.author}</span>}
                      <span style={{
                        background: s.corpusTier === "canonical" ? "#e8f5e9" : "#fff3e0",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}>
                        {s.corpusTier}
                      </span>
                      <span style={{
                        background: "#e3f2fd",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}>
                        {s.community}
                      </span>
                      {s.era && (
                        <span style={{
                          background: "#f3e5f5",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                        }}>
                          {s.era}
                        </span>
                      )}
                    </div>
                    {s.corpusTier !== "canonical" && (
                      <div style={{
                        fontSize: 12,
                        color: "#e65100",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}>
                        NON-CANONICAL — No halachic authority
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
                      {s.text.length > 500 ? s.text.slice(0, 500) + "..." : s.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
