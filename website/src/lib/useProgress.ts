"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type ProgressState = {
  checked: Record<string, boolean>;
  loading: boolean;
  saveStatus: SaveStatus;
  toggle: (exerciseId: string) => Promise<void>;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function readLocalProgress(phase: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`progress_${phase}`);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, v]) => typeof v === "boolean"
      ) as [string, boolean][]
    );
  } catch {
    return {};
  }
}

// ─── usePhaseProgress ─────────────────────────────────────────────────────────

export function usePhaseProgress(phase: string): ProgressState {
  // undefined = session check chưa hoàn tất; null = đã xác nhận chưa đăng nhập
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Keep the save-status timer owned by this hook and clean it up on unmount.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveOperationId = useRef(0);
  const exerciseOperationIds = useRef<Record<string, number>>({});
  const scheduleReset = useCallback((delay: number, operationId: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (saveOperationId.current === operationId) setSaveStatus("idle");
    }, delay);
  }, []);

  // Ignore responses from an earlier auth session or progress request.
  const activeRequestId = useRef(0);
  const userIdRef = useRef<string | null | undefined>(undefined);
  const authEventVersion = useRef(0);

  // Track auth changes before applying the initial session lookup result.
  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      authEventVersion.current += 1;
      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;
      const identityChanged = userIdRef.current !== nextUserId;
      userIdRef.current = nextUserId;

      if (event === "SIGNED_OUT" || event === "SIGNED_IN" || identityChanged) {
        // Invalidate a pending fetch synchronously, before React runs effects.
        activeRequestId.current += 1;
        saveOperationId.current += 1;
        exerciseOperationIds.current = {};
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setChecked({});
        setSaveStatus("idle");
        setLoading(true);
      }

      setUser(nextUser);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted || authEventVersion.current !== 0) return;
      const initialUser = data.session?.user ?? null;
      userIdRef.current = initialUser?.id ?? null;
      setUser(initialUser);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      saveOperationId.current += 1;
      exerciseOperationIds.current = {};
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Load this phase only after the auth session is known.
  useEffect(() => {
    if (user === undefined) return;

    const requestId = ++activeRequestId.current;
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      if (user) {
        const { data, error } = await supabase
          .from("progress")
          .select("exercise_id, done")
          .eq("user_id", user.id)
          .eq("phase", phase);

        if (cancelled || activeRequestId.current !== requestId) return;

        if (!error) {
          const map: Record<string, boolean> = {};
          (data ?? []).forEach((row) => {
            map[row.exercise_id] = row.done;
          });
          setChecked(map);
        }
      } else {
        if (cancelled || activeRequestId.current !== requestId) return;
        setChecked(readLocalProgress(phase));
      }

      if (!cancelled && activeRequestId.current === requestId) {
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, phase]);

  const toggle = useCallback(
    async (exerciseId: string) => {
      const wasChecked = checked[exerciseId] ?? false;
      const next = { ...checked, [exerciseId]: !checked[exerciseId] };
      const operationId = ++saveOperationId.current;
      exerciseOperationIds.current[exerciseId] = operationId;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
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
        const sameUser = userIdRef.current === user.id;
        const latestForExercise =
          exerciseOperationIds.current[exerciseId] === operationId;
        if (error && sameUser && latestForExercise) {
          setChecked((current) => ({ ...current, [exerciseId]: wasChecked }));
        }
        if (operationId !== saveOperationId.current || !sameUser) return;

        if (error) {
          setSaveStatus("error");
          scheduleReset(3000, operationId);
        } else {
          setSaveStatus("saved");
          scheduleReset(1500, operationId);
        }
      } else {
        localStorage.setItem(`progress_${phase}`, JSON.stringify(next));
        setSaveStatus("saved");
        scheduleReset(1000, operationId);
      }
    },
    [checked, user, phase, scheduleReset]
  );

  return { checked, loading, saveStatus, toggle };
}

// ─── useAllProgress ───────────────────────────────────────────────────────────

const PHASE_SLUGS = ["01_Java", "02_Http-Sql", "03_Spring", "04_Quality", "05_AI", "06_RAG"];

export function useAllProgress(): {
  byPhase: Record<string, number>;
  totalDone: number;
  loading: boolean;
} {
  const [byPhase, setByPhase] = useState<Record<string, number>>({});
  const [totalDone, setTotalDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeRequestId = useRef(0);

  useEffect(() => {
    let mounted = true;
    let authEventVersion = 0;

    const loadForUser = async (user: User | null) => {
      const requestId = ++activeRequestId.current;

      setLoading(true);

      if (user) {
        const { data } = await supabase
          .from("progress")
          .select("phase, done")
          .eq("user_id", user.id)
          .eq("done", true);

        if (!mounted || activeRequestId.current !== requestId) return;

        const map: Record<string, number> = {};
        let total = 0;
        (data ?? []).forEach((r) => {
          map[r.phase] = (map[r.phase] ?? 0) + 1;
          total++;
        });
        setByPhase(map);
        setTotalDone(total);
      } else {
        if (!mounted || activeRequestId.current !== requestId) return;

        const map: Record<string, number> = {};
        let total = 0;
        PHASE_SLUGS.forEach((p) => {
          const saved = readLocalProgress(p);
          const count = Object.values(saved).filter(Boolean).length;
          if (count > 0) { map[p] = count; total += count; }
        });
        setByPhase(map);
        setTotalDone(total);
      }

      if (mounted && activeRequestId.current === requestId) {
        setLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      authEventVersion += 1;

      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        // Do not leave the previous account's totals visible during the reload.
        setByPhase({});
        setTotalDone(0);
      }

      void loadForUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && authEventVersion === 0) {
        void loadForUser(data.session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      activeRequestId.current += 1;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { byPhase, totalDone, loading };
}
