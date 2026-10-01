export type PlaygroundLanguage = "java" | "postgresql";

export type PlaygroundSeed = {
  language: PlaygroundLanguage;
  filename: string;
};

const javaExercises = new Set([
  "P0.1",
  "P1.1",
  "P1.2",
  "P1.3",
  "P1.4",
  "P3.3",
  "P4.1",
  "P5.1",
  "P5.2",
  "P5.3",
  "P5.4",
  "P6.1",
  "P6.2",
  "P6.3",
  "P6.4",
]);

const postgresExercises = new Set(["P2.2", "P2.3", "P2.4"]);

export function getPlaygroundSeed(id: string): PlaygroundSeed | null {
  if (javaExercises.has(id)) {
    return { language: "java", filename: "Main.java" };
  }
  if (postgresExercises.has(id)) {
    return { language: "postgresql", filename: "commands.sql" };
  }
  return null;
}
