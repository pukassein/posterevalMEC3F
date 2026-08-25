const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 122 && i <= 124) { // wait, let's just match the exact text
    continue;
  }
  newLines.push(lines[i]);
}
fs.writeFileSync('src/components/AdminPanel.tsx', newLines.join('\n'));
