const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

content = content.replace(
  'Insira seu código de 3 dígitos para acessar suas avaliações. <br />\\n            <span className="text-xs text-slate-400 mt-1 block">(Use "admin" para o painel de administração)</span>',
  'Insira seu código de 3 dígitos para acessar suas avaliações.'
);
content = content.replace(
  'Insira seu código de 3 dígitos para acessar suas avaliações. <br />            <span className="text-xs text-slate-400 mt-1 block">(Use "admin" para o painel de administração)</span>',
  'Insira seu código de 3 dígitos para acessar suas avaliações.'
);

fs.writeFileSync('src/components/Login.tsx', content);
