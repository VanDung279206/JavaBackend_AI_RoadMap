"use client";
import Giscus from "@giscus/react";

const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

/**
 * Hiển thị forum Giscus theo phase.
 *
 * Nếu NEXT_PUBLIC_GISCUS_REPO_ID hoặc NEXT_PUBLIC_GISCUS_CATEGORY_ID chưa
 * được cấu hình (vẫn là chuỗi rỗng hoặc chứa 'xxx'), component hiển thị
 * hướng dẫn thay vì render widget lỗi — tránh lỗi âm thầm trong production.
 *
 * Để bật thảo luận thật:
 *   1. Vào https://giscus.app → nhập repo VanDung279206/JavaBackend_AI_RoadMap
 *   2. Copy repoId và categoryId từ đoạn script được sinh ra
 *   3. Thêm vào .env.local (local) và GitHub Secrets (CI/CD):
 *      NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDO...
 *      NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDO...
 *
 * Lưu ý: gửi và tải bình luận chưa được kiểm tra thực tế vì chưa có ID hợp lệ.
 */
export default function GiscusComments({ phase }: { phase: string }) {
  const isConfigured =
    REPO_ID.length > 0 &&
    CATEGORY_ID.length > 0 &&
    !REPO_ID.includes("xxx") &&
    !CATEGORY_ID.includes("xxx");

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">
        💬 Hỏi đáp &amp; Thảo luận
      </h2>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Đặt câu hỏi, chia sẻ cách giải, giúp đỡ người khác. Đăng nhập bằng GitHub để bình luận.
      </p>

      {isConfigured ? (
        <Giscus
          repo="VanDung279206/JavaBackend_AI_RoadMap"
          repoId={REPO_ID}
          category="Q&A"
          categoryId={CATEGORY_ID}
          mapping="specific"
          term={`Phase ${phase} - Bài tập`}
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="light"
          lang="vi"
          loading="lazy"
        />
      ) : (
        <div
          className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]"
        >
          <div className="mb-3 text-2xl">⚙️</div>
          <p className="mb-2 font-semibold text-[var(--foreground)]">
            Thảo luận chưa được cấu hình
          </p>
          <p>
            Để bật forum, thêm{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5">
              NEXT_PUBLIC_GISCUS_REPO_ID
            </code>{" "}
            và{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5">
              NEXT_PUBLIC_GISCUS_CATEGORY_ID
            </code>{" "}
            vào{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5">
              .env.local
            </code>
            .
          </p>
          <a
            href="https://giscus.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[var(--accent)]"
          >
            Lấy ID tại giscus.app →
          </a>
        </div>
      )}
    </div>
  );
}
