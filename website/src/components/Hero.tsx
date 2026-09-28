"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--muted-foreground)] mb-8">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        Lộ trình cập nhật — Tháng 9/2026
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
        Java Backend{" "}
        <span className="bg-[linear-gradient(135deg,#6366f1,#a855f7,#ec4899)] bg-clip-text text-transparent">
          + AI
        </span>
        <br />
        Roadmap
      </h1>

      {/* Subheading */}
      <p className="text-xl text-[var(--muted-foreground)] max-w-xl mx-auto mb-12 leading-relaxed">
        Học Java Backend và tích hợp AI từ nền tảng đến sản phẩm thực tế.
        Bài tập có lời giải, dự án xuyên suốt, forum hỏi đáp.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--accent)] font-semibold text-base text-white no-underline transition-opacity hover:opacity-85"
        >
          🗺️ Xem Roadmap
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] font-semibold text-base no-underline transition-colors hover:border-[var(--accent)]"
        >
          📚 Bài tập &amp; Lời giải
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-12 flex-wrap mt-16 p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {[
          { value: "6", label: "Phase học" },
          { value: "24+", label: "Bài tập" },
          { value: "12", label: "Bài DSA" },
          { value: "2", label: "Dự án thực tế" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-extrabold text-[var(--accent)]">{s.value}</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
