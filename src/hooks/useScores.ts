'use client';

import { useState, useEffect } from 'react';

type Scores = Record<string, number>; // groupId -> score (percentage)

const SCORES_KEY = 'gre-vocab-quiz-scores';

export function useScores() {
    const [scores, setScores] = useState<Scores>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(SCORES_KEY);
        if (saved) {
            try {
                setScores(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse scores', e);
            }
        }
        setMounted(true);
    }, []);

    const saveScore = (groupId: string, score: number) => {
        setScores((prev) => {
            const next = { ...prev, [groupId]: score };
            localStorage.setItem(SCORES_KEY, JSON.stringify(next));
            return next;
        });
    };

    return { scores, saveScore, mounted };
}
