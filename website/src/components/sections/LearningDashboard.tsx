"use client";

import type { CSSProperties } from "react";
import { useAllProgress } from "@/lib/useProgress";
import { PHASES } from "@/lib/phases";

const DOMAIN_CONFIG = {
  java: { label: "Java Core", mark: "JVM", color: "#b66b2e" },
  database: { label: "Database & SQL", mark: "SQL", color: "#3977a0" },
  spring: { label: "Spring Boot", mark: "SPR", color: "#397a5d" },
  ai: { label: "AI & RAG", mark: "RAG", color: "#786190" },
};

export default function LearningDashboard() {
  const { byPhase, loading } = useAllProgress();

  const domainStats = Object.entries(DOMAIN_CONFIG).map(([domain, cfg]) => {
    const phases = PHASES.filter((phase) => phase.domain === domain);
    const total = phases.reduce((sum, phase) => sum + phase.exercises.length, 0);
    const done = phases.reduce((sum, phase) => sum + (byPhase[phase.slug] ?? 0), 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...cfg, domain, total, done, pct };
  });

  return (
    <section className="dashboard-section section-space" aria-labelledby="progress-title">
      <div className="layout-container" aria-busy={loading}>
        <div className="section-heading">
          <div className="section-heading-copy">
            <span className="eyebrow">TIẾN ĐỘ</span>
            <h2 className="section-title" id="progress-title">Tiến độ tự khai báo</h2>
            <p className="section-description">
              {loading ? "Đang tải…" : "Tiến độ lưu trên thiết bị này; đăng nhập để đồng bộ."}
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          {domainStats.map((item) => (
            <article
              className="progress-card"
              key={item.domain}
              style={{ "--domain-color": item.color } as CSSProperties}
            >
              <div className="progress-card-head">
                <span className="progress-mark" aria-hidden="true">{item.mark}</span>
                <div style={{ minWidth: 0 }}>
                  <h3 className="progress-card-title">{item.label}</h3>
                  <p className="progress-card-count">{item.done} / {item.total} bài tự đánh dấu</p>
                </div>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label={`Tiến độ ${item.label}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.pct}
              >
                <div className="progress-fill" style={{ width: `${item.pct}%` }} />
              </div>
              <div className="progress-card-foot">
                <span>{loading ? "Đang đồng bộ" : "Tiến độ"}</span>
                <strong>{item.pct}%</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
