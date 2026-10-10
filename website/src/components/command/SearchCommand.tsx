"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import catalogue from "@/generated/catalogue.json";
import english from "@/generated/english.json";
const pages = [
  { label: "Hôm nay học gì?", href: "/today" },
  { label: "Bản đồ kiến thức và kiểm tra đầu vào", href: "/skills" },
  { label: "Bàn thử nghiệm RAG và trực quan hóa", href: "/lab" },
  { label: "Trang chủ", href: "/" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Dự án thực tế", href: "/projects" },
  { label: "Dự án của tôi — tạo và chỉnh đề cương", href: "/projects/mine" },
  { label: "Danh sách bài tập", href: "/docs" },
  { label: "Tiếng Anh cho lập trình viên", href: "/english" },
  { label: "Bài tập Phase 1 — Java", href: "/docs/01_Java" },
  { label: "Bài tập Phase 2 — HTTP & SQL", href: "/docs/02_Http-Sql" },
  { label: "Bài tập Phase 3 — Spring Boot", href: "/docs/03_Spring" },
  { label: "Bài tập Phase 4 — Testing", href: "/docs/04_Quality" },
  { label: "Bài tập Phase 5 — AI", href: "/docs/05_AI" },
  { label: "Bài tập Phase 6 — RAG", href: "/docs/06_RAG" },
  { label: "Bảng xếp hạng", href: "/leaderboard" },
];

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  const searchable = [...pages.map(p=>({...p, text:p.label})), ...english.units.map(u=>({label:`Tiếng Anh — ${u.title}`,href:`/english#${u.phase}/overview`,text:[u.title,u.objective,'tiếng anh english'].join(' ')})), ...english.terms.map(t=>({label:`Tiếng Anh: ${t.term} — ${t.meaning}`,href:`/english#${t.phase}/vocabulary/${t.id}`,text:[t.term,t.meaning,t.example,t.phase,'tiếng anh english'].join(' ')})), ...english.errors.map(e=>({label:`Tiếng Anh qua lỗi ${e.id}`,href:`/english#${e.phase}/errors`,text:[e.id,e.output,e.meaning,'tiếng anh english lỗi'].join(' ')})), ...catalogue.lessons.map(l=>({label:`Bài học ${l.id} — ${l.title}`,href:`/learn/${l.phase}#${l.id}`,text:[l.id,l.title,l.objective,...l.tags].join(' ')})), ...catalogue.exercises.map(e=>({label:`${e.id} — ${e.title}`,href:`/docs/${e.phase}#${e.id}`,text:[e.id,e.title,e.markdown,e.phase,...e.tags,...e.tags.map(tag=>catalogue.tags[tag as keyof typeof catalogue.tags]||tag)].join(" ")}))];
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g,"d").toLowerCase();
  const results = query.trim()
    ? searchable.filter(p => normalize(p.text).includes(normalize(query))).slice(0,60)
    : searchable.slice(0,20);

  const go = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    if (href.startsWith('/english#') && window.location.pathname.replace(/\/$/, '').endsWith('/english')) {
      // Next's same-page pushState does not emit hashchange. Native hash navigation
      // also makes back/forward restore the selected English lesson.
      const hash = href.slice(href.indexOf('#'));
      if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
      else window.location.hash = hash;
    } else router.push(href);
  }, [router]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", zIndex: 200,
        display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20vh",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 16, width: "min(520px, 90vw)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>🔍</span>
          <input
            autoFocus
            placeholder="Tìm chặng, bài tập, từ tiếng Anh…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--foreground)", fontSize: "1rem" }}
          />
          <kbd style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem", borderRadius: 4, border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "var(--muted)" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "0.5rem" }}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              Không tìm thấy kết quả
            </div>
          ) : (
            results.map((p) => (
              <button
                key={`${p.href}:${p.label}`}
                onClick={() => go(p.href)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "0.65rem 1rem", borderRadius: 8, border: "none",
                  background: "none", color: "var(--foreground)", cursor: "pointer", fontSize: "0.9rem",
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
