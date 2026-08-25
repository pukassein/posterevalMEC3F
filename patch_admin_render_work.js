import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Render a work function
const renderWorkHelper = `  const renderWorkCard = (work: Poster) => {
    const isExpanded = expandedWorkId === work.id;
    const assignedEvaluatorIds = Object.keys(localAssignments).filter(evId => (localAssignments[evId] || []).includes(work.id));
    
    return (
      <div key={work.id} className="flex flex-col p-4 border border-slate-200 rounded-xl bg-slate-50 relative cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setExpandedWorkId(isExpanded ? null : work.id)}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div className="mb-4 sm:mb-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={\`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full \${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}\`}>
                {work.type === 'poster' ? 'Pôster' : 'Oral'}
              </span>
              <div className="text-xs font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white">ID: {work.posterId}</div>
              {work.presentationDate && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-slate-100 flex items-center">
                  {work.presentationDate}
                </div>
              )}
              {work.tematica && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-slate-100 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {work.tematica}
                </div>
              )}
              {work.presentationTime && (
                <div className="text-xs font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-slate-100 flex items-center">
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
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
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
                  return (
                    <button
                      key={ev.id}
                      onClick={() => handleToggleAssignmentFromWork(work.id, ev.id)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center \${
                        isAssigned
                          ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      {isAssigned && <CheckSquare className="w-3 h-3 mr-1.5" />}
                      {!isAssigned && <div className="w-3 h-3 mr-1.5 border border-slate-300 rounded-sm" />}
                      {ev.name}
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

code = code.replace(
  "const [showAddWork, setShowAddWork] = useState(false);",
  "const [showAddWork, setShowAddWork] = useState(false);\n" + renderWorkHelper
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
