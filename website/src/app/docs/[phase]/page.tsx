import type { CSSProperties } from "react";
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
    <div className="page-shell" style={{ maxWidth: 900 }}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/docs">
          Bài tập
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Chặng {config.number}</span>
      </nav>

      <header className="phase-page-heading" style={{ "--phase-color": config.color } as CSSProperties}>
        <span className="phase-page-mark">{config.number.padStart(2, "0")}</span>
        <div>
          <div className="phase-page-kicker">Chặng {config.number} · Thực hành</div>
          <h1 className="phase-page-title">{config.title}</h1>
        </div>
      </header>

      {/* Progress Tracker */}
      <ProgressTracker phase={phase} exercises={config.exercises} />

      {/* Exercises & Solutions */}
      {exercisesContent ? (
        <ExerciseViewer
          exercises={exercisesContent}
          solutions={solutionsContent || "_Lời giải đang được cập nhật._"}
        />
      ) : (
        <div className="content-panel" style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
          Nội dung bài tập đang được cập nhật.
        </div>
      )}

      {/* Forum */}
      <GiscusComments phase={phase} />
    </div>
  );
}
