"use client";
import { useState } from 'react';
import { emptyTerm, englishReviewState, type EnglishProgress, type EnglishTerm } from '@/lib/english-core';
import type { EnglishSave } from './EnglishPractice';
import EnglishReview from './EnglishReview';

export default function EnglishReviewQueue({ terms, page, mode, progress, save, disabled }: { terms: EnglishTerm[]; page: number; mode: 'due' | 'all'; progress: EnglishProgress; save: EnglishSave; disabled: boolean }) {
    const [session, setSession] = useState({ epoch: 0, ratings: {} as Record<string, { state: string; answer: string }> });
    return <>
        <div className="learning-grid">{terms.slice(page * 8, page * 8 + 8).map(term => {
            const state = englishReviewState(progress.terms[term.id] ?? emptyTerm());
            const rating = session.ratings[term.id], rated = rating?.state === state;
            // Keep ratings across pagination. A restored/changed schedule remounts
            // a previously rated card so its old answer and lock cannot survive.
            return <EnglishReview key={`${session.epoch}:${term.id}:${rated}`} term={term} progress={progress} save={save} disabled={disabled} ratedInSession={mode === 'all' && rated} sessionAnswer={mode === 'all' && rated ? rating.answer : ''} onRated={(savedState, answer) => setSession(current => current.epoch === session.epoch ? { ...current, ratings: { ...current.ratings, [term.id]: { state: savedState, answer } } } : current)} />;
        })}</div>
        {mode === 'all' && <div className="learning-actions"><button type="button" disabled={disabled} onClick={() => setSession(current => ({ epoch: current.epoch + 1, ratings: {} }))}>Bắt đầu lượt luyện mới</button></div>}
    </>;
}
