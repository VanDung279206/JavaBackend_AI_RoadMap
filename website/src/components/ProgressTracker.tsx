"use client";

import { usePhaseProgress } from "@/lib/useProgress";

type Props = { phase: string; exercises: { id: string; label: string }[] };

const saveLabel: Record<string, { text: string; color: string }> = {
  saving: { text: "Đang lưu…", color: "#94712e" },
  saved: { text: "Đã lưu", color: "#397a5d" },
  error: { text: "Lưu thất bại", color: "#b93835" },
};

export default function ProgressTracker({ phase, exercises }: Props) {
  const { checked, loading, saveStatus, toggle } = usePhaseProgress(phase);
  const done = exercises.filter((exercise) => checked[exercise.id]).length;
  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;
  const statusInfo = saveLabel[saveStatus];

  return (
    <section className="tracker-panel" aria-labelledby="tracker-title" aria-busy={loading}>
      <div className="tracker-heading">
        <div>
          <span className="eyebrow">TIẾN ĐỘ CỦA BẠN</span>
          <h2 id="tracker-title">Bài tập đã hoàn thành</h2>
        </div>
        <div className="tracker-total">
          {statusInfo && <span className="tracker-save-status" style={{ color: statusInfo.color }}>{statusInfo.text}</span>}
          <strong>{done}<span>/{exercises.length}</span></strong>
        </div>
      </div>

      {saveStatus === "error" && (
        <p className="tracker-error" role="status">
          Không thể đồng bộ với máy chủ. Tiến độ trên thiết bị này vẫn được giữ; thử lại khi kết nối ổn định.
        </p>
      )}

      <div className="tracker-progress-track" role="progressbar" aria-label="Tiến độ bài tập" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="tracker-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="tracker-exercises">
        {exercises.map((exercise) => (
          <label className={`tracker-exercise${checked[exercise.id] ? " is-complete" : ""}`} key={exercise.id}>
            <input
              type="checkbox"
              checked={!!checked[exercise.id]}
              onChange={() => !loading && saveStatus !== "saving" && toggle(exercise.id)}
              disabled={loading || saveStatus === "saving"}
            />
            <span>{exercise.label}</span>
          </label>
        ))}
      </div>

      {pct === 100 && (
        <p className="tracker-complete" role="status">Hoàn thành chặng này. Bạn có thể chuyển sang phần tiếp theo.</p>
      )}
    </section>
  );
}
