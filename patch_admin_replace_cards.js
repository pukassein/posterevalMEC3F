import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldCardsPoster = `                      {sortedWorks.filter(w => w.type === 'poster').map(work => (
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
                      ))}`;

const newCardsPoster = `                      {sortedWorks.filter(w => w.type === 'poster').map(renderWorkCard)}`;

code = code.replace(oldCardsPoster, newCardsPoster);

const oldCardsOral = `                      {sortedWorks.filter(w => w.type === 'oral').map(work => (
                        <div key={work.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
                          <div className="mb-4 sm:mb-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Oral</span>
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
                      ))}`;

const newCardsOral = `                      {sortedWorks.filter(w => w.type === 'oral').map(renderWorkCard)}`;

code = code.replace(oldCardsOral, newCardsOral);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
