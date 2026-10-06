import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, CircleAlert } from "lucide-react";
import { PHASE_GUIDES } from "@/lib/phase-guides";
import CodePlayground from "@/components/CodePlayground";
import { getPlaygroundSeed } from "@/lib/playground-seeds";

import {PHASES} from "@/lib/phases";
const phaseLinks=Object.fromEntries(PHASES.map(p=>[p.number.padStart(2,"0"),{slug:p.slug,title:p.title}]));

export default function RoadmapTimeline() {
  return (
    <section className="roadmap-timeline" aria-label="Hướng dẫn từng chặng">
      <div className="timeline-list">
        {PHASE_GUIDES.map((phase) => {
          const link = phaseLinks[phase.number];
          return (
            <article className="phase-guide" id={`phase-${phase.number}`} key={phase.number}>
              <header className="phase-guide-heading">
                <span className="phase-guide-number">{phase.number}</span>
                <div className="phase-guide-heading-copy">
                  <span className="phase-guide-label">CHẶNG {phase.number}</span>
                  <h2>{link?.title}</h2>
                  <p>{phase.objective}</p>
                </div>
                <ChevronDown className="phase-guide-chevron" size={20} aria-hidden="true" />
              </header>

              <div className="phase-guide-start"><strong>Bắt đầu:</strong> {phase.start}</div>

              <details className="phase-guide-details" open={phase.number === "00"}>
                <summary>
                  <span>{phase.number === "00" ? "Mở hướng dẫn cài đặt" : "Cách học chặng này"}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>

                <ol className="phase-guide-steps">
                  {phase.steps.map((step, index) => (
                    <li className="phase-guide-step" key={step.title}>
                      <span className="phase-guide-step-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className="phase-guide-step-copy">
                        <h3>{step.title}</h3>
                        <p>{step.detail}</p>
                        {step.command && (
                          <pre className="phase-guide-command"><code>{step.command}</code></pre>
                        )}
                        {step.check && <p className="phase-guide-check"><Check size={15} aria-hidden="true" />{step.check}</p>}
                      </div>
                    </li>
                  ))}
                </ol>

                {phase.number === "00" && getPlaygroundSeed("P0.2") && (
                  <section className="phase-guide-live-runner" aria-label="Chạy thử chương trình Java đầu tiên">
                    <div className="phase-guide-runner-label">Thử chạy chương trình đầu tiên</div>
                    <CodePlayground exerciseId="P0.2" seed={getPlaygroundSeed("P0.1")!} />
                  </section>
                )}

                <div className="phase-guide-deliverable">
                  <span>Kết quả cần có</span>
                  <p>{phase.deliverable}</p>
                </div>

                <div className="phase-guide-bottom-grid">
                  <section className="phase-guide-checklist" aria-label="Tiêu chí hoàn thành">
                    <h3>Chuyển chặng khi</h3>
                    <ul>{phase.checklist.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul>
                  </section>
                  <section className="phase-guide-pitfalls" aria-label="Lỗi thường gặp">
                    <h3><CircleAlert size={15} aria-hidden="true" />Lỗi thường gặp</h3>
                    <ul>{phase.pitfalls.map((item) => <li key={item.problem}><strong>{item.problem}</strong><span>{item.fix}</span></li>)}</ul>
                  </section>
                </div>

                {link && (
                  <Link className="phase-guide-link" href={`${phase.number === '00' ? '/docs' : '/learn'}/${link.slug}`}>
                    Học chặng này · {link.title} <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                )}
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
