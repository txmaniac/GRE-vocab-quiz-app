'use client';

import { QuizResult } from './QuizGame';
import Link from 'next/link';
import { Check, X, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface RetrospectiveProps {
    results: QuizResult[];
    score: number;
    total: number;
    onRestart: () => void;
}

export default function Retrospective({ results, score, total, onRestart }: RetrospectiveProps) {
    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                <div className="text-6xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent my-4">
                    {score}%
                </div>
                <p className="text-neutral-400">
                    You got {results.filter(r => r.correct).length} out of {total} words correct.
                </p>
            </div>

            <div className="grid gap-4 mb-12">
                {results.map((result, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-6 rounded-2xl border ${result.correct ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    {result.word.word}
                                    {result.correct ? <Check size={18} className="text-emerald-500" /> : <X size={18} className="text-red-500" />}
                                </h3>
                                <p className="text-neutral-400 text-sm mb-2">Definition: <span className="text-neutral-200">{result.word.definition}</span></p>

                                {!result.correct && (
                                    <div className="text-sm mt-2 text-red-300 bg-red-900/20 p-2 rounded inline-block">
                                        You chose: {result.selectedAnswer}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center gap-4 sticky bottom-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-colors"
                >
                    <Home size={20} />
                    Home
                </Link>
                <button
                    onClick={onRestart}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                >
                    <RefreshCw size={20} />
                    Try Again
                </button>
            </div>
        </div>
    );
}
