"use client";
import Link from "next/link";

const stack = [
  {
    title: "Java Core",
    desc: "JVM, OOP, Collections, Generics, Stream API, File I/O",
    icon: "☕",
    color: "#f59e0b",
    tags: ["JDK 21", "Maven", "JUnit 5"],
  },
  {
    title: "Database & SQL",
    desc: "PostgreSQL, SQL thuần, JDBC, Spring Data JPA, Flyway migration",
    icon: "🗄️",
    color: "#3b82f6",
    tags: ["PostgreSQL", "pgvector", "HikariCP"],
  },
  {
    title: "Spring Boot",
    desc: "REST API, DI, Security, Testcontainers, Docker, CI/CD",
    icon: "🍃",
    color: "#22c55e",
    tags: ["Spring Boot 3", "Spring Security", "Docker"],
  },
  {
    title: "AI Engineer",
    desc: "LLM, Spring AI, RAG, pgvector, Prompt Engineering, Evaluation",
    icon: "🤖",
    color: "#ec4899",
    tags: ["Spring AI", "RAG", "Ollama"],
  },
];

export default function BentoGrid() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Tech Stack
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Công nghệ bạn sẽ thành thạo sau 6 chặng học
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {stack.map((item) => (
          <div
            key={item.title}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.5rem",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = item.color)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
            }
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{item.icon}</div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                color: item.color,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              {item.desc}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.55rem",
                    borderRadius: 6,
                    background: item.color + "22",
                    color: item.color,
                    border: `1px solid ${item.color}44`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}