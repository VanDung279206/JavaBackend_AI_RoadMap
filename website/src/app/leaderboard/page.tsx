"use client";
import { useEffect, useState } from "react";
import { supabase, type LeaderboardEntry } from "@/lib/supabase";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("leaderboard")
      .select("*")
      .limit(50)
      .then(({ data: rows }) => {
        setData((rows as LeaderboardEntry[]) ?? []);
        setLoading(false);
      });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          🏆 Bảng Xếp Hạng
        </h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          Những người học chăm chỉ nhất — cập nhật theo thời gian thực.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
          Đang tải...
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            color: "var(--muted-foreground)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
          <p>Chưa có ai đăng nhập và bắt đầu học.</p>
          <p style={{ marginTop: 8, fontSize: "0.875rem" }}>Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.map((entry, idx) => (
            <div
              key={entry.github_username ?? idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "1rem 1.5rem",
                background: idx < 3 ? "var(--card)" : "var(--muted)",
                border: `1px solid ${idx === 0 ? "#f59e0b44" : idx === 1 ? "#94a3b844" : idx === 2 ? "#cd7c3044" : "var(--border)"}`,
                borderRadius: 12,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 40,
                  textAlign: "center",
                  fontSize: idx < 3 ? "1.5rem" : "1rem",
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  flexShrink: 0,
                }}
              >
                {idx < 3 ? medals[idx] : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.github_username ?? ""}
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%", flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(entry.github_username ?? "?")[0].toUpperCase()}
                </div>
              )}

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {entry.display_name || entry.github_username || "Ẩn danh"}
                </div>
                {entry.github_username && (
                  <a
                    href={`https://github.com/${entry.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textDecoration: "none" }}
                  >
                    @{entry.github_username}
                  </a>
                )}
              </div>

              {/* Score */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>
                  {entry.completed}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>bài xong</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
