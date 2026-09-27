"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Exercise = { id: string; label: string };
type Props = { phase: string; exercises: Exercise[] };

export default function ProgressTracker({ phase, exercises }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Lấy user hiện tại
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load tiến độ: Supabase nếu đã login, localStorage nếu chưa
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        const { data } = await supabase
          .from("progress")
          .select("exercise_id, done")
          .eq("user_id", user.id)
          .eq("phase", phase);
        const map: Record<string, boolean> = {};
        (data ?? []).forEach((r) => { map[r.exercise_id] = r.done; });
        setChecked(map);
      } else {
        const saved = localStorage.getItem(`progress_${phase}`);
        setChecked(saved ? JSON.parse(saved) : {});
      }
      setLoading(false);
    };
    load();
  }, [user, phase]);

  const toggle = useCallback(async (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next); // optimistic update

    if (user) {
      await supabase.from("progress").upsert({
        user_id: user.id,
        phase,
        exercise_id: id,
        done: next[id],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,phase,exercise_id" });
    } else {
      localStorage.setItem(`progress_${phase}`, JSON.stringify(next));
    }
  }, [checked, user, phase]);

  const done = exercises.filter((e) => checked[e.id]).length;
  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>✅ Tiến độ của tôi</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!user && (
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
              💡 Đăng nhập để lưu cloud
            </span>
          )}
          <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            {done}/{exercises.length} bài
          </span>
        </div>
      </div>

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
              cursor: loading ? "default" : "pointer",
              fontSize: "0.9rem",
              color: checked[ex.id] ? "var(--muted-foreground)" : "var(--foreground)",
              textDecoration: checked[ex.id] ? "line-through" : "none",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={!!checked[ex.id]}
              onChange={() => !loading && toggle(ex.id)}
              disabled={loading}
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
