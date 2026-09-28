import { readMarkdown } from "@/lib/markdown";
import { PHASE_BY_SLUG, PHASES } from "@/lib/phases";
import ExerciseViewer from "@/components/ExerciseViewer";
import ProgressTracker from "@/components/ProgressTracker";
import GiscusComments from "@/components/GiscusComments";
import Link from "next/link";
import { notFound } from "next/navigation";

// Generate static params cho `output: export`
export function generateStaticParams() {
  return PHASES.map((p) => ({ phase: p.slug }));
}

export default async function PhasePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const config = PHASE_BY_SLUG[phase];

  if (!config) notFound();

  const exercisesContent = readMarkdown(`${phase}/EXERCISES.md`);
  const solutionsContent = readMarkdown(`${phase}/SOLUTIONS.md`);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
        <Link href="/docs" style={{ color: "var(--muted-foreground)", textDecoration: "none" }}>
          Bài tập
        </Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>Phase {config.number}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
        <span
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: config.color + "22",
            border: `2px solid ${config.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", flexShrink: 0,
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
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "3rem", textAlign: "center",
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
