'use client';

import { useParams, useRouter } from 'next/navigation';
import { getWordsByGroup } from '@/lib/data';
import QuizGame, { QuizResult } from '@/components/QuizGame';
import { useScores } from '@/hooks/useScores';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GroupQuizPage() {
    const params = useParams();
    // Decode group ID from URL
    const groupId = decodeURIComponent(params.groupId as string);
    const router = useRouter();
    const { saveScore } = useScores();
    const [words, setWords] = useState<any[]>([]);

    useEffect(() => {
        if (groupId) {
            setWords(getWordsByGroup(groupId));
        }
    }, [groupId]);

    const handleComplete = (score: number, results: QuizResult[]) => {
        saveScore(groupId, score);
        // Retrospective handled inside QuizGame or we can redirect?
        // Current design: QuizGame shows Retrospective internally.
        // Saving score is side effect.
    };

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <p>Loading Quiz...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 p-8 font-sans text-neutral-100 flex flex-col">
            <Link href="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="mr-2" size={20} />
                Back to Dashboard
            </Link>

            <div className="flex-1 flex items-center justify-center">
                <QuizGame
                    words={words}
                    groupId={groupId}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
