const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Add checkboxes for new evaluator
const newEvaluatorCheckboxes = `
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-sm font-bold text-slate-700">Áreas de Avaliação (Opcional):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(TEMATICAS).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <input 
                              type="checkbox" 
                              checked={newEvaluatorAreas.includes(key as Tematica)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewEvaluatorAreas([...newEvaluatorAreas, key as Tematica]);
                                } else {
                                  setNewEvaluatorAreas(newEvaluatorAreas.filter(a => a !== key));
                                }
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" 
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                    `;

code = code.replace(
  /<input\s+type="text"\s+value=\{newEvaluatorCode\}[\s\S]*?placeholder="Código de Acesso"[\s\S]*?\/>/,
  `$&${newEvaluatorCheckboxes}`
);

// Add checkboxes for edit evaluator
const editEvaluatorCheckboxes = `
                            <div className="flex flex-col gap-2 mt-4">
                              <span className="text-sm font-bold text-slate-700">Áreas de Avaliação:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(TEMATICAS).map(([key, label]) => (
                                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                    <input 
                                      type="checkbox" 
                                      checked={editEvaluatorAreas.includes(key as Tematica)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditEvaluatorAreas([...editEvaluatorAreas, key as Tematica]);
                                        } else {
                                          setEditEvaluatorAreas(editEvaluatorAreas.filter(a => a !== key));
                                        }
                                      }}
                                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" 
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                            </div>
`;

code = code.replace(
  /<input\s+type="text"\s+value=\{editEvaluatorCode\}[\s\S]*?className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"[\s\S]*?\/>/,
  `$&${editEvaluatorCheckboxes}`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Part 2 complete');
