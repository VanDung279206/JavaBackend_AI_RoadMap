import { readMarkdown } from "@/lib/markdown";
import ExerciseViewer from "@/components/ExerciseViewer";
import ProgressTracker from "@/components/ProgressTracker";
import GiscusComments from "@/components/GiscusComments";
import Link from "next/link";

const phaseConfig: Record<
  string,
  {
    number: string;
    title: string;
    icon: string;
    color: string;
    exercises: { id: string; label: string }[];
  }
> = {
  "01_Java": {
    number: "1",
    title: "Java Nền tảng",
    icon: "☕",
    color: "#f59e0b",
    exercises: [
      { id: "P1.1", label: "P1.1 — Chuẩn hóa tiêu đề" },
      { id: "P1.2", label: "P1.2 — Danh mục tài liệu" },
      { id: "P1.3", label: "P1.3 — Đếm từ theo hợp đồng" },
      { id: "P1.4", label: "P1.4 — Tìm và sắp xếp" },
    ],
  },
  "02_Http-Sql": {
    number: "2",
    title: "HTTP & SQL",
    icon: "🗄️",
    color: "#3b82f6",
    exercises: [
      { id: "P2.1", label: "P2.1 — HTTP contract" },
      { id: "P2.2", label: "P2.2 — Schema SQL" },
      { id: "P2.3", label: "P2.3 — Query JOIN & GROUP BY" },
      { id: "P2.4", label: "P2.4 — Transaction & Index" },
    ],
  },
  "03_Spring": {
    number: "3",
    title: "Spring Boot & REST API",
    icon: "🍃",
    color: "#22c55e",
    exercises: [
      { id: "P3.1", label: "P3.1 — Controller + DTO" },
      { id: "P3.2", label: "P3.2 — Service + Repository" },
      { id: "P3.3", label: "P3.3 — Validation & Error handling" },
      { id: "P3.4", label: "P3.4 — Pagination & Transaction" },
    ],
  },
  "04_Quality": {
    number: "4",
    title: "Kiểm thử & Triển khai",
    icon: "🧪",
    color: "#8b5cf6",
    exercises: [
      { id: "P4.1", label: "P4.1 — Unit test" },
      { id: "P4.2", label: "P4.2 — Integration test" },
      { id: "P4.3", label: "P4.3 — Spring Security" },
      { id: "P4.4", label: "P4.4 — Docker + CI" },
    ],
  },
  "05_AI": {
    number: "5",
    title: "Tích hợp AI",
    icon: "🤖",
    color: "#ec4899",
    exercises: [
      { id: "P5.1", label: "P5.1 — Spring AI setup" },
      { id: "P5.2", label: "P5.2 — ChatClient cơ bản" },
      { id: "P5.3", label: "P5.3 — Prompt & structured output" },
      { id: "P5.4", label: "P5.4 — Summary endpoint" },
    ],
  },
  "06_RAG": {
    number: "6",
    title: "RAG & Đánh giá",
    icon: "🔍",
    color: "#06b6d4",
    exercises: [
      { id: "P6.1", label: "P6.1 — Chunking & Embedding" },
      { id: "P6.2", label: "P6.2 — pgvector retrieval" },
      { id: "P6.3", label: "P6.3 — RAG pipeline" },
      { id: "P6.4", label: "P6.4 — Evaluation" },
    ],
  },
};

// Generate static params cho `output: export`
export function generateStaticParams() {
  return Object.keys(phaseConfig).map((slug) => ({ phase: slug }));
}

export default function PhasePage({ params }: { params: { phase: string } }) {
  const { phase } = params;
  const config = phaseConfig[phase];

  const exercisesContent = readMarkdown(`${phase}/EXERCISES.md`);
  const solutionsContent = readMarkdown(`${phase}/SOLUTIONS.md`);

  if (!config) {
    return (
      <div style={{ maxWidth: 800, margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
          Phase không tồn tại
        </h1>
        <Link href="/JavaBackend_AI_RoadMap/docs" style={{ color: "var(--accent)" }}>
          ← Quay lại Bài tập
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
        <Link
          href="/JavaBackend_AI_RoadMap/docs"
          style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
        >
          Bài tập
        </Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>Phase {config.number}</span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: config.color + "22",
            border: `2px solid ${config.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            flexShrink: 0,
          }}
        >
          {config.icon}
        </span>
        <div>
          <div style={{ fontSize: "0.8rem", color: config.color, fontWeight: 600, marginBottom: 4 }}>
            Phase {config.number}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>{config.title}</h1>
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker phase={phase} exercises={config.exercises} />

      {/* Exercises & Solutions */}
      {exercisesContent ? (
        <ExerciseViewer
          exercises={exercisesContent}
          solutions={solutionsContent || "_Lời giải đang được cập nhật._"}
        />
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "3rem",
            textAlign: "center",
            color: "var(--muted-foreground)",
          }}
        >
          📝 Nội dung bài tập đang được cập nhật...
        </div>
      )}

      {/* Forum */}
      <GiscusComments phase={phase} />
    </div>
  );
}
