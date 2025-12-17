import { VocabItem } from '@/lib/data';

export type QuizResult = {
    word: VocabItem;
    correct: boolean;
    selectedAnswer: string;
};
