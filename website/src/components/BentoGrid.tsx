import type { CSSProperties } from "react";

const curriculum = [
  {
    index: "01",
    title: "Java nền tảng",
    desc: "OOP, Collections, Generics, Stream API và cách tổ chức chương trình dễ bảo trì.",
    color: "#b66b2e",
    tags: ["JDK 21", "Maven", "JUnit 5"],
  },
  {
    index: "02",
    title: "HTTP & dữ liệu",
    desc: "Thiết kế REST API, viết SQL, hiểu transaction và lưu dữ liệu với PostgreSQL.",
    color: "#3977a0",
    tags: ["REST", "PostgreSQL", "JDBC"],
  },
  {
    index: "03",
    title: "Spring Boot",
    desc: "Xây API có xác thực, kiểm thử tích hợp, migration và quy trình triển khai.",
    color: "#397a5d",
    tags: ["Spring Boot", "Security", "Docker"],
  },
  {
    index: "04",
    title: "Tích hợp AI và RAG",
    desc: "Truy xuất tài liệu, kiểm tra nguồn và đo câu trả lời.",
    color: "#786190",
    tags: ["Spring AI", "RAG", "pgvector"],
  },
];

export default function BentoGrid() {
  return (
    <section className="stack-section layout-container" aria-labelledby="curriculum-title">
      <div className="section-heading">
        <div className="section-heading-copy">
          <span className="eyebrow">NỘI DUNG</span>
          <h2 className="section-title" id="curriculum-title">Các phần cần học</h2>
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
