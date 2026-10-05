import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PHASE_GUIDES } from "@/lib/phase-guides";

import {PHASES} from "@/lib/phases";
const phases=PHASES.map(p=>({...p,number:/^\d+$/.test(p.number)?p.number.padStart(2,"0"):p.number,exercises:p.exercises.length}));

export default function DocsPage() {
  return (
    <section className="page-shell">
      <header className="page-heading docs-page-heading">
        <span className="eyebrow">BÀI TẬP</span>
        <h1 className="page-title">Chọn một chặng</h1>
        <p className="page-description">Mở đề bài để xem ví dụ, chạy mã và kiểm tra cách làm.</p>
      <div className="learning-actions"><Link href="/today">Hôm nay học gì?</Link><Link href="/skills">Bản đồ & kiểm tra đầu vào</Link><Link href="/lab">Bàn thử nghiệm</Link></div></header>

      <div className="docs-grid">
        {phases.map((phase) => {
          const guide = PHASE_GUIDES.find((item) => item.number === phase.number);
          return (
          <Link
            className="docs-card"
            href={`/docs/${phase.slug}`}
            key={phase.slug}
            style={{ "--phase-color": phase.color } as CSSProperties}
          >
            <div className="docs-card-header">
              <span className="docs-card-mark">{phase.number}</span>
              <div>
                <span className="docs-card-phase">Chặng {phase.number}</span>
                <h2 className="docs-card-title">{phase.title}</h2>
              </div>
            </div>
            <p className="docs-card-description">{guide?.objective || "Luyện theo hợp đồng, thử input biên và lưu bằng chứng kiểm tra."}</p>
            <span className="docs-card-output"><strong>Kết quả:</strong> {guide?.deliverable || "Starter của bạn, test và giải thích nguyên nhân."}</span>
            <div className="docs-card-bottom">
              <span>{phase.exercises} bài thực hành</span>
              <strong>Mở bài tập <ArrowUpRight size={13} style={{ verticalAlign: "-2px" }} aria-hidden="true" /></strong>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
