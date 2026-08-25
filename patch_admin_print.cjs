const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/AdminPanel.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the setPrintEvaluators function declaration with our new logic
content = content.replace(
  /const setPrintEvaluators = \(evals: Evaluator\[\]\) => {[\s\S]*?};/,
  `const [printEvaluatorsList, setPrintEvaluatorsList] = useState<Evaluator[] | null>(null);

  const handlePrintEvaluators = (evals: Evaluator[]) => {
    setPrintEvaluatorsList(evals);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  useEffect(() => {
    const afterPrint = () => {
      setPrintEvaluatorsList(null);
    };
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);`
);

// We also need to change the onClick handlers from setPrintEvaluators to handlePrintEvaluators
content = content.replace(/setPrintEvaluators\(/g, 'handlePrintEvaluators(');

// Now, insert the print view render condition before the main return statement.
// We look for:
//   if (isLoading) {
// or we look for:
//   return (
//     <div className="font-sans antialiased text-slate-900 min-h-screen bg-slate-50 overscroll-none">
// Actually AdminPanel returns:
//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">

const returnIndex = content.indexOf('return (\n    <div className="min-h-screen');
if (returnIndex !== -1) {
  const printViewCode = `
  if (printEvaluatorsList) {
    return (
      <div className="bg-white text-black p-8 min-h-screen w-full">
        <style>
          {\`
            @media print {
              @page { margin: 2cm; }
              body { background: white; }
              .page-break { page-break-after: always; }
              nav, button:not(.print-btn) { display: none !important; }
            }
          \`}
        </style>
        <button className="print-btn mb-8 px-4 py-2 bg-slate-900 text-white rounded font-bold" onClick={() => setPrintEvaluatorsList(null)}>Voltar</button>
        {printEvaluatorsList.map((ev, index) => {
          const assignedWorks = (localAssignments[ev.id] || [])
            .map(wId => localWorks.find(w => w.id === wId))
            .filter(Boolean) as Poster[];
            
          return (
            <div key={ev.id} className={index < printEvaluatorsList.length - 1 ? 'page-break mb-12 pb-12 border-b-2 border-slate-200 print:border-none' : ''}>
              <h1 className="text-3xl font-bold mb-4">Guia do Avaliador</h1>
              <div className="mb-8 p-6 border-2 border-slate-900 rounded-xl bg-slate-50 print:bg-transparent">
                <p className="text-2xl font-bold mb-2">{ev.name}</p>
                <div className="flex gap-6 items-center mb-2">
                  <p className="text-lg">Código de Acesso: <span className="font-mono bg-slate-200 px-2 py-1 rounded text-slate-900">{ev.accessCode}</span></p>
                  {ev.areas && ev.areas.length > 0 && <p className="text-slate-600">Áreas: {ev.areas.join(', ')}</p>}
                </div>
                <p className="text-sm text-slate-500">Acesse o sistema em: <strong className="text-slate-900">{window.location.origin}</strong></p>
              </div>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Trabalhos Atribuídos 
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-sm">{assignedWorks.length}</span>
              </h2>
              {assignedWorks.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum trabalho atribuído no momento.</p>
              ) : (
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-3 text-left w-20">ID</th>
                      <th className="border border-slate-300 p-3 text-left w-32">Tipo / Área</th>
                      <th className="border border-slate-300 p-3 text-left">Título</th>
                      <th className="border border-slate-300 p-3 text-left w-48">Apresentador</th>
                      <th className="border border-slate-300 p-3 text-left w-32">Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedWorks.map(w => (
                      <tr key={w.id}>
                        <td className="border border-slate-300 p-3 font-mono font-bold text-slate-700">{w.posterId}</td>
                        <td className="border border-slate-300 p-3">
                          <span className="font-bold uppercase text-xs">{w.type}</span><br/>
                          <span className="text-xs text-slate-500">{w.tematica}</span>
                        </td>
                        <td className="border border-slate-300 p-3 font-medium">{w.title}</td>
                        <td className="border border-slate-300 p-3 text-slate-600">{w.presenterName}</td>
                        <td className="border border-slate-300 p-3 text-slate-600">
                          {w.type === 'oral' && w.presentationDate ? w.presentationDate : ''}
                          {w.type === 'oral' && w.presentationDate && w.presentationTime ? <br/> : ''}
                          {w.presentationTime || '-'}
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
  content = content.slice(0, returnIndex) + printViewCode + content.slice(returnIndex);
}

fs.writeFileSync(filePath, content);
console.log('AdminPanel patched for printing.');
