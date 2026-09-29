import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Java Backend + AI Roadmap",
  description: "Lộ trình Java Backend gồm bài tập, hướng dẫn từng chặng, trình chạy mã và dự án mẫu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Navbar />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="footer-inner layout-container">
            <span>Java Backend · Lộ trình và bài thực hành.</span>
            <div className="footer-links">
              <Link href="/roadmap">Lộ trình</Link>
              <Link href="/docs">Bài tập</Link>
              <Link href="/materials">Tài liệu</Link>
              <Link href="/projects">Dự án</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

