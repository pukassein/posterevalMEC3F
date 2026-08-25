const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  /<tr key=\{w\.id\} className="border-b border-slate-300">/g,
  '<tr key={w.id} className="border-b border-slate-300 break-inside-avoid">'
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
