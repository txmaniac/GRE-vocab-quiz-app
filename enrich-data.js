
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Output file path
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'vocab.json');
const DATA_DIR = path.dirname(OUTPUT_FILE);

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Load External Definitions
// 1a. Load External Definitions (VatsalSaglani)
console.log('Loading definitions (Source 1)...');
global.definitionMap = new Map();

try {
    let definitionsRaw = fs.readFileSync('words_meanings.json', 'utf8');
    definitionsRaw = definitionsRaw.replace(/,(\s*})/g, '$1');
    const definitionsJson = JSON.parse(definitionsRaw);
    definitionsJson.words.forEach(item => {
        if (item.word && item.meaning) {
            global.definitionMap.set(item.word.toLowerCase().trim(), item.meaning.trim());
        }
    });
    console.log(`Loaded ${definitionsJson.words.length} definitions from Source 1.`);
} catch (e) {
    console.error("Error loading Source 1:", e.message);
}

// 1b. Load External Definitions (Magoosh)
console.log('Loading definitions (Source 2 - Magoosh)...');
try {
    const magooshRaw = fs.readFileSync('magoosh_dict.json', 'utf8');
    const magooshJson = JSON.parse(magooshRaw);

    let addedCount = 0;
    Object.keys(magooshJson).forEach(key => {
        const html = magooshJson[key];
        // Regex to extract definition
        // Look for <div class="flashcard-text"><p><strong>...:</strong> definition</p>
        // Adjust regex to be flexible
        const match = html.match(/class="flashcard-text"><p><strong>.*?:<\/strong>\s*(.*?)<\/p>/);
        if (match && match[1]) {
            const definition = match[1].trim();
            const word = key.toLowerCase().trim();
            // Magoosh likely has better definitions, overwrite or set if missing
            global.definitionMap.set(word, definition);
            addedCount++;
        }
    });
    console.log(`Loaded ${addedCount} definitions from Source 2.`);
    console.log(`Total unique definitions: ${global.definitionMap.size}`);

} catch (e) {
    console.error("Error loading Source 2:", e.message);
}

// 2. Parse Excel File for Groups
console.log('Parsing Excel file...');
const workbook = XLSX.readFile('vocab-data.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Assuming first sheet
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Map column index to Group Name. 
// Note: Groups might be in different rows. We need to scan for headers.
const columnGroupsMap = new Map(); // row -> { colIndex -> GroupName }

// Scan first 100 rows for "Group" headers (heuristic)
for (let r = 0; r < Math.min(data.length, 200); r++) {
    const row = data[r];
    if (!row) continue;
    row.forEach((cell, colIndex) => {
        if (cell && typeof cell === 'string' && cell.startsWith('Group')) {
            if (!columnGroupsMap.has(r)) {
                columnGroupsMap.set(r, {});
            }
            columnGroupsMap.get(r)[colIndex] = cell;
        }
    });
}
// Sort header rows
const headerRows = Array.from(columnGroupsMap.keys()).map(Number).sort((a, b) => a - b);
console.log('Header Rows:', headerRows);

const vocabList = [];
let missingDefinitions = 0;
const missingExamples = [];

for (let i = 0; i < headerRows.length; i++) {
    const headerRowIdx = headerRows[i];
    // Next header row or end of data. 
    // We assume data doesn't flow into next header.
    const nextHeaderRowIdx = headerRows[i + 1] || data.length;

    // Data starts 2 rows after the header row (found via experimentation)
    const startRow = headerRowIdx + 2;
    // End row is the row before the next header.
    const endRow = nextHeaderRowIdx;

    // Get groups for this block
    const currentGroupMap = columnGroupsMap.get(headerRowIdx); // { colIndex: 'Group X' }

    // console.log(`Processing block: Header ${headerRowIdx}, Rows ${startRow}-${endRow}`);

    for (let r = startRow; r < endRow; r++) {
        const row = data[r];
        if (!row) continue;
        if (row.length === 0) continue;

        Object.keys(currentGroupMap).forEach(colIndexStr => {
            const colIndex = parseInt(colIndexStr);
            const groupName = currentGroupMap[colIndex];
            const word = row[colIndex];

            // Skip if word is empty or looks like header/metadata (e.g. "Take Test 1")
            if (word && typeof word === 'string' && word.trim().length > 0) {
                const cleanWord = word.trim();
                // Heuristic: If word contains "Take Test", skip it
                if (cleanWord.includes('Take Test')) return;

                const lowerWord = cleanWord.toLowerCase();
                let definition = global.definitionMap.get(lowerWord);

                if (!definition) {
                    missingDefinitions++;
                    definition = "Definition not found.";
                    if (missingExamples.length < 20) missingExamples.push(`${cleanWord} ('${lowerWord}') [${groupName}]`);
                }

                vocabList.push({
                    id: `${groupName}-${cleanWord}`,
                    word: cleanWord,
                    definition: definition,
                    group: groupName
                });
            }
        });
    }
}

console.log(`Processed ${vocabList.length} words.`);
console.log(`Missing definitions: ${missingDefinitions}`);
console.log(`Processed ${vocabList.length} words.`);
console.log(`Initial missing definitions: ${missingDefinitions}`);

// 4. Fetch missing definitions from API
// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

async function enrichMissingWords() {
    console.log('Fetching missing definitions from free dictionary API...');
    let fetchedCount = 0;
    const missingItems = vocabList.filter(item => item.definition === "Definition not found.");

    // Process in chunks to be polite
    const CHUNK_SIZE = 5;
    for (let i = 0; i < missingItems.length; i += CHUNK_SIZE) {
        const chunk = missingItems.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (item) => {
            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${item.word}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data[0] && data[0].meanings && data[0].meanings[0] && data[0].meanings[0].definitions && data[0].meanings[0].definitions[0]) {
                        item.definition = data[0].meanings[0].definitions[0].definition;
                        fetchedCount++;
                        process.stdout.write('.');
                    }
                }
            } catch (err) {
                // Ignore errors
            }
        }));
        // Small delay
        await new Promise(r => setTimeout(r, 200));
    }
    console.log(`\nFetched ${fetchedCount} new definitions from DictionaryAPI.`);

    // 5. Fetch remaining from Datamuse
    const remainingMissing = vocabList.filter(item => item.definition === "Definition not found.");
    console.log(`Remaining missing: ${remainingMissing.length}. Fetching from Datamuse...`);

    let datamuseFetched = 0;
    // Process in chunks
    for (let i = 0; i < remainingMissing.length; i += CHUNK_SIZE) {
        const chunk = remainingMissing.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (item) => {
            try {
                const res = await fetch(`https://api.datamuse.com/words?sp=${item.word}&md=d&max=1`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0 && data[0].defs && data[0].defs.length > 0) {
                        // Def format: "n\tDefinition text"
                        let def = data[0].defs[0];
                        // Remove part of speech prefix (e.g., "n\t", "adj\t")
                        const tabIndex = def.indexOf('\t');
                        if (tabIndex !== -1) {
                            def = def.substring(tabIndex + 1);
                        }
                        item.definition = def;
                        datamuseFetched++;
                        process.stdout.write('+');
                    }
                }
            } catch (err) {
                // Ignore
            }
        }));
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\nFetched ${datamuseFetched} new definitions from Datamuse.`);
    console.log(`Final missing: ${vocabList.filter(i => i.definition === "Definition not found.").length}`);

    // 3. Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(vocabList, null, 2));
    console.log(`Written enriched data to ${OUTPUT_FILE}`);
}

enrichMissingWords();

