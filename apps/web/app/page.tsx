import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "40px 20px",
    }}>
      {/* Decorative top line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 120,
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
      }} />

      {/* Hebrew decorative text */}
      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: 14,
        color: "var(--gold)",
        opacity: 0.4,
        letterSpacing: "0.3em",
        marginBottom: 40,
      }}>
        &#x05D3;&#x05E2; &#x05DC;&#x05E4;&#x05E0;&#x05D9; &#x05DE;&#x05D9; &#x05D0;&#x05EA;&#x05D4; &#x05E2;&#x05D5;&#x05DE;&#x05D3;
      </div>

      {/* Logo / Title */}
      <h1 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "clamp(48px, 8vw, 72px)",
        fontWeight: 400,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em",
        marginBottom: 8,
        lineHeight: 1.1,
      }}>
        Halacha <span style={{ color: "var(--gold)", fontWeight: 600 }}>AI</span>
      </h1>

      {/* Decorative divider */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "24px 0 32px",
      }}>
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, var(--border-subtle))" }} />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="var(--gold)" opacity="0.5" />
        </svg>
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, var(--border-subtle), transparent)" }} />
      </div>

      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: 18,
        color: "var(--text-secondary)",
        lineHeight: 1.7,
        maxWidth: 520,
        textAlign: "center",
        marginBottom: 12,
      }}>
        Intelligent halakhic research powered by the canonical corpus.
        Sources, analysis, and structured opinions — from Rishonim through Acharonim.
      </p>

      <p style={{
        fontFamily: "var(--font-serif)",
        fontSize: 15,
        color: "var(--text-muted)",
        fontStyle: "italic",
        marginBottom: 48,
        opacity: 0.7,
      }}>
        For learning and research only — this system does not issue psak halacha.
      </p>

      <Link
        href="/halacha"
        className="btn-primary"
        style={{ textDecoration: "none", fontSize: 16, padding: "14px 36px" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Begin Research
      </Link>

      {/* Bottom decorative elements */}
      <div style={{
        position: "absolute",
        bottom: 40,
        display: "flex",
        gap: 32,
        color: "var(--text-muted)",
        fontSize: 12,
        letterSpacing: "0.05em",
      }}>
        <span>Shulchan Arukh</span>
        <span style={{ opacity: 0.3 }}>&middot;</span>
        <span>Mishneh Torah</span>
        <span style={{ opacity: 0.3 }}>&middot;</span>
        <span>Mishnah Berurah</span>
        <span style={{ opacity: 0.3 }}>&middot;</span>
        <span>Responsa</span>
      </div>
    </div>
  );
}
