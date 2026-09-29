import RoadmapTimeline from "@/components/RoadmapTimeline";

export default function RoadmapPage() {
  return (
    <>
      <header className="page-shell page-heading">
        <span className="eyebrow">JAVA → BACKEND → AI</span>
        <h1 className="page-title">Lộ trình học</h1>
        <p className="page-description">
          Bảy chặng từ cài đặt môi trường đến hệ thống RAG. Chuyển chặng khi bạn hoàn thành bài tập và hiểu sản phẩm mình vừa xây.
        </p>
      </header>
      <RoadmapTimeline />
    </>
  );
}
