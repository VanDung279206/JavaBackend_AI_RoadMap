import RoadmapTimeline from "@/components/RoadmapTimeline";

export default function RoadmapPage() {
  return (
    <>
      <header className="page-shell page-heading">
        <span className="eyebrow">JAVA BACKEND</span>
        <h1 className="page-title">Lộ trình học</h1>
        <p className="page-description">
          Mở từng chặng để xem việc cần làm, lệnh chạy, kết quả cần có và lỗi thường gặp. Nếu mới học, bắt đầu từ Chặng 00.
        </p>
      </header>
      <RoadmapTimeline />
    </>
  );
}
