const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('vocab-data.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Sheet 1 Analysis ---');
// Check row 4 (start of words) for Group 1 (Col 0, 1) and Group 2 (Col 2, 3)
const row4 = data[3];
console.log('Row 4 raw:', row4);
console.log('Row 4 Col 0 (Word):', row4[0]);
console.log('Row 4 Col 1 (Def?):', row4[1]);
console.log('Row 4 Col 2 (Word):', row4[2]);

console.log('--- Sheet 2 Analysis ---');
const sheet2Name = workbook.SheetNames[1];
const sheet2 = workbook.Sheets[sheet2Name];
const data2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });
console.log('Sheet 2 First 5 rows:', data2.slice(0, 5));

