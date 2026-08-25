const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "    window.addEventListener('afterprint', handleAfterPrint);",
  "    window.addEventListener('afterprint', handleAfterPrint);\n    return () => window.removeEventListener('afterprint', handleAfterPrint);\n  }, []);"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
