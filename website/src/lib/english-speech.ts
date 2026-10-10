export const selectEnglishVoice = <T extends { lang: string }>(voices: T[]) => voices.find(v => /^en[-_]US$/i.test(v.lang)) ?? voices.find(v => /^en([-_]|$)/i.test(v.lang)) ?? null;
export function speechAvailable(engine: { getVoices: () => { lang: string }[] } | null | undefined) {
    return !!engine && !!selectEnglishVoice(engine.getVoices());
}
