const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const replacement = `  React.useEffect(() => {
    if (printEvaluators) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [printEvaluators]);`;

content = content.replace(/  React\.useEffect\(\(\) => \{\s*\}, \[printEvaluators\]\);/, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
