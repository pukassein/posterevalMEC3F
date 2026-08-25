import fs from 'fs';
let code = fs.readFileSync('src/components/EvaluationForm.tsx', 'utf8');

code = code.replace(
  "criteria.forEach(c => initialScores[c.id] = 0);",
  "criteria.forEach(c => initialScores[c.id] = -1);"
);

code = code.replace(
  "const isFormValid = criteria.every(c => scores[c.id] > 0);",
  "const isFormValid = criteria.every(c => scores[c.id] !== undefined && scores[c.id] !== -1);"
);

code = code.replace(
  "{scores[id] > 0 ? `${scores[id]} / 5` : 'Obrigatório'}",
  "{scores[id] !== undefined && scores[id] !== -1 ? `${scores[id]} / 10` : 'Obrigatório'}"
);

code = code.replace(
  '<div className="flex justify-between space-x-2">',
  '<div className="grid grid-cols-6 sm:grid-cols-11 gap-1 sm:gap-2">'
);

code = code.replace(
  '{[1, 2, 3, 4, 5].map(score => {',
  '{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {'
);

code = code.replace(
  /className=\{`[^`]+flex-1 h-14 rounded-xl text-lg font-bold transition-all focus:outline-none focus:ring-4 focus:ring-teal-100 active:scale-95[^`]+`\}/g,
  `className={\`
    h-10 sm:h-12 rounded-lg text-sm sm:text-base font-bold transition-all focus:outline-none focus:ring-4 focus:ring-teal-100 active:scale-95
    \${isSelected 
       ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2' 
       : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'}
  \`}`
);

fs.writeFileSync('src/components/EvaluationForm.tsx', code);
