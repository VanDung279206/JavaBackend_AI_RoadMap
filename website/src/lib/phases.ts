/**
 * Nguồn dữ liệu duy nhất cho toàn bộ website.
 * Nhãn bài tập lấy trực tiếp từ tiêu đề trong EXERCISES.md.
 */

export type Exercise = {
  id: string;
  label: string;
};

export type PhaseConfig = {
  slug: string;
  number: string;
  title: string;
  icon: string;
  color: string;
  domain: "java" | "database" | "spring" | "ai";
  exercises: Exercise[];
};

export const PHASES: PhaseConfig[] = [
  {
    slug: "01_Java",
    number: "1",
    title: "Java Nền tảng",
    icon: "☕",
    color: "#f59e0b",
    domain: "java",
    exercises: [
      { id: "P1.1", label: "P1.1 — Chuẩn hóa tiêu đề" },
      { id: "P1.2", label: "P1.2 — Danh mục tài liệu" },
      { id: "P1.3", label: "P1.3 — Đếm từ theo hợp đồng rõ ràng" },
      { id: "P1.4", label: "P1.4 — Tìm và sắp xếp" },
    ],
  },
  {
    slug: "02_Http-Sql",
    number: "2",
    title: "HTTP & SQL",
    icon: "🗄️",
    color: "#3b82f6",
    domain: "database",
    exercises: [
      { id: "P2.1", label: "P2.1 — Hợp đồng API" },
      { id: "P2.2", label: "P2.2 — Schema và đếm tài liệu" },
      { id: "P2.3", label: "P2.3 — Phân trang và index" },
      { id: "P2.4", label: "P2.4 — Transaction" },
    ],
  },
  {
    slug: "03_Spring",
    number: "3",
    title: "Spring Boot & REST API",
    icon: "🍃",
    color: "#22c55e",
    domain: "spring",
    exercises: [
      { id: "P3.1", label: "P3.1 — DTO và validation" },
      { id: "P3.2", label: "P3.2 — Repository có phạm vi người dùng" },
      { id: "P3.3", label: "P3.3 — Phân trang và lỗi rõ ràng" },
      { id: "P3.4", label: "P3.4 — Giao dịch nghiệp vụ" },
    ],
  },
  {
    slug: "04_Quality",
    number: "4",
    title: "Kiểm thử & Triển khai",
    icon: "🧪",
    color: "#8b5cf6",
    domain: "spring",
    exercises: [
      { id: "P4.1", label: "P4.1 — Hai người dùng" },
      { id: "P4.2", label: "P4.2 — Kiểm thử bắt được lỗi" },
      { id: "P4.3", label: "P4.3 — Đóng gói và cấu hình" },
      { id: "P4.4", label: "P4.4 — Quy trình CI có tiêu chí" },
    ],
  },
  {
    slug: "05_AI",
    number: "5",
    title: "Tích hợp AI",
    icon: "🤖",
    color: "#ec4899",
    domain: "ai",
    exercises: [
      { id: "P5.1", label: "P5.1 — Tách chỉ dẫn và dữ liệu" },
      { id: "P5.2", label: "P5.2 — Ngân sách context" },
      { id: "P5.3", label: "P5.3 — Kiểm tra đầu ra có cấu trúc" },
      { id: "P5.4", label: "P5.4 — Lỗi tạm thời và retry hữu hạn" },
    ],
  },
  {
    slug: "06_RAG",
    number: "6",
    title: "RAG & Đánh giá",
    icon: "🔍",
    color: "#06b6d4",
    domain: "ai",
    exercises: [
      { id: "P6.1", label: "P6.1 — Chia đoạn có phần chồng lặp" },
      { id: "P6.2", label: "P6.2 — Lọc quyền trước khi lấy top-k" },
      { id: "P6.3", label: "P6.3 — Kiểm tra nguồn và thiếu dữ liệu" },
      { id: "P6.4", label: "P6.4 — Đo retrieval" },
    ],
  },
];

export const PHASE_BY_SLUG = Object.fromEntries(PHASES.map((p) => [p.slug, p]));

/** Tổng số bài tập của một phase */
export const totalExercises = (slug: string) =>
  PHASE_BY_SLUG[slug]?.exercises.length ?? 0;
