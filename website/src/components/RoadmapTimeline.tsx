import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const phases = [
  {
    number: "00", slug: "00_setup", title: "Setup & công cụ", color: "#68736c", milestone: "M0",
    desc: "Cài JDK, Git, Maven và IDE. Chạy, debug chương trình Java đầu tiên rồi lưu tiến trình bằng Git.",
    topics: ["JDK + IDE", "Git cơ bản", "Debug breakpoint", "Maven build"],
  },
  {
    number: "01", slug: "01_Java", title: "Java nền tảng", color: "#b66b2e", milestone: "M1",
    desc: "Viết chương trình quản lý tài liệu trên terminal. Nắm OOP, Collections, Generics và xử lý tệp.",
    topics: ["OOP & Collections", "Generics & Lambda", "Stream API", "File I/O"],
  },
  {
    number: "02", slug: "02_Http-Sql", title: "HTTP & SQL", color: "#3977a0", milestone: "M2",
    desc: "Thiết kế API contract, viết schema SQL và truy vấn dữ liệu liên bảng bằng JOIN, transaction.",
    topics: ["HTTP Methods & Status", "REST API design", "PostgreSQL + JOIN", "Transaction & Index"],
  },
  {
    number: "03", slug: "03_Spring", title: "Spring Boot & REST API", color: "#397a5d", milestone: "M3",
    desc: "Xây API CRUD với Spring Boot, JPA, migration và xử lý lỗi tập trung.",
    topics: ["Dependency Injection", "Spring Data JPA", "Flyway migration", "Exception Handler"],
  },
  {
    number: "04", slug: "04_Quality", title: "Kiểm thử & triển khai", color: "#786190", milestone: "M4",
    desc: "Viết unit và integration test, bảo mật với Spring Security, đóng gói Docker và CI/CD.",
    topics: ["JUnit 5 + Testcontainers", "Spring Security + JWT", "Docker Compose", "GitHub Actions CI"],
  },
  {
    number: "05", slug: "05_AI", title: "Tích hợp AI", color: "#a45f80", milestone: "M5",
    desc: "Kết nối mô hình ngôn ngữ qua Spring AI và xây API tóm tắt tài liệu có kiểm soát.",
    topics: ["Spring AI ChatClient", "Prompt Engineering", "Token & Context", "API timeout handling"],
  },
  {
    number: "06", slug: "06_RAG", title: "RAG & đánh giá", color: "#397d7c", milestone: "M6",
    desc: "Xây hệ thống hỏi đáp dựa trên tài liệu với pgvector, nguồn trích dẫn và đánh giá chất lượng.",
    topics: ["Embedding + pgvector", "Chunking & Retrieval", "Source attribution", "RAG evaluation"],
  },
];

export default function RoadmapTimeline() {
  return (
    <section className="roadmap-timeline" aria-label="Bảy chặng của lộ trình">
      <div className="timeline-list">
        {phases.map((phase) => (
          <article className="timeline-item" key={phase.number} style={{ "--phase-color": phase.color } as CSSProperties}>
            <div className="timeline-marker" aria-hidden="true">{phase.number}</div>
            <div className="timeline-card">
              <div className="timeline-card-header">
                <span className="timeline-phase-label">CHẶNG {phase.number}</span>
                <span className="timeline-milestone">MỐC {phase.milestone}</span>
                <h2>{phase.title}</h2>
              </div>
              <p className="timeline-description">{phase.desc}</p>
              <ul className="timeline-topics">
                {phase.topics.map((topic) => <li key={topic}>{topic}</li>)}
              </ul>
              {phase.number !== "00" && (
                <Link href={`/docs/${phase.slug}`} className="text-link timeline-link">
                  Xem bài tập <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
