"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowRight, BookOpenCheck, Check, ChevronDown, CircleHelp, ExternalLink, Play } from "lucide-react";
import catalogue from "@/generated/catalogue.json";
import LearningTools from "@/components/LearningTools";
import CodePlayground from "@/components/CodePlayground";
import { getPlaygroundSeed } from "@/lib/playground-seeds";
import { useLearning } from "@/lib/learning-store";
import { prerequisitesMet } from "@/lib/course-core";
import Link from "next/link";

type ExerciseLabel = { id: string; label: string };
type ExerciseBlock = { id: string; title: string; markdown: string; solution: string };
type Props = { phase: string; exercises: string; solutions: string; exerciseLabels: ExerciseLabel[] };

const headingPattern = /^##\s+(P\d+\.\d+)\s*(?:[—-]\s*([^\n]+))?\s*$/gm;

function splitByExercise(source: string) {
  headingPattern.lastIndex = 0;
  const headings = [...source.matchAll(headingPattern)];
  const intro = headings.length ? source.slice(0, headings[0].index ?? 0).replace(/^#.*\n/gm, "").trim() : "";
  const blocks = new Map<string, { title: string; markdown: string }>();
  headings.forEach((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const next = headings[index + 1]?.index ?? source.search(/^##\s+(?:Đạt phase|Đạt chặng|Tiêu chí)/m);
    const end = next >= 0 ? next : source.length;
    blocks.set(heading[1], {
      title: heading[2]?.trim() || heading[1],
      markdown: source.slice(start, end).trim(),
    });
  });
  return { intro, blocks };
}

function getPhaseCriteria(source: string) {
  const headings = [...source.matchAll(/^##\s+([^\n]+)$/gm)];
  const index = headings.findIndex((heading) => /^(?:Đạt phase khi|Đạt chặng khi|Tiêu chí hoàn thành)/i.test(heading[1].trim()));
  if (index < 0) return "";
  const heading = headings[index];
  const start = (heading.index ?? 0) + heading[0].length;
  const end = headings[index + 1]?.index ?? source.length;
  return source.slice(start, end).trim();
}

function formatTables(markdown: string) {
  const lines = markdown.split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length;) {
    const isTable = lines[index].trim().startsWith("|") && lines[index + 1]?.trim().startsWith("|") && /\|\s*:?-{2,}/.test(lines[index + 1]);
    if (!isTable) { output.push(lines[index]); index += 1; continue; }
    const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    const headers = cells(lines[index]);
    index += 2;
    output.push("**Các trường hợp mẫu:**");
    while (index < lines.length && lines[index].trim().startsWith("|")) {
      const values = cells(lines[index]);
      const row = headers.map((header, cellIndex) => values[cellIndex] ? `**${header}:** ${values[cellIndex]}` : "").filter(Boolean).join(" · ");
      output.push(`- ${row}`);
      index += 1;
    }
  }
  return output.join("\n");
}

function localCheck(id: string) { return catalogue.exercises.find(e => e.id === id)?.check ?? null; }

export default function ExerciseViewer({ phase, exercises, solutions, exerciseLabels }: Props) {
  const state = useLearning();
  const exerciseData = useMemo(() => splitByExercise(exercises), [exercises]);
  const solutionData = useMemo(() => splitByExercise(solutions), [solutions]);
  const phaseCriteria = useMemo(() => getPhaseCriteria(exercises), [exercises]);
  const exerciseBlocks: ExerciseBlock[] = exerciseLabels.map((item) => {
    const entry = catalogue.exercises.find(e => e.id === item.id);
    const exercise = entry ? {title:entry.title,markdown:entry.markdown} : exerciseData.blocks.get(item.id);
    const solution = entry ? {markdown:entry.solution} : solutionData.blocks.get(item.id);
    return {
      id: item.id,
      title: exercise?.title || item.label.replace(`${item.id} — `, ""),
      markdown: exercise?.markdown || "Nội dung bài đang được bổ sung.",
      solution: solution?.markdown || "_Chưa có lời giải cho bài này._",
    };
  });
  const [activeId, setActiveId] = useState(exerciseBlocks[0]?.id ?? "");
  const [solutionOpen, setSolutionOpen] = useState(false);
  const active = exerciseBlocks.find((item) => item.id === activeId) ?? exerciseBlocks[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hashId = decodeURIComponent(window.location.hash.slice(1));
      if (exerciseBlocks.some((exercise) => exercise.id === hashId)) setActiveId(hashId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [exerciseBlocks]);

  const selectExercise = (id: string) => {
    setActiveId(id);
    setSolutionOpen(false);
    window.history.replaceState(null, "", `#${id}`);
  };

  if (!active) return <p className="exercise-empty">Chặng này chưa có bài tập.</p>;

  const seed = getPlaygroundSeed(active.id);
  const local = localCheck(active.id);
  const number = catalogue.phases.find(p=>p.slug===phase)?.number ?? "";
  const entry = catalogue.exercises.find(item => item.id === active.id)!;
  const locked = 'kind' in entry && entry.kind === 'challenge' && !prerequisitesMet(entry.prerequisites, state.entries);

  return (
    <div className="exercise-workspace">
      <aside className="exercise-index" aria-label="Danh sách bài tập">
        <div className="exercise-index-heading">
          <span>CHẶNG {/^\d+$/.test(number) ? number.padStart(2,"0") : number}</span>
          <h2>Bài tập</h2>
        </div>
        <nav className="exercise-index-list">
          {exerciseBlocks.map((exercise, index) => (
            <button
              className={`exercise-index-item${active.id === exercise.id ? " is-active" : ""}`}
              type="button"
              key={exercise.id}
              onClick={() => selectExercise(exercise.id)}
              aria-current={active.id === exercise.id ? "step" : undefined}
            >
              <span className="exercise-index-number">{exercise.id}</span>
              <span className="exercise-index-title">{exerciseLabels[index]?.label.replace(`${exercise.id} — `, "") ?? exercise.title}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="exercise-index-note"><BookOpenCheck size={15} aria-hidden="true" />Mỗi lần làm một bài. Mở lời giải sau khi đã thử.</div>
      </aside>

      <section className="exercise-active" aria-labelledby="active-exercise-title">
        <header className="exercise-active-heading">
          <div>
            <span className="exercise-active-id">{active.id}</span>
            <h2 id="active-exercise-title">{active.title}</h2>
          </div>
          <span className="exercise-active-count">{exerciseBlocks.findIndex((item) => item.id === active.id) + 1} / {exerciseBlocks.length}</span>
        </header>

        {exerciseData.intro && (
          <div className="exercise-phase-note"><ReactMarkdown>{formatTables(exerciseData.intro.replace(/\[lời giải\]\([^)]*\)/gi, ""))}</ReactMarkdown></div>
        )}

        {locked ? <section className="learning-card"><h3>Nhánh thử thách cần đủ nền tảng</h3><p>Tự xác nhận đã hoàn thành {entry.prerequisites.join(', ')} trong tiến độ trước khi mở bài nâng cao.</p><div className="learning-actions">{entry.prerequisites.map(id=><Link key={id} href={`/docs/${catalogue.exercises.find(e=>e.id===id)!.phase}#${id}`} onClick={()=>selectExercise(id)}>Làm {id}</Link>)}</div></section> : <>
        <div className="exercise-main-grid">
          <article className="exercise-prompt">
            <div className="exercise-section-label">Đề bài</div>
            <div className="prose exercise-prose"><ReactMarkdown>{formatTables(active.markdown)}</ReactMarkdown></div>
            <details className="diagnostic-guide">
              <summary><CircleHelp size={15} aria-hidden="true" />Đọc lỗi sau khi chạy <ChevronDown size={15} aria-hidden="true" /></summary>
              <ol>
                <li><strong>Lỗi biên dịch:</strong> xem lỗi đầu tiên và vị trí file:dòng; lỗi sau có thể chỉ là hệ quả.</li>
                <li><strong>Lỗi khi chạy:</strong> đọc loại exception và dòng đầu tiên trỏ vào mã của bạn.</li>
                <li><strong>Kết quả sai:</strong> thử một input nhỏ, so kết quả thực tế với đầu ra đề bài rồi kiểm tra điều kiện biên.</li>
              </ol>
            </details>
          </article>

          <div className="exercise-tool-column">
            {seed ? (
              <CodePlayground key={`${active.id}-${seed.language}`} exerciseId={active.id} seed={seed} />
            ) : (
              <section className="local-run-panel" aria-label="Chạy và kiểm tra bài tập">
                <div className="local-run-heading">
                  <span className="local-run-icon"><Play size={16} aria-hidden="true" /></span>
                  <div>
                    <h3>{local?.kind === "java" ? "Chạy Java trên máy" : local?.kind === "project" ? "Chạy trong dự án" : "Bài thiết kế"}</h3>
                    <p>{local?.kind === "java" ? "Biên dịch starter và chạy test theo mã bài" : local?.kind === "project" ? "Bài dùng nhiều file hoặc công cụ hệ thống" : "Bài này cần bản hợp đồng hoặc truy vấn phù hợp"}</p>
                  </div>
                </div>
                {local ? (
                  <>
                    <p className="local-run-note">{local.note}</p>
                    <div className="local-run-file"><span>File</span><code>{local.file}</code></div>
                    <div className="local-run-command"><span>Lệnh kiểm tra</span><pre><code>{local.command}</code></pre></div>
                    {!local.file.startsWith("work/") && <a className="local-run-link" href={`https://github.com/VanDung279206/JavaBackend_AI_RoadMap/blob/Java_Roadmap_V2/${local.file}`} target="_blank" rel="noreferrer">
                      Mở file trên GitHub <ExternalLink size={14} aria-hidden="true" />
                    </a>}
                  </>
                ) : (
                  <div className="design-task-note">
                    <p>{active.id === "P2.1" ? "Lập bảng method, path, request, response và status cho từng thao tác. Soát riêng trường hợp chưa đăng nhập và tài liệu ngoài quyền." : "Ghi đầu vào, đầu ra, trường hợp lỗi và tiêu chí đạt vào đề bài."}</p>
                    {active.id.startsWith("P2.") && <span>Không có bộ chấm ẩn; kiểm tra truy vấn bằng kết quả mẫu trong đề.</span>}
                    {exerciseData.intro && <span>Bài này không có bộ kiểm tra mã tự động.</span>}
                  </div>
                )}
              </section>
            )}
            {local?.kind === "java" && (
              <div className="local-check-callout">
                <Check size={16} aria-hidden="true" />
                <p><strong>Kiểm tra đủ test trên máy</strong><code>{local.command}</code><span>{local.note}</span></p>
              </div>
            )}
          </div>
        </div>

        <LearningTools key={active.id} exerciseId={active.id} />

        <details className="exercise-solution" open={solutionOpen} onToggle={(event) => setSolutionOpen(event.currentTarget.open)}>
          <summary>
            <span><BookOpenCheck size={17} aria-hidden="true" />Lời giải và cách tối ưu</span>
            <span className="exercise-solution-action">{solutionOpen ? "Ẩn lời giải" : "Mở sau khi đã thử"}<ChevronDown size={16} aria-hidden="true" /></span>
          </summary>
          <div className="prose exercise-solution-content">
            <ReactMarkdown>{formatTables(active.solution)}</ReactMarkdown>
          </div>
        </details>

        </>}

        {phaseCriteria && (
          <details className="phase-criteria">
            <summary><span><Check size={16} aria-hidden="true" />Tiêu chí hoàn thành chặng</span><ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="prose phase-criteria-content"><ReactMarkdown>{formatTables(phaseCriteria)}</ReactMarkdown></div>
          </details>
        )}
      </section>
    </div>
  );
}

