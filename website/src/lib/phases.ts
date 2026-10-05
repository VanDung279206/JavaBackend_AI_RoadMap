import catalogue from "@/generated/catalogue.json";
export type Exercise = { id: string; label: string };
export type PhaseConfig = { slug: string; number: string; title: string; icon: string; color: string; domain: "java" | "database" | "spring" | "ai"; exercises: Exercise[] };
export const PHASES: PhaseConfig[] = catalogue.phases.map(p => ({...p, domain:p.domain as PhaseConfig["domain"], exercises: catalogue.exercises.filter(e => e.phase === p.slug).map(e => ({id:e.id,label:e.id+" — "+e.title}))}));
export const PHASE_BY_SLUG = Object.fromEntries(PHASES.map(p => [p.slug,p]));
export const totalExercises = (slug: string) => PHASE_BY_SLUG[slug]?.exercises.length ?? 0;
