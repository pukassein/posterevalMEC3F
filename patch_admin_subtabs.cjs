const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add state for subtabs
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'oral' | 'posters'>('oral');",
  "const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'oral' | 'posters'>('oral');\n  const [activeTematicaOral, setActiveTematicaOral] = useState<Tematica | 'ALL'>('ALL');\n  const [activeTematicaPoster, setActiveTematicaPoster] = useState<Tematica | 'ALL'>('ALL');"
);

// 2. Replace Oral Tab logic
const oldOralTab = `        {/* TAB: ORAL */}
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
        )}`;

const newOralTab = `        {/* TAB: ORAL */}
        {activeTab === 'oral' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTematicaOral('ALL')}
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTematicaOral === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
              >
                Todos
              </button>
              {(Object.entries(TEMATICAS) as [Tematica, string][]).map(([key, label]) => (
                <button 
                  key={key}
                  onClick={() => setActiveTematicaOral(key)}
                  className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTematicaOral === key ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
                >
                  {key} - {label.split(' - ')[0]}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorks
                .filter(w => w.type === 'oral' && (activeTematicaOral === 'ALL' || w.tematica === activeTematicaOral))
                .map(renderWorkCardWithAssign)}
            </div>
            
            {sortedWorks.filter(w => w.type === 'oral' && (activeTematicaOral === 'ALL' || w.tematica === activeTematicaOral)).length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 italic">Nenhum trabalho de comunicação oral encontrado para esta seleção.</p>
              </div>
            )}
          </div>
        )}`;

code = code.replace(oldOralTab, newOralTab);

// 3. Replace Posters Tab logic
const oldPostersTab = `        {/* TAB: POSTERS */}
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
        )}`;

const newPostersTab = `        {/* TAB: POSTERS */}
        {activeTab === 'posters' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTematicaPoster('ALL')}
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTematicaPoster === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
              >
                Todos
              </button>
              {(Object.entries(TEMATICAS) as [Tematica, string][]).map(([key, label]) => (
                <button 
                  key={key}
                  onClick={() => setActiveTematicaPoster(key)}
                  className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTematicaPoster === key ? 'bg-indigo-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
                >
                  {key} - {label.split(' - ')[0]}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorks
                .filter(w => w.type === 'poster' && (activeTematicaPoster === 'ALL' || w.tematica === activeTematicaPoster))
                .map(renderWorkCardWithAssign)}
            </div>
            
            {sortedWorks.filter(w => w.type === 'poster' && (activeTematicaPoster === 'ALL' || w.tematica === activeTematicaPoster)).length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 italic">Nenhum pôster encontrado para esta seleção.</p>
              </div>
            )}
          </div>
        )}`;

code = code.replace(oldPostersTab, newPostersTab);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Subtabs applied');
