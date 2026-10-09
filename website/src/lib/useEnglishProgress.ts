"use client";
import { useLearning } from './learning-store';
import { localKey } from './course-core';
import { useLocalDraft } from './useLocalDraft';
import { emptyEnglish } from './english-core';
import { parseEnglishBackup } from './english';
const empty = emptyEnglish();
export function useEnglishProgress() {
    const learning = useLearning();
    const store = useLocalDraft(learning.owner === undefined ? null : localKey('english', learning.owner), empty, parseEnglishBackup);
    return { ...store, owner: learning.owner };
}
