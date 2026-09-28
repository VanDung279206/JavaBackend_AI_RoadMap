import RoadmapTimeline from "@/components/RoadmapTimeline";

export default function RoadmapPage() {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "3rem 1.5rem 0" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: "0.75rem",
          }}
        >
          🗺️ Roadmap
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "1.1rem" }}>
          Chuyển chặng khi đáp ứng tiêu chí hoàn thành — không theo lịch cứng.
        </p>
      </div>
      <RoadmapTimeline />
    </div>
  );
}