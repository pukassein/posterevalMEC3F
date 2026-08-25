import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const addWorkUiOld = `                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>`;

const addWorkUiNew = `                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newWorkTematica}
                      onChange={(e) => setNewWorkTematica(e.target.value as Tematica)}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                    >
                      {Object.entries(TEMATICAS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      {newWorkType === 'oral' && (
                        <select
                          value={newWorkDate}
                          onChange={(e) => setNewWorkDate(e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                        >
                          <option value="26/08">Quarta-feira 26/08</option>
                          <option value="27/08">Quinta-feira 27/08</option>
                          <option value="28/08">Sexta-feira 28/08</option>
                        </select>
                      )}
                      <input
                        type="time"
                        value={newWorkTime}
                        onChange={(e) => setNewWorkTime(e.target.value)}
                        className={\`px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors \${newWorkType === 'oral' ? 'w-1/3' : 'w-full'}\`}
                      />
                    </div>
                  </div>`;

if(code.includes(addWorkUiOld)) {
  code = code.replace(addWorkUiOld, addWorkUiNew);
} else {
  console.log("Could not find Add Work UI");
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
