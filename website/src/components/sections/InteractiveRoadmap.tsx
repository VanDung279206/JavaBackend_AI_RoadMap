"use client";
import Link from "next/link";

const phases = [
  { num: "0", title: "Setup & Công cụ", icon: "⚙️", color: "#64748b", slug: null },
  { num: "1", title: "Java Nền tảng", icon: "☕", color: "#f59e0b", slug: "01_Java" },
  { num: "2", title: "HTTP & SQL", icon: "🗄️", color: "#3b82f6", slug: "02_Http-Sql" },
  { num: "3", title: "Spring Boot", icon: "🍃", color: "#22c55e", slug: "03_Spring" },
  { num: "4", title: "Kiểm thử & Deploy", icon: "🧪", color: "#8b5cf6", slug: "04_Quality" },
  { num: "5", title: "Tích hợp AI", icon: "🤖", color: "#ec4899", slug: "05_AI" },
  { num: "6", title: "RAG & Đánh giá", icon: "🔍", color: "#06b6d4", slug: "06_RAG" },
];

export default function InteractiveRoadmap() {
  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          🗺️ Lộ trình học nhanh
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Nhấn vào từng phase để xem bài tập chi tiết.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {phases.map((p) => {
          const inner = (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1rem 1.5rem",
                transition: "border-color 0.2s",
                cursor: p.slug ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (p.slug) (e.currentTarget as HTMLDivElement).style.borderColor = p.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: p.color + "22",
                  border: `1px solid ${p.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.7rem", color: p.color, fontWeight: 700 }}>
                  PHASE {p.num}
                </span>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{p.title}</div>
              </div>
              {p.slug && (
                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>→</span>
              )}
            </div>
          );

          return p.slug ? (
            <Link
              key={p.num}
              href={`/JavaBackend_AI_RoadMap/docs/${p.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {inner}
            </Link>
          ) : (
            <div key={p.num}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}