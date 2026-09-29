import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PHASE_GUIDES } from "@/lib/phase-guides";

const phases = [
  { slug: "01_Java", number: "01", title: "Java nền tảng", color: "#b66b2e", exercises: 4 },
  { slug: "02_Http-Sql", number: "02", title: "HTTP & SQL", color: "#3977a0", exercises: 4 },
  { slug: "03_Spring", number: "03", title: "Spring Boot", color: "#397a5d", exercises: 4 },
  { slug: "04_Quality", number: "04", title: "Kiểm thử & triển khai", color: "#786190", exercises: 4 },
  { slug: "05_AI", number: "05", title: "Tích hợp AI", color: "#a45f80", exercises: 4 },
  { slug: "06_RAG", number: "06", title: "RAG & đánh giá", color: "#397d7c", exercises: 4 },
];

export default function DocsPage() {
  return (
    <section className="page-shell">
      <header className="page-heading docs-page-heading">
        <span className="eyebrow">BÀI TẬP</span>
        <h1 className="page-title">Chọn một chặng</h1>
        <p className="page-description">Mở đề bài để xem ví dụ, chạy mã và kiểm tra cách làm.</p>
      </header>

      <div className="docs-grid">
        {phases.map((phase) => {
          const guide = PHASE_GUIDES.find((item) => item.number === phase.number);
          return (
          <Link
            className="docs-card"
            href={`/docs/${phase.slug}`}
            key={phase.slug}
            style={{ "--phase-color": phase.color } as CSSProperties}
          >
            <div className="docs-card-header">
              <span className="docs-card-mark">{phase.number}</span>
              <div>
                <span className="docs-card-phase">Chặng {phase.number}</span>
                <h2 className="docs-card-title">{phase.title}</h2>
              </div>
            </div>
            <p className="docs-card-description">{guide?.objective}</p>
            <span className="docs-card-output"><strong>Kết quả:</strong> {guide?.deliverable}</span>
            <div className="docs-card-bottom">
              <span>{phase.exercises} bài thực hành</span>
              <strong>Mở bài tập <ArrowUpRight size={13} style={{ verticalAlign: "-2px" }} aria-hidden="true" /></strong>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
