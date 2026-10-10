import type { CSSProperties } from "react";
import catalogue from "@/generated/catalogue.json";
import { PHASE_BY_SLUG, PHASES } from "@/lib/phases";
import ExerciseViewer from "@/components/ExerciseViewer";
import ProgressTracker from "@/components/ProgressTracker";
import GiscusComments from "@/components/GiscusComments";
import Link from "next/link";
import { notFound } from "next/navigation";
import { english, englishLink, englishPhaseFor } from "@/lib/english";

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

  const exercisesContent = catalogue.exercises.filter(e => e.phase === phase).map(e => `## ${e.id} — ${e.title}\n${e.markdown}`).join("\n\n");
  const solutionsContent = catalogue.exercises.filter(e => e.phase === phase).map(e => `## ${e.id} — ${e.title}\n${e.solution}`).join("\n\n");

  return (
    <div className="page-shell phase-workspace-shell">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/docs">
          Bài tập
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Chặng {config.number}</span>
      </nav>

      <header className="phase-page-heading" style={{ "--phase-color": config.color } as CSSProperties}>
        <span className="phase-page-mark">{/^\d+$/.test(config.number) ? config.number.padStart(2,"0") : config.number}</span>
        <div>
          <div className="phase-page-kicker">Chặng {config.number} · {config.exercises.length} bài</div>
          <h1 className="phase-page-title">{config.title}</h1>
        </div>
      </header>

      {catalogue.courses.some(course => course.phase === phase) && <div className="learning-actions"><Link className="button-primary" href={`/learn/${phase}`}>Học chặng này →</Link><span>Bài học → Luyện tập → Áp dụng vào dự án → Kiểm tra cuối chặng</span></div>}

      <section className="learning-card"><h2>Tiếng Anh của chặng này</h2><p>Đọc đề và thông báo lỗi, rồi viết về hành vi và kết quả thực chạy của code.</p><div className="learning-actions">
        {english.terms.some(t => t.phase === englishPhaseFor(phase)) && <Link href={englishLink(phase)}>Từ vựng liên quan</Link>}
        {english.readings.some(r => r.phase === englishPhaseFor(phase)) && <Link href={englishLink(phase, 'reading')}>Đọc và luyện câu</Link>}
        <Link href={englishLink(english.errors.some(e => e.phase === englishPhaseFor(phase)) ? phase : 'all', 'errors')}>Đọc thông báo lỗi</Link><Link href={englishLink(phase, 'writing')}>Viết và giải thích code</Link>
      </div></section>

      <ProgressTracker phase={phase} exercises={config.exercises} />

      {exercisesContent ? (
        <ExerciseViewer
          phase={phase}
          exercises={exercisesContent}
          solutions={solutionsContent || "_Lời giải đang được cập nhật._"}
          exerciseLabels={config.exercises}
        />
      ) : (
        <div className="content-panel" style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
          Nội dung bài tập đang được cập nhật.
        </div>
      )}

      <GiscusComments phase={phase} />
    </div>
  );
}
