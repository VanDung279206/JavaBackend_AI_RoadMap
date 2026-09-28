"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  exercises: string;
  solutions: string;
};

export default function ExerciseViewer({ exercises, solutions }: Props) {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div>
      {/* Exercises */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="prose" style={{ maxWidth: "none" }}>
          <ReactMarkdown>{exercises}</ReactMarkdown>
        </div>
      </div>

      {/* Solutions toggle */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setShowSolutions(!showSolutions)}
          style={{
            width: "100%",
            padding: "1.25rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "none",
            border: "none",
            color: "var(--foreground)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          <span>
            {showSolutions ? "🙈" : "👁️"} {showSolutions ? "Ẩn lời giải" : "Xem lời giải"}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.75rem",
              borderRadius: 6,
              background: showSolutions ? "#ef444422" : "#f59e0b22",
              color: showSolutions ? "#ef4444" : "#f59e0b",
              border: `1px solid ${showSolutions ? "#ef444444" : "#f59e0b44"}`,
            }}
          >
            {showSolutions ? "Đang hiện" : "Hãy tự làm trước!"}
          </span>
        </button>

        {showSolutions && (
          <div
            style={{
              padding: "0 2rem 2rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "1.5rem",
            }}
          >
            <div
              style={{
                background: "#f59e0b11",
                border: "1px solid #f59e0b33",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginBottom: "1.5rem",
                fontSize: "0.85rem",
                color: "#f59e0b",
              }}
            >
              ⚠️ Đây là lời giải tham chiếu. Hãy so sánh với bài của bạn, đừng copy trực tiếp.
            </div>
            <div className="prose" style={{ maxWidth: "none" }}>
              <ReactMarkdown>{solutions}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
