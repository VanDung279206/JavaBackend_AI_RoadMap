import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {PHASES} from "@/lib/phases";
const phases=PHASES.filter(p=>/^0[0-6]_/.test(p.slug)).map(p=>({...p,num:p.number.padStart(2,"0")}));

export default function InteractiveRoadmap() {
  return (
    <section className="roadmap-section layout-container" aria-labelledby="roadmap-preview-title">
      <div className="section-heading">
        <div className="section-heading-copy">
          <span className="eyebrow">THỨ TỰ HỌC</span>
          <h2 className="section-title" id="roadmap-preview-title">Các chặng</h2>
        </div>
        <Link href="/roadmap" className="text-link">
          Xem chi tiết <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="phase-sequence" aria-label="Các chặng của lộ trình">
        {phases.map((phase) => {
          const content = (
            <div className="phase-card-content">
              <span className="phase-card-number">CHẶNG {phase.num}</span>
              <strong className="phase-card-title">{phase.title}</strong>
              <span className="phase-card-link">{phase.number === "0" ? "Chuẩn bị môi trường →" : "Học chặng này →"}</span>
            </div>
          );
          const style = { "--phase-color": phase.color } as CSSProperties;

          return phase.slug ? (
            <Link
              className="phase-card"
              key={phase.num}
              href={`${phase.number === "0" ? '/docs' : '/learn'}/${phase.slug}`}
              style={style}
              aria-label={`Học chặng ${phase.num}: ${phase.title}`}
            >
              {content}
            </Link>
          ) : (
            <div className="phase-card" key={phase.num} style={style}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
