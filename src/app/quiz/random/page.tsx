'use client';

import { getRandomWords } from '@/lib/data';
import QuizGame, { QuizResult } from '@/components/QuizGame';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RandomQuizPage() {
    const [words, setWords] = useState<any[]>([]);

    useEffect(() => {
        // Select 30 random words
        setWords(getRandomWords(30));
    }, []);

    const handleComplete = (score: number, results: QuizResult[]) => {
        // For random quiz, we might not save score to a specific group, 
        // or we could save to a 'random' key if desired.
        // For now, just let user see retrospective.
    };

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <p>Generating Random Quiz...</p>
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
                    groupId="random"
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
