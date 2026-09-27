"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const ADMIN_GITHUB = process.env.NEXT_PUBLIC_ADMIN_GITHUB ?? "VanDung279206";

type LearnerRow = {
  github_username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  completed: number;
  last_active: string | null;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      const username = u?.user_metadata?.user_name;
      if (username === ADMIN_GITHUB) {
        setIsAdmin(true);
        supabase.from("leaderboard").select("*").then(({ data: rows }) => {
          setLearners((rows as LearnerRow[]) ?? []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

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
        <p style={{ color: "var(--muted-foreground)" }}>Đăng nhập bằng GitHub để tiếp tục.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⛔</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không có quyền</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Trang này chỉ dành cho quản trị viên.</p>
        <Link href="/JavaBackend_AI_RoadMap/" style={{ color: "var(--accent)", marginTop: "1rem", display: "inline-block" }}>
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>⚙️ Admin Dashboard</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
        Tổng cộng <strong style={{ color: "var(--foreground)" }}>{learners.length}</strong> người học đã đăng ký.
      </p>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["#", "Người học", "Bài hoàn thành", "Hoạt động gần nhất"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {learners.map((l, idx) => (
              <tr
                key={l.github_username ?? idx}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {l.avatar_url && (
                      <img src={l.avatar_url} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {l.display_name || l.github_username}
                      </div>
                      {l.github_username && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                          @{l.github_username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--accent)",
                      fontSize: "1rem",
                    }}
                  >
                    {l.completed}
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
    </div>
  );
}
