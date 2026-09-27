"use client";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

const links = [
  { href: "/JavaBackend_AI_RoadMap/", label: "Trang chủ" },
  { href: "/JavaBackend_AI_RoadMap/roadmap", label: "Roadmap" },
  { href: "/JavaBackend_AI_RoadMap/docs", label: "Bài tập" },
  { href: "/JavaBackend_AI_RoadMap/leaderboard", label: "🏆 Xếp hạng" },
];

export default function Navbar() {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          href="/JavaBackend_AI_RoadMap/"
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--foreground)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--accent)" }}>☕</span>
          <span>Java + AI</span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flex: 1 }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: "var(--muted-foreground)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <AuthButton />
      </div>
    </nav>
  );
}