import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  "const maxPossible = criteria.length * 5;",
  "const maxPossible = criteria.length * 10;"
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
