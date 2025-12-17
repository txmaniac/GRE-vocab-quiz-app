'use client';

import { useState, useEffect } from 'react';
import { VocabItem, getAllWords } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Retrospective from './Retrospective';

import { useRef } from 'react';
import { QuizResult } from '@/types';

interface QuizGameProps {
    words: VocabItem[];
    groupId: string;
    onComplete: (score: number, results: QuizResult[]) => void;
}

export default function QuizGame({ words, groupId, onComplete }: QuizGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showRetrospective, setShowRetrospective] = useState(false);

    // Shuffle options for the current question
    useEffect(() => {
        if (currentIndex >= words.length) {
            finishQuiz();
            return;
        }

        const currentWord = words[currentIndex];
        const allWords = getAllWords();

        // Get 3 random distractors that are NOT the current word
        const distractors = allWords
            .filter(w => w.id !== currentWord.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.definition);

        const allOptions = [...distractors, currentWord.definition]
            .sort(() => 0.5 - Math.random());

        setOptions(allOptions);
        setSelectedOption(null);
        setIsAnswered(false);
    }, [currentIndex, words]);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const currentWord = words[currentIndex];
        const isCorrect = option === currentWord.definition;

        const newResult: QuizResult = {
            word: currentWord,
            correct: isCorrect,
            selectedAnswer: option
        };

        setResults(prev => [...prev, newResult]);
    };

    const handleNext = () => {
        if (currentIndex + 1 < words.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        const finalResults = [...results];
        // If somehow finished early, don't crash, just calc score
        const correctCount = finalResults.filter(r => r.correct).length;
        const score = Math.round((correctCount / words.length) * 100);
        onComplete(score, finalResults);
        setShowRetrospective(true);
    };

    if (showRetrospective) {
        const correctCount = results.filter(r => r.correct).length;
        const score = Math.round((correctCount / words.length) * 100);

        return (
            <Retrospective
                results={results}
                score={score}
                total={words.length}
                onRestart={() => window.location.reload()}
            />
        );
    }

    const currentWord = words[currentIndex];
    if (!currentWord) return <div>Loading...</div>;

    const progress = ((currentIndex) / words.length) * 100;

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Progress Bar */}
            <div className="w-full bg-neutral-800 h-2 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="bg-emerald-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6 md:mb-10">
                    <span className="text-neutral-500 text-xs md:text-sm uppercase tracking-widest font-bold">
                        Word {currentIndex + 1} of {words.length}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-2 break-words">
                        {currentWord.word}
                    </h2>
                </div>

                <div className="space-y-3">
                    {options.map((option, idx) => {
                        let stateStyle = "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750 hover:border-neutral-600";

                        if (isAnswered) {
                            if (option === currentWord.definition) {
                                stateStyle = "bg-emerald-900/40 border-emerald-500 text-emerald-200";
                            } else if (option === selectedOption) {
                                stateStyle = "bg-red-900/40 border-red-500 text-red-200";
                            } else {
                                stateStyle = "opacity-50 bg-neutral-800 border-neutral-800";
                            }
                        }

                        return (
                            <motion.button
                                key={idx}
                                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                onClick={() => handleOptionClick(option)}
                                className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 font-medium text-base md:text-lg relative ${stateStyle}`}
                                disabled={isAnswered}
                            >
                                {option}
                                {isAnswered && option === currentWord.definition && (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                                )}
                                {isAnswered && option === selectedOption && option !== currentWord.definition && (
                                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={24} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 flex justify-end"
                        >
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors"
                            >
                                {currentIndex + 1 === words.length ? 'Finish Quiz' : 'Next Word'}
                                <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
