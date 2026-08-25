const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "  const handleRemoveCriterion = (id: string) => {\n    const updatedCriteria = localCriteria.filter(c => c.id !== id);",
  "  const handleRemoveCriterion = (id: string) => {\n    if (!window.confirm('Tem certeza que deseja remover este critério?')) return;\n    const updatedCriteria = localCriteria.filter(c => c.id !== id);"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
