const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The works tab starts at {/* TAB: WORKS */} and ends before {/* TAB: CRITERIA */}
const worksStart = code.indexOf("{/* TAB: WORKS */}");
const criteriaStart = code.indexOf("{/* TAB: CRITERIA */}");
const worksContent = code.substring(worksStart, criteriaStart);

// We want to replace this entirely with the new ORAL, POSTER and ASSIGNMENTS tabs.
const renderWorkHelper = `  const renderWorkCardWithAssign = (work: Poster) => {
    const isExpanded = expandedWorkId === work.id;
    const assignedEvaluatorIds = Object.keys(localAssignments).filter(evId => (localAssignments[evId] || []).includes(work.id));
    
    // Determine card color based on tematica
    const getTematicaColor = (t?: Tematica) => {
      switch(t) {
        case 'SMA': return 'border-[#fbeae6] bg-[#fffaf9]';
        case 'ECO': return 'border-[#e6f2e9] bg-[#f8fbf9]';
        case 'ENS': return 'border-[#e6f4f4] bg-[#f8fbfb]';
        case 'EMA': return 'border-[#f6f6e8] bg-[#fdfdf7]';
        default: return 'border-slate-200 bg-slate-50';
      }
    };

    return (
      <div key={work.id} className={\`flex flex-col p-4 border rounded-xl relative cursor-pointer transition-colors \${getTematicaColor(work.tematica)}\`} onClick={() => setExpandedWorkId(isExpanded ? null : work.id)}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div className="mb-4 sm:mb-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={\`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full \${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}\`}>
                {work.type === 'poster' ? 'Pôster' : 'Oral'}
              </span>
              <div className="text-xs font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white">ID: {work.posterId}</div>
              {work.presentationDate && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white flex items-center">
                  {work.presentationDate}
                </div>
              )}
              {work.tematica && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {work.tematica}
                </div>
              )}
              {work.presentationTime && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {work.presentationTime}
                </div>
              )}
              {assignedEvaluatorIds.length > 0 && (
                <div className="text-xs font-bold px-2 py-0.5 border border-teal-200 rounded-md text-teal-700 bg-teal-50 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {assignedEvaluatorIds.length} Avaliador{assignedEvaluatorIds.length !== 1 ? 'es' : ''}
                </div>
              )}
            </div>
            <div className="font-bold text-slate-900 leading-snug">{work.title}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">{work.presenterName}</div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveWork(work.id); }}
            className="text-red-500 hover:text-red-700 hover:bg-white p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
            title="Remover trabalho"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-bold text-slate-700">Atribuir Avaliadores</h4>
            {localEvaluators.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum avaliador cadastrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {localEvaluators.map(ev => {
                  const isAssigned = (localAssignments[ev.id] || []).includes(work.id);
                  const isMatch = ev.areas?.includes(work.tematica as Tematica);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => handleToggleAssignmentFromWork(work.id, ev.id)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center \${
                        isAssigned 
                          ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-1 ring-teal-200 ring-offset-1' 
                          : isMatch
                            ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      {isAssigned && <CheckSquare className="w-3 h-3 mr-1.5" />}
                      {!isAssigned && <div className="w-3 h-3 mr-1.5 border border-slate-300 rounded-sm" />}
                      {ev.name} {isMatch && !isAssigned && <span className="ml-1 text-[10px] text-amber-700 opacity-80">(Recomendado)</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
`;

const worksHeaderLogic = `
        {/* ADD WORK FORM (Common to both Oral and Posters) */}
        {(activeTab === 'oral' || activeTab === 'posters') && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Gerenciar Trabalhos</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Adicione, remova e edite pôsteres e comunicações orais.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={handleSyncWorks}
                  disabled={isSyncing}
                  className="flex items-center justify-between w-full p-4 mb-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition disabled:opacity-50"
                >
                  <span className="text-sm font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw className={\`w-5 h-5 \${isSyncing ? 'animate-spin' : ''}\`} />
                    Sincronizar Trabalhos do Banco do Evento
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWork(!showAddWork)}
                  className="flex items-center justify-between w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
                >
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Adicionar Novo Trabalho</span>
                  <Plus className={\`w-5 h-5 text-slate-600 transition-transform \${showAddWork ? 'rotate-45' : ''}\`} />
                </button>
                {showAddWork && (
                  <form onSubmit={(e) => { handleAddWork(e); setShowAddWork(false); }} className="flex flex-col gap-4 mt-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={newWorkId} onChange={(e) => setNewWorkId(e.target.value)} placeholder="ID (ex: P-101 ou O-202)" className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors" />
                      <select value={newWorkType} onChange={(e) => setNewWorkType(e.target.value as 'poster' | 'oral')} className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors">
                        <option value="poster">Pôster</option>
                        <option value="oral">Comunicação Oral</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select value={newWorkTematica} onChange={(e) => setNewWorkTematica(e.target.value as Tematica)} className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors">
                        {Object.entries(TEMATICAS).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        {newWorkType === 'oral' && (
                          <select value={newWorkDate} onChange={(e) => setNewWorkDate(e.target.value)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors">
                            <option value="26/08">Quarta-feira 26/08</option>
                            <option value="27/08">Quinta-feira 27/08</option>
                            <option value="28/08">Sexta-feira 28/08</option>
                          </select>
                        )}
                        <input type="text" placeholder="Horário (ex: 14:30)" value={newWorkTime} onChange={(e) => setNewWorkTime(e.target.value)} className={\`px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors \${newWorkType === 'oral' ? 'w-1/3' : 'w-full'}\`} />
                      </div>
                    </div>
                    <input type="text" value={newWorkTitle} onChange={(e) => setNewWorkTitle(e.target.value)} placeholder="Título do Trabalho" className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors" />
                    <input type="text" value={newWorkPresenter} onChange={(e) => setNewWorkPresenter(e.target.value)} placeholder="Nome do Apresentador" className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors" />
                    <div className="flex justify-end">
                      <button type="submit" disabled={!newWorkTitle.trim() || !newWorkPresenter.trim() || !newWorkId.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
        )}
`;

