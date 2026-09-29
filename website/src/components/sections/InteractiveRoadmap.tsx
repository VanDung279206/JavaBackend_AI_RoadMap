import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const phases = [
  { num: "00", title: "Setup & công cụ", color: "#68736c", slug: null },
  { num: "01", title: "Java nền tảng", color: "#b66b2e", slug: "01_Java" },
  { num: "02", title: "HTTP & SQL", color: "#3977a0", slug: "02_Http-Sql" },
  { num: "03", title: "Spring Boot", color: "#397a5d", slug: "03_Spring" },
  { num: "04", title: "Kiểm thử & deploy", color: "#786190", slug: "04_Quality" },
  { num: "05", title: "Tích hợp AI", color: "#a45f80", slug: "05_AI" },
  { num: "06", title: "RAG & đánh giá", color: "#397d7c", slug: "06_RAG" },
];

export default function InteractiveRoadmap() {
  return (
    <section className="roadmap-section layout-container" aria-labelledby="roadmap-preview-title">
      <div className="section-heading">
        <div className="section-heading-copy">
          <span className="eyebrow">THỨ TỰ HỌC</span>
          <h2 className="section-title" id="roadmap-preview-title">Các chặng</h2>
        </div>
        <Link href="/roadmap" className="text-link">
          Xem chi tiết <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="phase-sequence" aria-label="Các chặng của lộ trình">
        {phases.map((phase) => {
          const content = (
            <div className="phase-card-content">
              <span className="phase-card-number">CHẶNG {phase.num}</span>
              <strong className="phase-card-title">{phase.title}</strong>
              <span className="phase-card-link">{phase.slug ? "Xem bài tập →" : "Chuẩn bị môi trường"}</span>
            </div>
          );
          const style = { "--phase-color": phase.color } as CSSProperties;

          return phase.slug ? (
            <Link
              className="phase-card"
              key={phase.num}
              href={`/docs/${phase.slug}`}
              style={style}
              aria-label={`Mở bài tập chặng ${phase.num}: ${phase.title}`}
            >
              {content}
            </Link>
          ) : (
            <div className="phase-card" key={phase.num} style={style}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
