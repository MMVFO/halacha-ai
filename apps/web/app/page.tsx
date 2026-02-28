import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: "100px auto", textAlign: "center", padding: "0 20px" }}>
      <h1>Halacha AI</h1>
      <p style={{ color: "#666", fontSize: 18, lineHeight: 1.6 }}>
        RAG-based halakhic research system. Sources, analysis, and structured opinions
        from the canonical halakhic corpus.
      </p>
      <p style={{ color: "#999", fontSize: 14, fontStyle: "italic", marginBottom: 40 }}>
        This system does not issue psak halacha. It provides research and learning aids only.
      </p>
      <Link
        href="/halacha"
        style={{
          display: "inline-block",
          padding: "12px 32px",
          background: "#1a365d",
          color: "white",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Start Research
      </Link>
    </div>
  );
}
