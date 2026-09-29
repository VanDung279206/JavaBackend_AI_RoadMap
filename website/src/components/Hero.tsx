import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, Braces, CircleCheck, Database, Sparkles } from "lucide-react";

const milestones = [
  { title: "Java", note: "Chương trình có kiểm thử", icon: Braces },
  { title: "Backend", note: "REST API và PostgreSQL", icon: Database },
  { title: "RAG", note: "Câu trả lời kèm nguồn", icon: Sparkles },
];

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-inner layout-container">
        <div className="hero-copy">
          <span className="eyebrow">JAVA BACKEND · 7 CHẶNG</span>
          <h1 className="hero-title">
            Từ file Java đầu tiên
            <br />
            <span>đến API có kiểm thử.</span>
          </h1>
          <p className="hero-description">
            Bảy chặng, 24 bài tập và hai dự án. Mỗi chặng ghi rõ việc cần làm, file cần sửa và cách kiểm tra kết quả.
          </p>
          <div className="hero-actions">
            <Link href="/docs/01_Java" className="button-primary">
              Bắt đầu với Java <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/roadmap" className="button-secondary">
              <BookOpen size={16} aria-hidden="true" /> Xem toàn bộ lộ trình
            </Link>
          </div>
          <p className="hero-footnote">Không cần tài khoản để bắt đầu.</p>

          <div className="hero-stats" aria-label="Quy mô lộ trình">
            <div className="hero-stat"><strong>7</strong><span>chặng học</span></div>
            <div className="hero-stat"><strong>24</strong><span>bài thực hành</span></div>
            <div className="hero-stat"><strong>2</strong><span>dự án xuyên suốt</span></div>
          </div>
        </div>

        <aside className="hero-artifact" aria-label="Các sản phẩm qua từng chặng">
          <div className="artifact-topline">
            <span>ĐẦU RA</span>
            <span className="artifact-status">Từ bài tập đến dự án</span>
          </div>
          <div className="artifact-project-title">
            <div className="artifact-project-icon"><Boxes size={21} aria-hidden="true" /></div>
            <div>
              <p>Dự án cuối</p>
              <h2>Knowledge Assistant</h2>
            </div>
          </div>
          <div className="artifact-steps">
            {milestones.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="artifact-step" key={step.title}>
                  <span className="artifact-step-number">0{index + 1}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon size={14} color="#c4d4c9" aria-hidden="true" />
                      <strong>{step.title}</strong>
                    </div>
                    <small style={{ display: "block" }}>{step.note}</small>
                  </div>
                  {index === 0 && <CircleCheck size={16} color="#a5d6a7" aria-label="Bước đầu tiên" />}
                </div>
              );
            })}
          </div>
          <div className="artifact-footer">
            <span>Spring Boot · PostgreSQL · RAG</span>
            <span>01 → 06</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
