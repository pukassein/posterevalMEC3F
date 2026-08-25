const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add Printer to imports
if (!content.includes('Printer')) {
  content = content.replace(
    "import { Save, LogOut, CheckSquare, Square, UserPlus, Trash2, LayoutDashboard, Settings2, Users, FileText, Plus, Award, Clock, Tag, RefreshCw } from 'lucide-react';",
    "import { Save, LogOut, CheckSquare, Square, UserPlus, Trash2, LayoutDashboard, Settings2, Users, FileText, Plus, Award, Clock, Tag, RefreshCw, Printer } from 'lucide-react';"
  );
}

// 2. Add printEvaluators state
if (!content.includes("printEvaluators")) {
  content = content.replace(
    "const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'works'>('results');",
    "const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'works'>('results');\n  const [printEvaluators, setPrintEvaluators] = React.useState<Evaluator[] | null>(null);\n\n  React.useEffect(() => {\n    if (printEvaluators) {\n      setTimeout(() => {\n        window.print();\n      }, 500);\n    }\n  }, [printEvaluators]);\n\n  React.useEffect(() => {\n    const handleAfterPrint = () => setPrintEvaluators(null);\n    window.addEventListener('afterprint', handleAfterPrint);\n    return () => window.removeEventListener('afterprint', handleAfterPrint);\n  }, []);\n"
  );
}

// 3. Early return for print view
const printView = `
  if (printEvaluators) {
    return (
      <div className="bg-white text-black min-h-screen">
        <button 
          onClick={() => setPrintEvaluators(null)} 
          className="print:hidden fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg z-50 hover:bg-red-700 transition"
        >
          Cancelar Impressão / Voltar
        </button>
        {printEvaluators.map((ev, index) => {
          const evWorks = posters.filter(p => (assignments[ev.id] || []).includes(p.id));
          return (
            <div key={ev.id} className={\`p-8 max-w-4xl mx-auto \${index > 0 ? 'break-before-page' : ''}\`}>
              <h1 className="text-3xl font-bold text-center mb-6">Guia de Avaliação - Evento</h1>
              
              <div className="mb-8 p-6 border-4 border-slate-900 rounded-2xl bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Avaliador: {ev.name}</h2>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-lg font-medium text-slate-600">Código de Acesso:</span>
                  <span className="text-4xl font-mono font-bold tracking-widest bg-slate-900 text-white px-6 py-2 rounded-xl">{ev.accessCode}</span>
                </div>
              </div>

              <div className="mb-8 text-base border-2 border-slate-200 rounded-2xl p-6 bg-white">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Instruções para Avaliação:
                </h3>
                <ol className="list-decimal pl-6 space-y-3 text-slate-800">
                  <li>Acesse o sistema de avaliação através do seu celular ou tablet.</li>
                  <li>Na tela inicial, digite seu <strong>Código de Acesso</strong> informado acima.</li>
                  <li>Acesse cada um dos trabalhos atribuídos a você e preencha as notas.</li>
                  <li><strong>Importante:</strong> Use a tabela abaixo para anotar as notas como rascunho de emergência caso haja problemas de conexão.</li>
                </ol>
              </div>

              <h3 className="font-bold text-2xl mb-4 pb-2 border-b-2 border-slate-900">
                Trabalhos Atribuídos ({evWorks.length})
              </h3>
              
              {evWorks.length === 0 ? (
                <p className="italic text-slate-500 text-lg">Nenhum trabalho atribuído a este avaliador no momento.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-900">
                      <th className="p-4 w-32 font-bold text-slate-900">Código</th>
                      <th className="p-4 font-bold text-slate-900">Detalhes do Trabalho</th>
                      <th className="p-4 w-32 text-center font-bold text-slate-900 whitespace-nowrap">Nota (0-10)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evWorks.map(w => (
                      <tr key={w.id} className="border-b border-slate-300">
                        <td className="p-4 font-mono font-bold text-lg">{w.posterId}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-lg mb-1">{w.title}</div>
                          <div className="text-slate-600 mb-1">{w.presenterName}</div>
                          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                            {w.type === 'poster' ? 'Pôster' : 'Oral'} {w.tematica && \`• \${w.tematica}\`}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-full h-12 border-b-2 border-dashed border-slate-400 mt-6"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    );
  }
`;

content = content.replace(
  "return (",
  printView + "\n\n  return ("
);

// 4. Add Print All button in header of Evaluators tab
const printAllBtn = `
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <UserPlus className="w-5 h-5 mr-3 text-teal-600 shrink-0" />
                    Gerenciar Avaliadores
                  </h2>
                  {localEvaluators.length > 0 && (
                    <button
                      onClick={() => setPrintEvaluators(localEvaluators)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-bold text-sm ml-auto"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir Todos
                    </button>
                  )}
                </div>
`;

content = content.replace(
  /<h2 className="text-xl font-bold text-slate-900 flex items-center">\s*<UserPlus className="w-5 h-5 mr-3 text-teal-600 shrink-0" \/>\s*Gerenciar Avaliadores\s*<\/h2>/,
  printAllBtn
);

// 5. Add Print button for individual evaluator
const printIndividualBtn = `
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setPrintEvaluators([ev])}
                          className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center"
                          title="Imprimir guia do avaliador"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleRemoveEvaluatorUser(ev.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                          title="Remover avaliador"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
`;

content = content.replace(
  /<button\s+onClick=\{\(\) => handleRemoveEvaluatorUser\(ev\.id\)\}\s+className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center self-start sm:self-auto shrink-0"\s+title="Remover avaliador"\s*>\s*<Trash2 className="w-5 h-5" \/>\s*<\/button>/g,
  printIndividualBtn
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log("Patched AdminPanel.tsx");
