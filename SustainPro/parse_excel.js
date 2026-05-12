const xlsx = require('xlsx');
const fs = require('fs');

function parse(filename) {
  const wb = xlsx.readFile(filename);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, {header: 1});
  console.log(`\n\n--- ${filename} ---`);
  json.slice(0, 15).forEach(row => {
    console.log(row.map(cell => cell !== undefined ? String(cell).substring(0, 30) : '').join(' | '));
  });
}

parse('Sample GRI.xlsx');
parse('Sample ISO.xlsx');
