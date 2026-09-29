import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, Braces, CircleCheck, Database, Sparkles } from "lucide-react";

const milestones = [
  { title: "Java Core", note: "Viết chương trình có cấu trúc", icon: Braces },
  { title: "Backend API", note: "Thiết kế dữ liệu và REST API", icon: Database },
  { title: "Sản phẩm AI", note: "Tích hợp RAG có dẫn nguồn", icon: Sparkles },
];

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-inner layout-container">
        <div className="hero-copy">
          <span className="eyebrow">LỘ TRÌNH THỰC HÀNH · JAVA → AI</span>
          <h1 className="hero-title">
            Viết backend vững.
            <br />
            <span>Đưa AI vào sản phẩm.</span>
          </h1>
          <p className="hero-description">
            Đi từ Java nền tảng đến một ứng dụng hỏi đáp tài liệu có nguồn trích dẫn.
            Mỗi chặng có bài thực hành và sản phẩm để kiểm chứng điều bạn đã học.
          </p>
          <div className="hero-actions">
            <Link href="/docs/01_Java" className="button-primary">
              Bắt đầu với Java <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/roadmap" className="button-secondary">
              <BookOpen size={16} aria-hidden="true" /> Xem toàn bộ lộ trình
            </Link>
          </div>
          <p className="hero-footnote">Tự học theo nhịp của bạn · Có thể bắt đầu mà không cần đăng nhập</p>

          <div className="hero-stats" aria-label="Quy mô lộ trình">
            <div className="hero-stat"><strong>7</strong><span>chặng học</span></div>
            <div className="hero-stat"><strong>24</strong><span>bài thực hành</span></div>
            <div className="hero-stat"><strong>2</strong><span>dự án xuyên suốt</span></div>
          </div>
        </div>

        <aside className="hero-artifact" aria-label="Bản xem trước dự án Knowledge Assistant">
          <div className="artifact-topline">
            <span>PROJECT / 02</span>
            <span className="artifact-status">Từng bước một</span>
          </div>
          <div className="artifact-project-title">
            <div className="artifact-project-icon"><Boxes size={21} aria-hidden="true" /></div>
            <div>
              <p>Dự án cuối lộ trình</p>
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
            <span>Spring Boot · PostgreSQL · Spring AI</span>
            <span>BUILD →</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
