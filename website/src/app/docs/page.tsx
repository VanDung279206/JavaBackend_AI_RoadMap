"use client";
import Link from "next/link";

const phases = [
  { slug: "01_Java", number: "1", title: "Java Nền tảng", icon: "☕", color: "#f59e0b", exercises: 4 },
  { slug: "02_Http-Sql", number: "2", title: "HTTP & SQL", icon: "🗄️", color: "#3b82f6", exercises: 4 },
  { slug: "03_Spring", number: "3", title: "Spring Boot", icon: "🍃", color: "#22c55e", exercises: 4 },
  { slug: "04_Quality", number: "4", title: "Kiểm thử & Triển khai", icon: "🧪", color: "#8b5cf6", exercises: 4 },
  { slug: "05_AI", number: "5", title: "Tích hợp AI", icon: "🤖", color: "#ec4899", exercises: 4 },
  { slug: "06_RAG", number: "6", title: "RAG & Đánh giá", icon: "🔍", color: "#06b6d4", exercises: 4 },
];

export default function DocsPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          📚 Bài tập & Lời giải
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>
          Mỗi phase có bài tập tự làm — đọc đề, viết code, rồi mới xem lời giải. Theo dõi tiến độ bằng checkbox.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {phases.map((phase) => (
          <Link
            key={phase.slug}
            href={`/docs/${phase.slug}`}
            style={{
              display: "block",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.5rem",
              textDecoration: "none",
              color: "var(--foreground)",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = phase.color;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.75rem" }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: phase.color + "22",
                  border: `1px solid ${phase.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {phase.icon}
              </span>
              <div>
                <div style={{ fontSize: "0.75rem", color: phase.color, fontWeight: 600, marginBottom: 2 }}>
                  Phase {phase.number}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{phase.title}</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                {phase.exercises} bài tập
              </span>
              <span style={{ fontSize: "0.85rem", color: phase.color, fontWeight: 600 }}>
                Vào học →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}