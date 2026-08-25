const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const insertionPoint = code.indexOf("{/* ADD WORK FORM (Common to both Oral and Posters) */}");

const headerAndReturn = `
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header Tabs */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-2 flex items-center space-x-2 sm:space-x-6 overflow-x-auto scrollbar-hide pb-1 pt-2">
          <button 
            onClick={() => setActiveTab('results')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'results' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Award className="w-4 h-4 mr-1 sm:mr-2" />
            Resultados
          </button>
          <button 
            onClick={() => setActiveTab('evaluators')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'evaluators' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
            Avaliadores
          </button>
          <button 
            onClick={() => setActiveTab('oral')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'oral' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            Comunicação Oral
          </button>
          <button 
            onClick={() => setActiveTab('posters')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'posters' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            Pôsteres
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'assignments' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            Atribuições
          </button>
          <button 
            onClick={() => setActiveTab('criteria')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'criteria' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Settings2 className="w-4 h-4 mr-1 sm:mr-2" />
            Critérios
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full p-4 pb-12 space-y-6 mt-4">
        
        {/* TAB: RESULTS */}
        {activeTab === 'results' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">Desempenho dos Trabalhos</h2>
                 <p className="text-sm text-slate-500 mt-1">Ranking baseado na média total das avaliações concluídas.</p>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 rounded-tl-xl w-24">Rank</th>
                    <th className="p-4 w-32">ID Pôster</th>
                    <th className="p-4">Título & Apresentador</th>
                    <th className="p-4 w-32 text-center">Avaliações</th>
                    <th className="p-4 rounded-tr-xl w-32 text-right">Nota Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posterStats.map((stat, idx) => (
                    <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">
                        {idx === 0 && stat.evalCount > 0 ? (
                          <span className="flex items-center text-amber-500"><Award className="w-6 h-6 mr-1 fill-amber-100" /> 1º</span>
                        ) : idx === 1 && stat.evalCount > 0 ? (
                          <span className="flex items-center text-slate-400"><Award className="w-6 h-6 mr-1 fill-slate-100" /> 2º</span>
                        ) : idx === 2 && stat.evalCount > 0 ? (
                          <span className="flex items-center text-amber-700"><Award className="w-6 h-6 mr-1" /> 3º</span>
                        ) : (
                          \`#\${idx + 1}\`
                        )}
                      </td>
                      <td className="p-4 text-sm font-mono font-bold text-slate-600">{stat.posterId}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 leading-snug">{stat.title}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{stat.presenterName}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={\`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full \${stat.evalCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}\`}>
                          {stat.evalCount}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {stat.evalCount > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-teal-700">{stat.averageScore.toFixed(1)}</span>
                            <span className="text-xs text-slate-400">/ {stat.maxPossible} max</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

`;

code = code.substring(0, insertionPoint) + headerAndReturn + code.substring(insertionPoint);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
