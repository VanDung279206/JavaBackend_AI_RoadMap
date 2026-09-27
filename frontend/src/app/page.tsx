import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Roadmap from "@/components/Roadmap";
import Projects from "@/components/Projects";

export default function Home(){
 return (
  <main>
   <Hero/>
   <Dashboard/>
   <Roadmap/>
   <Projects/>
  </main>
 )
}