import type { CSSProperties } from "react";

const curriculum = [
  {
    index: "01 / LANGUAGE",
    title: "Java nền tảng",
    desc: "OOP, Collections, Generics, Stream API và cách tổ chức chương trình dễ bảo trì.",
    color: "#b66b2e",
    tags: ["JDK 21", "Maven", "JUnit 5"],
  },
  {
    index: "02 / DATA",
    title: "HTTP & dữ liệu",
    desc: "Thiết kế REST API, viết SQL, hiểu transaction và lưu dữ liệu với PostgreSQL.",
    color: "#3977a0",
    tags: ["REST", "PostgreSQL", "JDBC"],
  },
  {
    index: "03 / BACKEND",
    title: "Spring Boot",
    desc: "Xây API có xác thực, kiểm thử tích hợp, migration và quy trình triển khai.",
    color: "#397a5d",
    tags: ["Spring Boot", "Security", "Docker"],
  },
  {
    index: "04 / AI SYSTEMS",
    title: "Ứng dụng AI",
    desc: "Kết nối mô hình ngôn ngữ, tìm kiếm vector và đánh giá câu trả lời có nguồn.",
    color: "#786190",
    tags: ["Spring AI", "RAG", "pgvector"],
  },
];

export default function BentoGrid() {
  return (
    <section className="stack-section layout-container" aria-labelledby="curriculum-title">
      <div className="section-heading">
        <div className="section-heading-copy">
          <span className="eyebrow">NỘI DUNG HỌC</span>
          <h2 className="section-title" id="curriculum-title">Từ ngôn ngữ đến hệ thống chạy thật</h2>
          <p className="section-description">Học từng lớp nền tảng theo đúng thứ tự mà một backend developer cần dùng chúng.</p>
        </div>
      </div>

      <div className="stack-grid">
        {curriculum.map((item) => (
          <article className="stack-card" key={item.index} style={{ "--tile-accent": item.color } as CSSProperties}>
            <span className="stack-index">{item.index}</span>
            <h3 className="stack-title">{item.title}</h3>
            <p className="stack-description">{item.desc}</p>
            <div className="tag-list" aria-label={`Công nghệ: ${item.tags.join(", ")}`}>
              {item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
