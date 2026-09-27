"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "6rem 1.5rem 4rem",
        textAlign: "center",
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "0.35rem 1rem",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "var(--muted)",
          fontSize: "0.8rem",
          color: "var(--muted-foreground)",
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
          }}
        />
        Lộ trình cập nhật — Tháng 9/2026
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "1.5rem",
        }}
      >
        Java Backend{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          + AI
        </span>
        <br />
        Roadmap
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontSize: "1.25rem",
          color: "var(--muted-foreground)",
          maxWidth: 600,
          margin: "0 auto 3rem",
          lineHeight: 1.7,
        }}
      >
        Học Java Backend và tích hợp AI từ nền tảng đến sản phẩm thực tế.
        Bài tập có lời giải, dự án xuyên suốt, forum hỏi đáp.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/JavaBackend_AI_RoadMap/roadmap"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0.75rem 2rem",
            borderRadius: 12,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          🗺️ Xem Roadmap
        </Link>
        <Link
          href="/JavaBackend_AI_RoadMap/docs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0.75rem 2rem",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--muted)",
            color: "var(--foreground)",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          📚 Bài tập & Lời giải
        </Link>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          marginTop: "4rem",
          padding: "2rem",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--card)",
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "6", label: "Phase học" },
          { value: "24+", label: "Bài tập" },
          { value: "12", label: "Bài DSA" },
          { value: "2", label: "Dự án thực tế" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}