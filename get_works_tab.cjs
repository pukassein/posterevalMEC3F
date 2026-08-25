const fs = require('fs');
const code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
const start = code.indexOf("{/* TAB: WORKS */}");
const end = code.indexOf("</main>");
console.log(code.substring(start, end));
