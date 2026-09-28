"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const BASE = "/JavaBackend_AI_RoadMap";

const pages = [
  { label: "Trang chủ", href: `${BASE}/` },
  { label: "Roadmap", href: `${BASE}/roadmap` },
  { label: "Bài tập Phase 1 — Java", href: `${BASE}/docs/01_Java` },
  { label: "Bài tập Phase 2 — HTTP & SQL", href: `${BASE}/docs/02_Http-Sql` },
  { label: "Bài tập Phase 3 — Spring Boot", href: `${BASE}/docs/03_Spring` },
  { label: "Bài tập Phase 4 — Testing", href: `${BASE}/docs/04_Quality` },
  { label: "Bài tập Phase 5 — AI", href: `${BASE}/docs/05_AI` },
  { label: "Bài tập Phase 6 — RAG", href: `${BASE}/docs/06_RAG` },
  { label: "Bảng xếp hạng", href: `${BASE}/leaderboard` },
];

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Ctrl+K mở command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = query.trim()
    ? pages.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : pages;

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "20vh",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "min(520px, 90vw)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>🔍</span>
          <input
            autoFocus
            placeholder="Tìm kiếm phase, bài tập..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--foreground)",
              fontSize: "1rem",
            }}
          />
          <kbd
            style={{
              fontSize: "0.7rem",
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
              background: "var(--muted)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "0.5rem" }}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              Không tìm thấy kết quả
            </div>
          ) : (
            results.map((p) => (
              <button
                key={p.href}
                onClick={() => go(p.href)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.65rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  background: "none",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--muted)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                {p.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}