"use client";
import { useAllProgress } from "@/lib/useProgress";
import { PHASES } from "@/lib/phases";

const DOMAIN_CONFIG = {
  java:     { label: "Java Core",         icon: "☕", color: "#f59e0b" },
  database: { label: "Database & SQL",    icon: "🗄️", color: "#3b82f6" },
  spring:   { label: "Spring Boot",       icon: "🍃", color: "#22c55e" },
  ai:       { label: "AI Engineering",    icon: "🤖", color: "#ec4899" },
};

export default function LearningDashboard() {
  const { byPhase, loading } = useAllProgress();

  // Tính tổng done và total theo domain
  const domainStats = Object.entries(DOMAIN_CONFIG).map(([domain, cfg]) => {
    const phases = PHASES.filter((p) => p.domain === domain);
    const total = phases.reduce((s, p) => s + p.exercises.length, 0);
    const done  = phases.reduce((s, p) => s + (byPhase[p.slug] ?? 0), 0);
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...cfg, domain, total, done, pct };
  });

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          📊 Learning Dashboard
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          {loading
            ? "Đang tải tiến độ..."
            : "Tiến độ học theo từng lĩnh vực — cập nhật khi bạn tick bài xong."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {domainStats.map((item) => (
          <div
            key={item.domain}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.5rem",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.3s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.75rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 2 }}>
                  {item.done}/{item.total} bài hoàn thành
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--muted)",
                borderRadius: 999,
                height: 8,
                marginBottom: "0.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${item.pct}%`,
                  background: item.color,
                  borderRadius: 999,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: item.color, textAlign: "right", fontWeight: 600 }}>
              {item.pct}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}