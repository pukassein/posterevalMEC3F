const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const start = code.indexOf("  const renderWorkCardWithAssign");
const end = code.indexOf("{/* ADD WORK FORM");

code = code.substring(0, start) + code.substring(end);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
