"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/JavaBackend_AI_RoadMap/auth/callback`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div
        style={{
          width: 80,
          height: 32,
          borderRadius: 8,
          background: "var(--muted)",
          animation: "pulse 1.5s infinite",
        }}
      />
    );
  }

  if (user) {
    const avatar = user.user_metadata?.avatar_url;
    const username = user.user_metadata?.user_name || user.email;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {avatar && (
          <img
            src={avatar}
            alt={username}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--accent)" }}
          />
        )}
        <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
          {username}
        </span>
        <button
          onClick={logout}
          style={{
            fontSize: "0.8rem",
            padding: "0.3rem 0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "none",
            color: "var(--muted-foreground)",
            cursor: "pointer",
          }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0.4rem 1rem",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--accent)",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.85rem",
        cursor: "pointer",
      }}
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      Đăng nhập GitHub
    </button>
  );
}
