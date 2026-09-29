"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase, type LeaderboardEntry } from "@/lib/supabase";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("leaderboard")
      .select("*")
      .order("completed_count", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(50)
      .then(({ data: rows }) => {
        setData((rows as LeaderboardEntry[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="page-shell leaderboard-shell">
      <header className="page-heading">
        <span className="eyebrow">CỘNG ĐỒNG HỌC TẬP</span>
        <h1 className="page-title">Bảng xếp hạng</h1>
        <p className="page-description">Ghi nhận những người học đang bền bỉ hoàn thành bài thực hành.</p>
      </header>

      <div className="leaderboard-panel">
        <div className="leaderboard-heading">
          <span>NGƯỜI HỌC</span>
          <span>BÀI ĐÃ HOÀN THÀNH</span>
        </div>

        {loading ? (
          <div className="leaderboard-message" role="status">Đang tải bảng xếp hạng…</div>
        ) : data.length === 0 ? (
          <div className="leaderboard-empty">
            <span className="empty-rank-mark">01</span>
            <h2>Bảng xếp hạng đang chờ bạn</h2>
            <p>Đăng nhập và đánh dấu bài tập đã hoàn thành để xuất hiện tại đây.</p>
          </div>
        ) : (
          <ol className="leaderboard-list">
            {data.map((entry, idx) => (
              <li className={`leaderboard-row${idx < 3 ? " leaderboard-row-top" : ""}`} key={entry.user_id}>
                <span className="leaderboard-rank">{String(idx + 1).padStart(2, "0")}</span>
                {entry.avatar_url ? (
                  <Image
                    className="leaderboard-avatar"
                    src={entry.avatar_url}
                    alt=""
                    width={38}
                    height={38}
                    unoptimized
                  />
                ) : (
                  <span className="leaderboard-avatar leaderboard-avatar-fallback" aria-hidden="true">
                    {(entry.username ?? "?")[0].toUpperCase()}
                  </span>
                )}
                <div className="leaderboard-name">
                  <strong>{entry.display_name || entry.username || "Ẩn danh"}</strong>
                  {entry.username && (
                    <a href={`https://github.com/${entry.username}`} target="_blank" rel="noopener noreferrer">
                      @{entry.username}
                    </a>
                  )}
                </div>
                <div className="leaderboard-score">
                  <strong>{entry.completed_count}</strong>
                  <span>bài</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="leaderboard-note">Tiến độ đồng bộ khi bạn đăng nhập bằng GitHub.</p>
    </section>
  );
}
