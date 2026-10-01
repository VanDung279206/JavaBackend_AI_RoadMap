"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function homePath() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/JavaBackend_AI_RoadMap").replace(/\/$/, "");
  return `${basePath}/`;
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Đang xác nhận email…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const providerError = params.get("error_description") || params.get("error");

    if (providerError) {
      const frame = window.requestAnimationFrame(() => {
        if (active) setError("Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi email xác nhận mới.");
      });
      return () => {
        active = false;
        window.cancelAnimationFrame(frame);
      };
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError || !data.session) {
        setError("Không nhận được phiên đăng nhập. Hãy mở liên kết xác nhận trong email trên trình duyệt này và kiểm tra URL Configuration trong Supabase.");
        return;
      }
      setMessage("Đăng nhập thành công. Đang quay lại trang học…");
      window.location.replace(homePath());
    });

    return () => { active = false; };
  }, []);

  return (
    <section className="auth-callback-shell" aria-live="polite">
      {error ? (
        <div className="auth-callback-card">
          <span className="eyebrow">ĐĂNG NHẬP</span>
          <h1>Chưa thể đăng nhập</h1>
          <p>{error}</p>
          <Link className="button-primary" href="/">Về trang chủ</Link>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </section>
  );
}

