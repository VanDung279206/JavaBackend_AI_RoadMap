import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
      <header className="page-heading">
        <span className="eyebrow">BÀI TẬP THỰC HÀNH</span>
        <h1 className="page-title">Học bằng cách tự giải quyết vấn đề</h1>
        <p className="page-description">
          Thử giải trước, đánh dấu tiến độ sau đó mới xem lời giải tham khảo. Tiến độ được lưu trên thiết bị và đồng bộ khi bạn đăng nhập.
        </p>
      </header>

      <div className="docs-grid">
        {phases.map((phase) => (
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
            <div className="docs-card-bottom">
              <span>{phase.exercises} bài thực hành</span>
              <strong>Mở bài tập <ArrowUpRight size={13} style={{ verticalAlign: "-2px" }} aria-hidden="true" /></strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
