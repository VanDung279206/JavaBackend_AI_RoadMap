"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type ProgressState = {
  checked: Record<string, boolean>;
  loading: boolean;
  saveStatus: SaveStatus;
  toggle: (exerciseId: string) => Promise<void>;
};

/** Hook tiến độ cho một phase cụ thể */
export function usePhaseProgress(phase: string): ProgressState {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from("progress")
          .select("exercise_id, done")
          .eq("user_id", user.id)
          .eq("phase", phase);
        if (!error) {
          const map: Record<string, boolean> = {};
          (data ?? []).forEach((r) => { map[r.exercise_id] = r.done; });
          setChecked(map);
        }
      } else {
        const saved = localStorage.getItem(`progress_${phase}`);
        setChecked(saved ? JSON.parse(saved) : {});
      }
      setLoading(false);
    };
    if (!loading || user !== null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, phase]);

  const toggle = useCallback(
    async (exerciseId: string) => {
      const next = { ...checked, [exerciseId]: !checked[exerciseId] };
      setChecked(next);

      if (user) {
        setSaveStatus("saving");
        const { error } = await supabase.from("progress").upsert(
          {
            user_id: user.id,
            phase,
            exercise_id: exerciseId,
            done: next[exerciseId],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,phase,exercise_id" }
        );
        if (error) {
          // Rollback optimistic update
          setChecked(checked);
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        } else {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        }
      } else {
        localStorage.setItem(`progress_${phase}`, JSON.stringify(next));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1000);
      }
    },
    [checked, user, phase]
  );

  return { checked, loading, saveStatus, toggle };
}

/** Hook tổng tiến độ tất cả phases (cho LearningDashboard) */
export function useAllProgress(): {
  byPhase: Record<string, number>;  // slug → số bài đã xong
  totalDone: number;
  loading: boolean;
} {
  const [byPhase, setByPhase] = useState<Record<string, number>>({});
  const [totalDone, setTotalDone] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;

      if (user) {
        const { data } = await supabase
          .from("progress")
          .select("phase, done")
          .eq("user_id", user.id)
          .eq("done", true);

        const map: Record<string, number> = {};
        let total = 0;
        (data ?? []).forEach((r) => {
          map[r.phase] = (map[r.phase] ?? 0) + 1;
          total++;
        });
        setByPhase(map);
        setTotalDone(total);
      } else {
        // Đọc từ localStorage
        const map: Record<string, number> = {};
        let total = 0;
        const phases = ["01_Java","02_Http-Sql","03_Spring","04_Quality","05_AI","06_RAG"];
        phases.forEach((p) => {
          const saved = localStorage.getItem(`progress_${p}`);
          if (saved) {
            const parsed: Record<string, boolean> = JSON.parse(saved);
            const count = Object.values(parsed).filter(Boolean).length;
            map[p] = count;
            total += count;
          }
        });
        setByPhase(map);
        setTotalDone(total);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { byPhase, totalDone, loading };
}
