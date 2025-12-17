'use client';

import Link from 'next/link';
import { getGroups, getWordsByGroup } from '@/lib/data';
import { useScores } from '@/hooks/useScores';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const groups = getGroups();
  const { scores, mounted } = useScores();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <header className="max-w-5xl mx-auto mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          GRE Vocab Quiz App
        </h1>
        <p className="text-neutral-400 text-base md:text-lg mb-8 px-4">
          Master high-frequency GRE words with interactive quizzes.
        </p>

        <Link
          href="/quiz/random"
          className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50 w-full sm:w-auto mx-auto max-w-xs sm:max-w-none"
        >
          Start Random 50 Quiz
        </Link>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {groups.map((group, index) => {
          const words = getWordsByGroup(group);
          const wordCount = words.length;
          // Don't show empty groups
          if (wordCount === 0) return null;

          const score = mounted ? scores[group] : undefined;

          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/quiz/${encodeURIComponent(group)}`}>
                <div className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors h-full flex flex-col">
                  {/* Progress Indicator if score exists */}
                  {score !== undefined && (
                    <div className="absolute top-4 right-4">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${score >= 80 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        {score}%
                      </div>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-neutral-200 mb-2 group-hover:text-emerald-400 transition-colors">
                    {group}
                  </h3>
                  <p className="text-neutral-500 text-sm mt-auto">
                    {wordCount} words
                  </p>

                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
