const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "  const handleRemoveEvaluatorUser = (id: string) => {\\n    const updatedEvaluators = localEvaluators.filter(e => e.id !== id);",
  "  const handleRemoveEvaluatorUser = (id: string) => {\\n    if (!window.confirm('Tem certeza que deseja remover este avaliador?')) return;\\n    const updatedEvaluators = localEvaluators.filter(e => e.id !== id);"
);

content = content.replace(
  "  const handleRemoveCriterion = (id: string) => {\\n    const updated = localCriteria.filter(c => c.id !== id);",
  "  const handleRemoveCriterion = (id: string) => {\\n    if (!window.confirm('Tem certeza que deseja remover este critério?')) return;\\n    const updated = localCriteria.filter(c => c.id !== id);"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
