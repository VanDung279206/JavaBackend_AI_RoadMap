"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

type Props = {
  exercises: string;
  solutions: string;
};

export default function ExerciseViewer({ exercises, solutions }: Props) {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div className="exercise-viewer">
      <article className="content-panel exercise-content">
        <ReactMarkdown>{exercises}</ReactMarkdown>
      </article>

      <section className="solution-panel">
        <button
          className="solution-toggle"
          onClick={() => setShowSolutions((show) => !show)}
          aria-expanded={showSolutions}
          aria-controls="solution-content"
        >
          <span className="solution-toggle-title">
            {showSolutions ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            {showSolutions ? "Ẩn lời giải" : "Xem lời giải tham khảo"}
          </span>
          <span className="solution-toggle-end">
            <span className="solution-state">{showSolutions ? "Đang hiện" : "Tự làm trước nhé"}</span>
            <ChevronDown className={showSolutions ? "solution-chevron is-open" : "solution-chevron"} size={17} aria-hidden="true" />
          </span>
        </button>

        {showSolutions && (
          <div className="solution-content" id="solution-content">
            <p className="solution-notice">Lời giải chỉ mang tính tham khảo. Hãy so sánh cách tiếp cận và tự kiểm tra các trường hợp biên.</p>
            <div className="prose">
              <ReactMarkdown>{solutions}</ReactMarkdown>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
