import Link from "next/link";
import { ArrowRight, BrainCircuit, FolderCode } from "lucide-react";

const projects = [
  {
    number: "01",
    title: "Catalog CLI",
    category: "JAVA CORE · PHASE 1",
    description: "Công cụ dòng lệnh để thêm, tìm kiếm, phân loại và lưu danh mục tài liệu. Dự án giúp bạn luyện cách chia trách nhiệm thành các lớp nhỏ, dễ kiểm thử.",
    skills: ["OOP & Collections", "Tìm kiếm và sắp xếp", "File I/O", "Unit test"],
    Icon: FolderCode,
    href: "/docs/01_Java",
    action: "Bắt đầu từ bài Java",
  },
  {
    number: "02",
    title: "Knowledge Assistant",
    category: "BACKEND + AI · PHASE 2–6",
    description: "API hỏi đáp trên tài liệu riêng. Hệ thống xử lý đăng nhập, lưu trữ, tìm đoạn liên quan và trả lời kèm trích dẫn nguồn.",
    skills: ["Spring Boot API", "PostgreSQL", "Spring AI", "RAG & pgvector"],
    Icon: BrainCircuit,
    href: "/roadmap",
    action: "Xem chặng xây dựng",
  },
];

export default function ProjectsPage() {
  return (
    <section className="page-shell">
      <header className="page-heading">
        <span className="eyebrow">SẢN PHẨM XUYÊN SUỐT</span>
        <h1 className="page-title">Dự án mẫu và dự án của bạn</h1>
        <p className="page-description">
          Mỗi chặng bổ sung một phần vào sản phẩm. Cuối lộ trình, bạn có thể giải thích cách ứng dụng được thiết kế, kiểm thử và vận hành.
        </p>
      </header>

      <section className="learning-card"><h2>Dự án của tôi</h2><p>Tự chọn vấn đề, ba chức năng chính và một điểm khác biệt. Tạo đề cương, sửa dữ liệu/nghiệp vụ, chia mốc và nộp bằng chứng. AI/RAG theo nhu cầu; có thể làm RAG bằng lab riêng.</p><Link className="button-primary" href="/projects/mine">Thiết kế dự án của tôi <ArrowRight size={16} aria-hidden="true" /></Link></section>

      <div className="project-grid">
        {projects.map(({ Icon, ...project }) => (
          <article className="project-page-card" key={project.number}>
            <div className="project-page-topline">
              <span>{project.category}</span>
              <span>{project.number}</span>
            </div>
            <div className="project-page-title-row">
              <span className="project-symbol"><Icon size={22} aria-hidden="true" /></span>
              <h2>{project.title}</h2>
            </div>
            <p className="project-page-description">{project.description}</p>
            <h3 className="project-skills-title">Bạn sẽ áp dụng</h3>
            <ul className="project-skills">
              {project.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
            <Link className="button-primary project-page-action" href={project.href}>
              {project.action} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
