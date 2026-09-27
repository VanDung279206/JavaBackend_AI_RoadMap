"use client";
import Link from "next/link";

const phases = [
  {
    id: "00",
    slug: "00_setup",
    number: "0",
    title: "Setup & Công cụ",
    desc: "Cài JDK, Git, Maven, IDE. Chạy và debug chương trình Java đầu tiên. Commit lên Git.",
    icon: "⚙️",
    color: "#64748b",
    topics: ["JDK + IDE", "Git cơ bản", "Debug breakpoint", "Maven build"],
    milestone: "M0",
  },
  {
    id: "01",
    slug: "01_Java",
    number: "1",
    title: "Java Nền tảng",
    desc: "Viết chương trình quản lý tài liệu trên terminal. Nắm vững OOP, Collections, Generics và xử lý tệp.",
    icon: "☕",
    color: "#f59e0b",
    topics: ["OOP & Collections", "Generics & Lambda", "Stream API", "File I/O"],
    milestone: "M1",
  },
  {
    id: "02",
    slug: "02_Http-Sql",
    number: "2",
    title: "HTTP & SQL",
    desc: "Thiết kế API contract, viết schema SQL, query dữ liệu liên bảng với JOIN và transaction.",
    icon: "🗄️",
    color: "#3b82f6",
    topics: ["HTTP Methods & Status", "REST API design", "PostgreSQL + JOIN", "Transaction & Index"],
    milestone: "M2",
  },
  {
    id: "03",
    slug: "03_Spring",
    number: "3",
    title: "Spring Boot & REST API",
    desc: "Xây dựng API CRUD hoàn chỉnh với Spring Boot, JPA, migration và xử lý lỗi tập trung.",
    icon: "🍃",
    color: "#22c55e",
    topics: ["Dependency Injection", "Spring Data JPA", "Flyway migration", "Exception Handler"],
    milestone: "M3",
  },
  {
    id: "04",
    slug: "04_Quality",
    number: "4",
    title: "Kiểm thử & Triển khai",
    desc: "Viết unit/integration test, bảo mật với Spring Security, đóng gói Docker và CI/CD.",
    icon: "🧪",
    color: "#8b5cf6",
    topics: ["JUnit 5 + Testcontainers", "Spring Security + JWT", "Docker Compose", "GitHub Actions CI"],
    milestone: "M4",
  },
  {
    id: "05",
    slug: "05_AI",
    number: "5",
    title: "Tích hợp AI",
    desc: "Kết nối LLM qua Spring AI, tạo API tóm tắt tài liệu, xử lý lỗi và giới hạn quyền.",
    icon: "🤖",
    color: "#ec4899",
    topics: ["Spring AI ChatClient", "Prompt Engineering", "Token & Context", "API timeout handling"],
    milestone: "M5",
  },
  {
    id: "06",
    slug: "06_RAG",
    number: "6",
    title: "RAG & Đánh giá",
    desc: "Xây dựng hệ thống hỏi đáp có nguồn dựa trên tài liệu, dùng pgvector và đánh giá chất lượng.",
    icon: "🔍",
    color: "#06b6d4",
    topics: ["Embedding + pgvector", "Chunking & Retrieval", "Source attribution", "RAG evaluation"],
    milestone: "M6",
  },
];

export default function RoadmapTimeline() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
          }}
        >
          Lộ trình học
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>
          7 chặng từ cài đặt đến hệ thống AI hoàn chỉnh — học theo thứ tự, mỗi chặng có bài tập và mốc kiểm chứng.
        </p>
      </div>

      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "2rem",
            top: 0,
            bottom: 0,
            width: 2,
            background: "linear-gradient(to bottom, var(--accent), transparent)",
            opacity: 0.3,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {phases.map((phase, idx) => (
            <div
              key={phase.id}
              style={{
                display: "flex",
                gap: "2rem",
                alignItems: "flex-start",
              }}
            >
              {/* Node */}
              <div
                style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: phase.color + "22",
                  border: `2px solid ${phase.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {phase.icon}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "1.5rem",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = phase.color)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: 6,
                      background: phase.color + "33",
                      color: phase.color,
                    }}
                  >
                    Phase {phase.number}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {phase.milestone}
                  </span>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{phase.title}</h3>
                </div>

                <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {phase.desc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {phase.topics.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 6,
                        background: "var(--muted)",
                        color: "var(--muted-foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {phase.number !== "0" && (
                  <div style={{ marginTop: "1rem" }}>
                    <Link
                      href={`/JavaBackend_AI_RoadMap/docs/${phase.slug}`}
                      style={{
                        fontSize: "0.85rem",
                        color: phase.color,
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Xem bài tập →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}