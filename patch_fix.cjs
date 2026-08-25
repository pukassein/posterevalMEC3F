const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Restore the useEffect block
content = content.replace(
  "  React.useEffect(() => {\n    \n  }, [printEvaluators]);",
  "  React.useEffect(() => {\n    if (printEvaluators) {\n      setTimeout(() => {\n        window.print();\n      }, 500);\n    }\n  }, [printEvaluators]);"
);

// Remove the misplaced block at 460
content = content.replace(
  "if (printEvaluators) {\n      setTimeout(() => {\n        window.print();\n      }, 500);\n    }",
  ""
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
