"use client";
import { usePhaseProgress } from "@/lib/useProgress";

type Props = { phase: string; exercises: { id: string; label: string }[] };

const saveLabel: Record<string, { text: string; color: string }> = {
  saving: { text: "⏳ Đang lưu...", color: "#f59e0b" },
  saved:  { text: "✅ Đã lưu",     color: "#22c55e" },
  error:  { text: "❌ Lưu thất bại — kiểm tra kết nối", color: "#ef4444" },
};

export default function ProgressTracker({ phase, exercises }: Props) {
  const { checked, loading, saveStatus, toggle } = usePhaseProgress(phase);

  const done = exercises.filter((e) => checked[e.id]).length;
  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;
  const statusInfo = saveLabel[saveStatus];

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>✅ Tiến độ của tôi</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {statusInfo && (
            <span style={{ fontSize: "0.8rem", color: statusInfo.color, fontWeight: 600 }}>
              {statusInfo.text}
            </span>
          )}
          <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            {done}/{exercises.length} bài
          </span>
        </div>
      </div>

      {/* Save error banner */}
      {saveStatus === "error" && (
        <div
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            background: "#ef444422",
            border: "1px solid #ef444444",
            color: "#ef4444",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          Không thể lưu tiến độ lên server. Tiến độ trên máy này vẫn được giữ — thử lại sau khi kết nối ổn định.
        </div>
      )}

      {/* Progress bar */}
      <div style={{ background: "var(--muted)", borderRadius: 999, height: 8, marginBottom: "1.25rem", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {exercises.map((ex) => (
          <label
            key={ex.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: loading || saveStatus === "saving" ? "default" : "pointer",
              fontSize: "0.9rem",
              color: checked[ex.id] ? "var(--muted-foreground)" : "var(--foreground)",
              textDecoration: checked[ex.id] ? "line-through" : "none",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={!!checked[ex.id]}
              onChange={() => !loading && saveStatus !== "saving" && toggle(ex.id)}
              disabled={loading || saveStatus === "saving"}
              style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
            />
            {ex.label}
          </label>
        ))}
      </div>

      {pct === 100 && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          borderRadius: 10,
          background: "#22c55e22",
          border: "1px solid #22c55e44",
          color: "#22c55e",
          fontWeight: 600,
          fontSize: "0.9rem",
          textAlign: "center",
        }}>
          🎉 Hoàn thành phase này! Sẵn sàng chuyển sang phase tiếp theo.
        </div>
      )}
    </div>
  );
}
