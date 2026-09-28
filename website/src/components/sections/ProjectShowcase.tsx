"use client";
import Link from "next/link";

const projects = [
  {
    title: "Catalog CLI",
    desc: "Quản lý tài liệu trên terminal — Java thuần, Collections, File I/O.",
    tech: ["Java", "Maven", "OOP"],
    icon: "📁",
    color: "#f59e0b",
    phase: "Phase 1",
    href: "/JavaBackend_AI_RoadMap/docs/01_Java",
  },
  {
    title: "Knowledge Assistant",
    desc: "API Spring Boot + RAG + pgvector — hỏi đáp tài liệu có nguồn trích dẫn.",
    tech: ["Spring Boot", "Spring AI", "PostgreSQL", "Docker"],
    icon: "🤖",
    color: "#ec4899",
    phase: "Phase 3–6",
    href: "/JavaBackend_AI_RoadMap/roadmap",
  },
];

export default function ProjectShowcase() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          🏗️ Dự án thực tế
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Hai dự án xuyên suốt — xây dần qua từng phase, không chỉ là bài tập độc lập.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {projects.map((p) => (
          <Link
            key={p.title}
            href={p.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "1.75rem",
                height: "100%",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = p.color;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: p.color + "22",
                    border: `1px solid ${p.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                </span>
                <div>
                  <div style={{ fontSize: "0.7rem", color: p.color, fontWeight: 700, marginBottom: 2 }}>
                    {p.phase}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{p.title}</div>
                </div>
              </div>

              <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                {p.desc}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.55rem",
                      borderRadius: 6,
                      background: p.color + "22",
                      color: p.color,
                      border: `1px solid ${p.color}44`,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}