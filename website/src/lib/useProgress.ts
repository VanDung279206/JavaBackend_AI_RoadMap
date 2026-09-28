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
    // Chỉ giữ giá trị boolean
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

/**
 * Vấn đề 1 — trạng thái tải vô hạn khi chưa đăng nhập:
 *   Dùng `sessionReady` để phân biệt "đang kiểm tra phiên" với "đã xác nhận chưa đăng nhập".
 *   Effect tải tiến độ chỉ chạy sau khi `sessionReady = true`.
 *
 * Vấn đề 5 — phản hồi cũ ghi đè trạng thái mới (stale closure):
 *   Mỗi lần effect chạy tạo một `requestId` riêng. Sau khi await, kiểm tra
 *   xem requestId còn khớp với ref hiện tại không; nếu không thì bỏ qua.
 */
export function usePhaseProgress(phase: string): ProgressState {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = chưa kiểm tra
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Ref theo dõi request hiện tại để hủy stale response
  const activeRequestId = useRef(0);

  // Theo dõi phiên đăng nhập
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Tải tiến độ — chỉ chạy sau khi đã xác định phiên (user !== undefined)
  useEffect(() => {
    if (user === undefined) return; // Đang kiểm tra phiên, chờ thêm

    const requestId = ++activeRequestId.current;

    const load = async () => {
      setLoading(true);

      if (user) {
        // Đã đăng nhập → đọc từ Supabase
        const { data, error } = await supabase
          .from("progress")
          .select("exercise_id, done")
          .eq("user_id", user.id)
          .eq("phase", phase);

        // Kiểm tra stale: nếu requestId đã đổi thì bỏ qua
        if (activeRequestId.current !== requestId) return;

        if (!error) {
          const map: Record<string, boolean> = {};
          (data ?? []).forEach((r) => { map[r.exercise_id] = r.done; });
          setChecked(map);
        }
        // Nếu lỗi network: giữ nguyên checked hiện tại, không crash
      } else {
        // Khách → đọc từ localStorage (có xử lý JSON không hợp lệ)
        if (activeRequestId.current !== requestId) return;
        setChecked(readLocalProgress(phase));
      }

      if (activeRequestId.current === requestId) {
        setLoading(false);
      }
    };

    load();
  }, [user, phase]);

  // Toggle bài tập với optimistic update và rollback khi lỗi
  const toggle = useCallback(
    async (exerciseId: string) => {
      const prev = checked;
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
          setChecked(prev); // Rollback
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

// ─── useAllProgress ───────────────────────────────────────────────────────────

const PHASE_SLUGS = ["01_Java", "02_Http-Sql", "03_Spring", "04_Quality", "05_AI", "06_RAG"];

/**
 * Vấn đề 4 — dashboard không cập nhật khi phiên thay đổi:
 *   Theo dõi onAuthStateChange; khi đăng xuất xóa số liệu và chuyển sang
 *   localStorage; khi đăng nhập tải dữ liệu của tài khoản mới.
 *
 * Vấn đề 5 — stale response:
 *   Cùng cơ chế requestId, huỷ kết quả của request cũ khi user thay đổi.
 */
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

    const loadForUser = async (user: User | null) => {
      const requestId = ++activeRequestId.current;
      if (mounted) setLoading(true);

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
        // Khách — đọc localStorage
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

    // Tải lần đầu
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) loadForUser(data.session?.user ?? null);
    });

    // Cập nhật khi phiên thay đổi (đăng nhập/xuất/chuyển tài khoản)
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) loadForUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { byPhase, totalDone, loading };
}
