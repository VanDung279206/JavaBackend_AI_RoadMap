"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function homePath() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/JavaBackend_AI_RoadMap").replace(/\/$/, "");
  return `${basePath}/`;
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Đang xác nhận tài khoản GitHub…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const providerError = params.get("error_description") || params.get("error");

    if (providerError) {
      const frame = window.requestAnimationFrame(() => {
        if (active) setError("GitHub chưa hoàn tất đăng nhập. Hãy thử lại; nếu lỗi lặp lại, kiểm tra URL chuyển hướng trong Supabase.");
      });
      return () => {
        active = false;
        window.cancelAnimationFrame(frame);
      };
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError || !data.session) {
        setError("Không nhận được phiên đăng nhập. Kiểm tra Supabase Auth → URL Configuration: Site URL và Redirect URLs phải có https://vandung279206.github.io/JavaBackend_AI_RoadMap/auth/callback.");
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

