import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  /<input\s+type="time"/g,
  '<input\n                          type="text"\n                          placeholder="Horário (ex: 14:30)"'
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
