"use client";
import Giscus from "@giscus/react";

export default function GiscusComments({ phase }: { phase: string }) {
  return (
    <div style={{ marginTop: "3rem" }}>
      <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        💬 Hỏi đáp & Thảo luận
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Đặt câu hỏi, chia sẻ cách giải, giúp đỡ người khác. Đăng nhập bằng GitHub để bình luận.
      </p>
      <Giscus
        repo="VanDung279206/JavaBackend_AI_RoadMap"
        repoId="R_kgDOxxxxxxxx"
        category="Q&A"
        categoryId="DIC_kwDOxxxxxxxx"
        mapping="specific"
        term={`Phase ${phase} - Bài tập`}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark"
        lang="vi"
        loading="lazy"
      />
    </div>
  );
}
