"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import AdminResourceQueue from "@/components/admin/AdminResourceQueue";

type LearnerRow = {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  completed_count: number;
  last_active: string | null;
  updated_at: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const requestId = useRef(0);
  const authEventVersion = useRef(0);
  const authUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      authEventVersion.current += 1;
      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;
      const identityChanged = authUserId.current !== nextUserId;
      authUserId.current = nextUserId;

      if (event === "SIGNED_OUT" || event === "SIGNED_IN" || identityChanged) {
        // Hide the previous account's dashboard before starting another request.
        requestId.current += 1;
        setIsAdmin(false);
        setLearners([]);
        setLoading(Boolean(nextUser));
      }

      setUser((current) =>
        event === "SIGNED_IN" || current?.id !== nextUser?.id ? nextUser : current
      );
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted || authEventVersion.current !== 0) return;
      const initialUser = data.session?.user ?? null;
      authUserId.current = initialUser?.id ?? null;
      setIsAdmin(false);
      setLearners([]);
      setLoading(Boolean(initialUser));
      setUser(initialUser);
    });

    return () => {
      mounted = false;
      requestId.current += 1;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    let cancelled = false;
    const isCurrentRequest = () =>
      !cancelled && requestId.current === currentRequestId;

    if (!user) return () => { cancelled = true; };

    const loadDashboard = async () => {
      // Verify authorization from the database, never from editable user metadata.
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!isCurrentRequest()) return;
      if (error || !profile?.is_admin) {
        setLoading(false);
        return;
      }

      const { data: rows, error: leaderboardError } = await supabase
        .from("leaderboard")
        .select("*")
        .order("completed_count", { ascending: false })
        .order("updated_at", { ascending: false });

      if (!isCurrentRequest()) return;
      setIsAdmin(true);
      setLearners(
        leaderboardError ? [] : (rows as LearnerRow[] | null) ?? []
      );
      setLoading(false);
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Đang kiểm tra quyền...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Cần đăng nhập</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Đăng nhập bằng email để tiếp tục.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⛔</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không có quyền</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          Trang này chỉ dành cho quản trị viên.<br />
          Quyền được kiểm soát qua database, không phải tên người dùng.
        </p>
        <Link href="/" style={{ color: "var(--accent)", marginTop: "1rem", display: "inline-block" }}>
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell admin-shell">
      <span className="eyebrow">QUẢN TRỊ</span>
      <h1 className="page-title" style={{ fontSize: "2.3rem", marginTop: "0.6rem" }}>Bảng điều khiển</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
        Tổng cộng <strong style={{ color: "var(--foreground)" }}>{learners.length}</strong> người học đã đăng ký.
      </p>

      <div className="admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["#", "Người học", "Bài hoàn thành", "Hoạt động gần nhất"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.75rem 1rem", textAlign: "left",
                    fontSize: "0.8rem", fontWeight: 600,
                    color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {learners.map((l, idx) => (
              <tr key={l.user_id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {l.avatar_url && (
                      <Image
                        src={l.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {l.display_name || l.username}
                      </div>
                      {l.username && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                          @{l.username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: "1rem" }}>
                    {l.completed_count}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {l.last_active
                    ? new Date(l.last_active).toLocaleDateString("vi-VN")
                    : "Chưa có"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminResourceQueue reviewerId={user.id} />
    </div>
  );
}

