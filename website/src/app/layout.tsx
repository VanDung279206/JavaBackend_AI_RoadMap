import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Java Backend + AI Roadmap",
  description: "Lộ trình học Java Backend và AI từ nền tảng đến RAG — bài tập, lời giải và dự án thực tế.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}