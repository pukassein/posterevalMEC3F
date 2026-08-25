import fs from 'fs';
let code = fs.readFileSync('src/components/EvaluationForm.tsx', 'utf8');

code = code.replace(
  "Pontue cada métrica de 1 (Ruim) a 5 (Excelente).",
  "Pontue cada métrica de 0 (Ruim) a 10 (Excelente)."
);

fs.writeFileSync('src/components/EvaluationForm.tsx', code);
