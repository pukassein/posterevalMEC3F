const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "    window.addEventListener('afterprint', handleAfterPrint);\n        \n  if (printEvaluators) {",
  "    window.addEventListener('afterprint', handleAfterPrint);\n    return () => window.removeEventListener('afterprint', handleAfterPrint);\n  }, []);\n\n  if (printEvaluators) {"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
