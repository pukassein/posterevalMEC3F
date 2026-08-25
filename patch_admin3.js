import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const evaluatorsHandlers = `
  const generateAccessCode = () => {
    let code = '';
    do {
      code = Math.floor(100 + Math.random() * 900).toString();
    } while (localEvaluators.some(e => e.accessCode === code) || code === 'admin');
    return code;
  };

  const handleAddEvaluatorUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvaluatorName.trim()) return;
    
    const accessCode = generateAccessCode();
    const newEv: Evaluator = {
      id: accessCode, // they login with accessCode
      name: newEvaluatorName.trim(),
      accessCode: accessCode
    };
    
    setLocalEvaluators([...localEvaluators, newEv]);
    setNewEvaluatorName('');
  };

  const handleRemoveEvaluatorUser = (id: string) => {
    if (confirm('Tem certeza que deseja remover este avaliador? Suas atribuições serão mantidas apenas se vinculadas, mas ele não poderá acessar.')) {
      setLocalEvaluators(localEvaluators.filter(e => e.id !== id));
    }
  };

  const saveEvaluatorsChanges = () => {
    if (onSaveEvaluators) {
      onSaveEvaluators(localEvaluators);
      setSavedEvaluatorsMsg(true);
      setTimeout(() => setSavedEvaluatorsMsg(false), 3000);
    }
  };
`;

code = code.replace("// Assignments Logic", evaluatorsHandlers + "\n  // Assignments Logic");

const evaluatorsTab = `
        {/* TAB: EVALUATORS */}
        {activeTab === 'evaluators' && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-3 text-teal-600 shrink-0" />
                  Gerenciar Avaliadores
                </h2>
                <div className="flex items-center gap-3">
                  {savedEvaluatorsMsg && <span className="text-emerald-600 text-sm font-bold animate-pulse">Salvo com sucesso!</span>}
                  <button 
                    onClick={saveEvaluatorsChanges}
                    className="flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Avaliadores
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddEvaluatorUser} className="flex flex-col md:flex-row gap-3 mb-8 max-w-2xl">
                <input
                  type="text"
                  value={newEvaluatorName}
                  onChange={(e) => setNewEvaluatorName(e.target.value)}
                  placeholder="Nome do Novo Avaliador"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                />
                <button type="submit" disabled={!newEvaluatorName.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Criar Avaliador</span>
                </button>
              </form>

              <div className="space-y-3">
                {localEvaluators.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">Nenhum avaliador cadastrado. Crie um acima.</p>
                ) : (
                  localEvaluators.map(ev => (
                    <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-mono font-bold text-lg shadow-sm border border-teal-200">
                          {ev.accessCode}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{ev.name}</div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">Código de Acesso: {ev.accessCode}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveEvaluatorUser(ev.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center self-start sm:self-auto shrink-0"
                        title="Remover avaliador"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace("{/* TAB: ASSIGNMENTS */}", evaluatorsTab + "\n        {/* TAB: ASSIGNMENTS */}");

// Also update Assignments tab so that they just pick from the list of evaluators instead of adding manually by ID, if evaluators exist
const oldAssignmentForm = `<form onSubmit={handleAddEvaluator} className="flex flex-col md:flex-row gap-3 mb-6 max-w-2xl">
                 <input
                   type="text"
                   value={newEvaluatorId}
                   onChange={(e) => setNewEvaluatorId(e.target.value)}
                   placeholder="Digite o ID do Avaliador (ex: ev-200)"
                   className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 bg-slate-50 focus:bg-white transition-colors"
                 />
                 <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm w-full md:w-auto">
                   Acessar / Criar
                 </button>
               </form>
               
               <div className="flex flex-wrap gap-2 pt-2">
                 {Object.keys(localAssignments).length === 0 && (
                   <span className="text-slate-500 text-sm italic">Nenhum avaliador na lista ainda.</span>
                 )}
                 {Object.keys(localAssignments).map(id => (
                   <button
                     key={id}
                     onClick={() => setSelectedEvaluator(id)}
                     className={\`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border \${
                       selectedEvaluator === id 
                       ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-200 ring-offset-1' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                     }\`}
                   >
                     {id} <span className="ml-1 opacity-50 px-1.5 py-0.5 bg-slate-200 rounded-md text-[10px]">{localAssignments[id].length}</span>
                   </button>
                 ))}
               </div>`;

const newAssignmentForm = `<div className="flex flex-col md:flex-row gap-3 mb-6 max-w-2xl">
                <select
                  value={selectedEvaluator || ''}
                  onChange={(e) => setSelectedEvaluator(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="" disabled>Selecione um avaliador (criado na aba Avaliadores)</option>
                  {localEvaluators.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.accessCode})</option>
                  ))}
                  {/* For backward compatibility with already assigned IDs that are not in localEvaluators */}
                  {Object.keys(localAssignments)
                    .filter(id => !localEvaluators.find(e => e.id === id))
                    .map(id => (
                      <option key={id} value={id}>{id} (Não cadastrado)</option>
                  ))}
                </select>
               </div>
               
               <div className="flex flex-wrap gap-2 pt-2">
                 {Object.keys(localAssignments).length === 0 && localEvaluators.length === 0 && (
                   <span className="text-slate-500 text-sm italic">Nenhum avaliador na lista ainda. Vá na aba Avaliadores para criar.</span>
                 )}
                 {localEvaluators.map(ev => (
                   <button
                     key={ev.id}
                     onClick={() => setSelectedEvaluator(ev.id)}
                     className={\`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border \${
                       selectedEvaluator === ev.id 
                       ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-200 ring-offset-1' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                     }\`}
                   >
                     {ev.name} <span className="ml-1 opacity-50 px-1.5 py-0.5 bg-slate-200 rounded-md text-[10px]">{(localAssignments[ev.id] || []).length}</span>
                   </button>
                 ))}
                 {Object.keys(localAssignments)
                    .filter(id => !localEvaluators.find(e => e.id === id))
                    .map(id => (
                   <button
                     key={id}
                     onClick={() => setSelectedEvaluator(id)}
                     className={\`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border \${
                       selectedEvaluator === id 
                       ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-200 ring-offset-1' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                     }\`}
                   >
                     {id} <span className="ml-1 opacity-50 px-1.5 py-0.5 bg-slate-200 rounded-md text-[10px]">{(localAssignments[id] || []).length}</span>
                   </button>
                 ))}
               </div>`;
               
code = code.replace(oldAssignmentForm, newAssignmentForm);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
