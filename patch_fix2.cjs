const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "if (printEvaluators) {\n      setTimeout(() => {\n        window.print();\n      }, 500);\n    }",
  ""
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
