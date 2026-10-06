import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, FolderCode } from "lucide-react";

const projects = [
  {
    title: "Catalog CLI",
    desc: "Xây công cụ terminal để quản lý tài liệu. Luyện OOP, Collections, kiểm thử và lưu dữ liệu bằng tệp.",
    tech: ["Java", "Maven", "JUnit"],
    label: "01 · JAVA",
    href: "/docs/01_Java",
    Icon: FolderCode,
  },
  {
    title: "Knowledge Assistant",
    desc: "Xây API hỏi đáp tài liệu có nguồn trích dẫn với Spring Boot, PostgreSQL và truy xuất vector.",
    tech: ["Spring Boot", "Spring AI", "pgvector"],
    label: "02 · BACKEND",
    href: "/roadmap",
    Icon: BrainCircuit,
  },
];

export default function ProjectShowcase() {
  return (
    <section className="projects-section section-space" aria-labelledby="projects-title">
      <div className="layout-container">
        <div className="section-heading">
          <div className="section-heading-copy">
          <span className="eyebrow">DỰ ÁN</span>
          <h2 className="section-title" id="projects-title">Dự án mẫu và lựa chọn của bạn</h2>
          </div>
          <Link href="/projects" className="text-link">
            Khám phá dự án <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="learning-actions"><Link className="text-link" href="/projects/mine">Thiết kế dự án của tôi <ArrowRight size={15} aria-hidden="true" /></Link></div>

        <div className="project-grid">
          {projects.map(({ Icon, ...project }) => (
            <Link className="project-card" href={project.href} key={project.title}>
              <div className="project-card-head">
                <span className="project-symbol"><Icon size={21} aria-hidden="true" /></span>
                <div>
                  <span className="project-label">{project.label}</span>
                  <h3 className="project-title">{project.title}</h3>
                </div>
              </div>
              <p className="project-description">{project.desc}</p>
              <div className="project-card-bottom">
                <div className="tag-list" aria-label={`Công nghệ: ${project.tech.join(", ")}`}>
                  {project.tech.map((technology) => <span className="tag" key={technology}>{technology}</span>)}
                </div>
                <ArrowUpRight className="project-arrow" size={18} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
