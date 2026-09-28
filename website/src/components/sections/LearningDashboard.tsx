"use client";

const items = [
  { name: "Java Core", progress: 0, detail: "JVM · OOP · Collections · Stream API", color: "#f59e0b", icon: "☕" },
  { name: "Database & SQL", progress: 0, detail: "SQL · PostgreSQL · JDBC · JPA", color: "#3b82f6", icon: "🗄️" },
  { name: "Spring Boot", progress: 0, detail: "REST API · Security · Testing · Docker", color: "#22c55e", icon: "🍃" },
  { name: "AI Engineering", progress: 0, detail: "LLM · Spring AI · RAG · pgvector", color: "#ec4899", icon: "🤖" },
];

export default function LearningDashboard() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          📊 Learning Dashboard
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Theo dõi tiến độ học theo từng lĩnh vực — cập nhật khi bạn hoàn thành bài tập.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {items.map((item) => (
          <div
            key={item.name}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 2 }}>
                  {item.detail}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                background: "var(--muted)",
                borderRadius: 999,
                height: 6,
                marginBottom: "0.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${item.progress}%`,
                  background: item.color,
                  borderRadius: 999,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textAlign: "right" }}>
              {item.progress}% hoàn thành
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}