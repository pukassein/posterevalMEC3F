import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
`setAssignments(data.assignments);
          if (data.evaluators) setEvaluators(data.evaluators);`,
`setAssignments(data.assignments);
          if (data.evaluators) {
             setEvaluators(data.evaluators);
          } else {
             // Fallback to local storage only for evaluators if Supabase table is missing
             const savedEvaluators = localStorage.getItem('poster_eval_evaluators');
             if (savedEvaluators) setEvaluators(JSON.parse(savedEvaluators));
          }`);

fs.writeFileSync('src/App.tsx', code);
