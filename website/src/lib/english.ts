import generated from '@/generated/english.json';
import { parseEnglish, type EnglishCatalogue } from './english-core';
export const english = generated as unknown as EnglishCatalogue;
export const parseEnglishBackup = (value: unknown) => parseEnglish(value, english);
const relatedPhases: Record<string, string> = { foundations: '01_Java', debug: '01_Java', mixed: 'dsa', concurrency: '01_Java', variants: 'dsa', advanced: '06_RAG' };
export const englishPhaseFor = (phase: string) => english.units.some(u => u.phase === phase) || phase === 'all' ? phase : (relatedPhases[phase] ?? '01_Java');
export const englishLink = (phase: string, section = 'vocabulary') => `/english#${encodeURIComponent(englishPhaseFor(phase))}/${section}`;