const oralTabLogic = `
        {/* TAB: ORAL */}
        {activeTab === 'oral' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['SMA', 'ECO', 'ENS', 'EMA'].map((tematica) => {
                const tematicaWorks = sortedWorks.filter(w => w.type === 'oral' && w.tematica === tematica);
                return (
                  <div key={tematica} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                      {TEMATICAS[tematica as Tematica].split('-')[0]}
                      <span className="ml-auto text-xs font-mono text-slate-400">{tematica}</span>
                    </h3>
                    <div className="space-y-3">
                      {tematicaWorks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhum trabalho.</p>
                      ) : (
                        tematicaWorks.map(renderWorkCardWithAssign)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
`;

const postersTabLogic = `
        {/* TAB: POSTERS */}
        {activeTab === 'posters' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['SMA', 'ECO', 'ENS', 'EMA'].map((tematica) => {
                const tematicaWorks = sortedWorks.filter(w => w.type === 'poster' && w.tematica === tematica);
                return (
                  <div key={tematica} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                      {TEMATICAS[tematica as Tematica].split('-')[0]}
                      <span className="ml-auto text-xs font-mono text-slate-400">{tematica}</span>
                    </h3>
                    <div className="space-y-3">
                      {tematicaWorks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhum trabalho.</p>
                      ) : (
                        tematicaWorks.map(renderWorkCardWithAssign)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
`;

const assignmentsTabLogic = `
        {/* TAB: ASSIGNMENTS (Read Only) */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Visualizar Atribuições</h2>
                  <p className="text-sm text-slate-500 mt-1">Veja quais trabalhos estão atribuídos a cada avaliador. Atribua novos trabalhos através das abas "Comunicação Oral" e "Pôsteres".</p>
                </div>
              </div>
              <div className="space-y-6">
                {localEvaluators.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhum avaliador cadastrado.</p>
                ) : (
                  localEvaluators.map(ev => {
                    const assignedWorks = localAssignments[ev.id] || [];
                    if (assignedWorks.length === 0) return null;
                    return (
                      <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                          <h3 className="font-bold text-slate-900">{ev.name}</h3>
                          <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-1 rounded-md">{assignedWorks.length} Trabalho{assignedWorks.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {assignedWorks.map(workId => {
                            const work = localWorks.find(w => w.id === workId);
                            if (!work) return null;
                            return (
                              <div key={work.id} className="text-sm p-3 bg-white border border-slate-200 rounded-lg shadow-sm flex items-start gap-2">
                                <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 \${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}\`}>
                                  {work.posterId}
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900 leading-tight">{work.title}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
                {Object.keys(localAssignments).every(evId => (localAssignments[evId] || []).length === 0) && localEvaluators.length > 0 && (
                   <p className="text-sm text-slate-500 italic">Nenhum trabalho atribuído ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(worksContent, "\n" + renderWorkHelper + "\n" + worksHeaderLogic + "\n" + oralTabLogic + "\n" + postersTabLogic + "\n" + assignmentsTabLogic + "\n");

// We need to add handleToggleAssignmentFromWork inside AdminPanel
const handleToggleLogic = `
  const handleToggleAssignmentFromWork = (workId: string, evaluatorId: string) => {
    setLocalAssignments(prev => {
      const currentAssigned = prev[evaluatorId] || [];
      if (currentAssigned.includes(workId)) {
        return { ...prev, [evaluatorId]: currentAssigned.filter(id => id !== workId) };
      } else {
        return { ...prev, [evaluatorId]: [...currentAssigned, workId] };
      }
    });
  };
`;

if (!code.includes("handleToggleAssignmentFromWork")) {
  code = code.replace(
    "const handleRemoveWork = (id: string) => {",
    handleToggleLogic + "\n  const handleRemoveWork = (id: string) => {"
  );
}

// Add state for expanded work card
if (!code.includes("expandedWorkId")) {
  code = code.replace(
    "const [showAddWork, setShowAddWork] = useState(false);",
    "const [showAddWork, setShowAddWork] = useState(false);\n  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);"
  );
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Replaced Works tab successfully.');
