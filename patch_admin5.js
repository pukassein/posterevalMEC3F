import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add `const [showAddWork, setShowAddWork] = useState(false);`
code = code.replace(
  /const \[savedWorksMsg, setSavedWorksMsg\] = useState\(false\);/,
  "const [savedWorksMsg, setSavedWorksMsg] = useState(false);\n  const [showAddWork, setShowAddWork] = useState(false);"
);

// Replace Works UI
const worksUiOld = `              <div className="mt-4 mb-8 pt-2 pb-6 border-b border-slate-100 text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Adicionar Novo Trabalho</h3>
                <form onSubmit={handleAddWork} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newWorkId}
                      onChange={(e) => setNewWorkId(e.target.value)}
                      placeholder="ID (ex: P-101 ou O-202)"
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    />
                    <select
                      value={newWorkType}
                      onChange={(e) => setNewWorkType(e.target.value as 'poster' | 'oral')}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    >
                      <option value="poster">Pôster</option>
                      <option value="oral">Comunicação Oral</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newWorkTematica}
                      onChange={(e) => setNewWorkTematica(e.target.value as Tematica)}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    >
                      {Object.entries(TEMATICAS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={newWorkTime}
                      onChange={(e) => setNewWorkTime(e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={newWorkTitle}
                    onChange={(e) => setNewWorkTitle(e.target.value)}
                    placeholder="Título do Trabalho"
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                  />
                  <input
                    type="text"
                    value={newWorkPresenter}
                    onChange={(e) => setNewWorkPresenter(e.target.value)}
                    placeholder="Nome do Apresentador"
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={!newWorkTitle.trim() || !newWorkPresenter.trim() || !newWorkId.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm w-full md:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4 max-w-4xl text-left">
                {localWorks.map(work => (
                  <div key={work.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                    <div className="mb-4 sm:mb-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className=\`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full \${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}\`>
                          {work.type === 'poster' ? 'Pôster' : 'Oral'}
                        </span>
                        <div className="text-xs font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white">ID: {work.posterId}</div>
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
                      </div>
                      <div className="font-bold text-slate-900 leading-snug">{work.title}</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">{work.presenterName}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveWork(work.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
                      title="Remover trabalho"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {localWorks.length === 0 && (
                  <p className="text-slate-500 italic text-sm">Nenhum trabalho cadastrado.</p>
                )}
              </div>`;

const worksUiNew = `              <div className="mt-4 mb-8 pt-2 pb-6 border-b border-slate-100 text-left">
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
                      <input
                        type="text"
                        value={newWorkId}
                        onChange={(e) => setNewWorkId(e.target.value)}
                        placeholder="ID (ex: P-101 ou O-202)"
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                      />
                      <select
                        value={newWorkType}
                        onChange={(e) => setNewWorkType(e.target.value as 'poster' | 'oral')}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                      >
                        <option value="poster">Pôster</option>
                        <option value="oral">Comunicação Oral</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={newWorkTematica}
                        onChange={(e) => setNewWorkTematica(e.target.value as Tematica)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                      >
                        {Object.entries(TEMATICAS).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={newWorkTime}
                        onChange={(e) => setNewWorkTime(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                      />
                    </div>
                    <input
                      type="text"
                      value={newWorkTitle}
                      onChange={(e) => setNewWorkTitle(e.target.value)}
                      placeholder="Título do Trabalho"
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    />
                    <input
                      type="text"
                      value={newWorkPresenter}
                      onChange={(e) => setNewWorkPresenter(e.target.value)}
                      placeholder="Nome do Apresentador"
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    />
                    <div className="flex justify-end">
                      <button type="submit" disabled={!newWorkTitle.trim() || !newWorkPresenter.trim() || !newWorkId.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="space-y-8 max-w-4xl text-left">
                {localWorks.length === 0 && (
                  <p className="text-slate-500 italic text-sm">Nenhum trabalho cadastrado.</p>
                )}

                {localWorks.filter(w => w.type === 'poster').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
                      Pôsteres
                    </h3>
                    <div className="space-y-4">
                      {localWorks.filter(w => w.type === 'poster').map(work => (
                        <div key={work.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                          <div className="mb-4 sm:mb-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Pôster</span>
                              <div className="text-xs font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white">ID: {work.posterId}</div>
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
                            </div>
                            <div className="font-bold text-slate-900 leading-snug">{work.title}</div>
                            <div className="text-sm font-medium text-slate-500 mt-1">{work.presenterName}</div>
                          </div>
                          <button 
                            onClick={() => handleRemoveWork(work.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
                            title="Remover trabalho"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {localWorks.filter(w => w.type === 'oral').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                      Comunicações Orais
                    </h3>
                    <div className="space-y-4">
                      {localWorks.filter(w => w.type === 'oral').map(work => (
                        <div key={work.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                          <div className="mb-4 sm:mb-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Oral</span>
                              <div className="text-xs font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 bg-white">ID: {work.posterId}</div>
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
                            </div>
                            <div className="font-bold text-slate-900 leading-snug">{work.title}</div>
                            <div className="text-sm font-medium text-slate-500 mt-1">{work.presenterName}</div>
                          </div>
                          <button 
                            onClick={() => handleRemoveWork(work.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
                            title="Remover trabalho"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>`;

if(code.includes('Adicionar Novo Trabalho')) {
  code = code.replace(worksUiOld, worksUiNew);
} else {
  console.log("Could not find works UI to replace");
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
