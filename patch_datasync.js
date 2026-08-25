import fs from 'fs';
let code = fs.readFileSync('src/lib/dataSync.ts', 'utf-8');

code = code.replace(
`const evaluators = results[4].data || [];

    if (results[4].error) {
       console.error("Eval_evaluators table might not exist yet. Please run the SQL schema update.", results[4].error);
    }`,
`let evaluators = results[4].data;

    if (results[4].error) {
       console.error("Eval_evaluators table might not exist yet. Please run the SQL schema update.", results[4].error);
       evaluators = null; // null means error/not found
    }`);

code = code.replace(
`evaluators: evaluators as Evaluator[],`,
`evaluators: evaluators ? (evaluators as Evaluator[]) : null,`);

fs.writeFileSync('src/lib/dataSync.ts', code);
