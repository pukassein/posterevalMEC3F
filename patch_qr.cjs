const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!content.includes('import { QRCodeSVG }')) {
  content = content.replace(
    "import { supabase } from '../lib/supabase';",
    "import { supabase } from '../lib/supabase';\nimport { QRCodeSVG } from 'qrcode.react';"
  );
}

const qrCodeHTML = `
              <div className="mb-8 p-6 border-4 border-slate-900 rounded-2xl bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Avaliador: {ev.name}</h2>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-lg font-medium text-slate-600">Código de Acesso:</span>
                    <span className="text-4xl font-mono font-bold tracking-widest bg-slate-900 text-white px-6 py-2 rounded-xl">{ev.accessCode}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 bg-white p-3 rounded-xl border-2 border-slate-200">
                  <QRCodeSVG value="https://mec3f-aval.ai.studio" size={100} />
                  <span className="text-xs font-bold text-slate-500">Scan to Login</span>
                </div>
              </div>
`;

content = content.replace(
  /<div className="mb-8 p-6 border-4 border-slate-900 rounded-2xl bg-slate-50">\s*<h2 className="text-2xl font-bold text-slate-900 mb-2">Avaliador: \{ev\.name\}<\/h2>\s*<div className="flex items-center gap-4 mt-4">\s*<span className="text-lg font-medium text-slate-600">Código de Acesso:<\/span>\s*<span className="text-4xl font-mono font-bold tracking-widest bg-slate-900 text-white px-6 py-2 rounded-xl">\{ev\.accessCode\}<\/span>\s*<\/div>\s*<\/div>/g,
  qrCodeHTML
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
