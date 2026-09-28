import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import LearningDashboard from "@/components/sections/LearningDashboard";
import InteractiveRoadmap from "@/components/sections/InteractiveRoadmap";
import ProjectShowcase from "@/components/sections/ProjectShowcase";

export default function Home() {
  return (
    <>
      <Hero />
      <BentoGrid />
      <LearningDashboard />
      <InteractiveRoadmap />
      <ProjectShowcase />
    </>
  );
}