import vocabData from '@/data/vocab.json';

export type VocabItem = {
    id: string;
    word: string;
    definition: string;
    group: string;
};

// Filter out items with missing definitions
const validVocabData = (vocabData as VocabItem[]).filter(
    (item) => item.definition && item.definition !== "Definition not found."
);

export const getGroups = () => {
    const groups = new Set(validVocabData.map((item) => item.group));
    // Sort groups numerically: Group 1, Group 2...
    return Array.from(groups).sort((a, b) => {
        const numA = parseInt(a.replace('Group ', ''));
        const numB = parseInt(b.replace('Group ', ''));
        return numA - numB;
    });
};

export const getWordsByGroup = (group: string) => {
    return validVocabData.filter((item) => item.group === group);
};

export const getAllWords = () => {
    return validVocabData;
};

export const getRandomWords = (count: number) => {
    const shuffled = [...validVocabData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
