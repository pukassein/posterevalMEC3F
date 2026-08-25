const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const topPart = `import React, { useState, useMemo, useEffect } from 'react';
import { Award, FileText, Settings2, Users, Plus, Trash2, CheckSquare, Save, LogOut, ChevronDown, ChevronUp, Printer, UserPlus, Clock, Tag, RefreshCw } from 'lucide-react';
import { Poster, Criterion, Evaluation, Tematica, TEMATICAS, Evaluator } from '../types';
import { fetchFromSupabase } from '../lib/dataSync';

interface AdminPanelProps {
  posters: Poster[];
  assignments: Record<string, string[]>;
  evaluations: Evaluation[];
  criteria: Criterion[];
  evaluators: Evaluator[];
  onSaveAssignments: (assignments: Record<string, string[]>) => void;
  onSaveCriteria: (criteria: Criterion[]) => void;
  onSavePosters: (posters: Poster[]) => void;
  onSaveEvaluators: (evaluators: Evaluator[]) => void;
  onLogout: () => void;
}

export function AdminPanel({ posters, assignments, evaluations, criteria, evaluators = [], onSaveAssignments, onSaveCriteria, onSavePosters, onSaveEvaluators, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'oral' | 'posters'>('oral');
  const [localWorks, setLocalWorks] = useState<Poster[]>(posters);
  const [localCriteria, setLocalCriteria] = useState<Criterion[]>(criteria);
  const [localAssignments, setLocalAssignments] = useState<Record<string, string[]>>(assignments);
  const [localEvaluators, setLocalEvaluators] = useState<Evaluator[]>(evaluators);

  const [newWorkId, setNewWorkId] = useState('');
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkPresenter, setNewWorkPresenter] = useState('');
  const [newWorkType, setNewWorkType] = useState<'poster' | 'oral'>('poster');
  const [newWorkTematica, setNewWorkTematica] = useState<Tematica>('SMA');
  const [newWorkDate, setNewWorkDate] = useState('26/08');
  const [newWorkTime, setNewWorkTime] = useState('');

  const [newCriterionLabel, setNewCriterionLabel] = useState('');
  
  const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [newEvaluatorAreas, setNewEvaluatorAreas] = useState<Tematica[]>([]);
  const [newEvaluatorCode, setNewEvaluatorCode] = useState('');
  const [editEvaluatorAreas, setEditEvaluatorAreas] = useState<Tematica[]>([]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);

  useEffect(() => {
    onSavePosters(localWorks);
  }, [localWorks]);

  useEffect(() => {
    onSaveCriteria(localCriteria);
  }, [localCriteria]);

  useEffect(() => {
    onSaveAssignments(localAssignments);
  }, [localAssignments]);

  useEffect(() => {
    onSaveEvaluators(localEvaluators);
  }, [localEvaluators]);

  const handleAddWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkTitle.trim() || !newWorkPresenter.trim() || !newWorkId.trim()) return;
    
    const newWork: Poster = {
      id: \`W-\${Date.now()}\`,
      posterId: newWorkId.trim().toUpperCase(),
      title: newWorkTitle.trim(),
      presenterName: newWorkPresenter.trim(),
      type: newWorkType,
      tematica: newWorkTematica,
      presentationTime: newWorkTime.trim(),
      presentationDate: newWorkType === 'oral' ? newWorkDate : undefined
    };
    
    setLocalWorks(prev => [...prev, newWork]);
    setNewWorkId('');
    setNewWorkTitle('');
    setNewWorkPresenter('');
    setNewWorkTime('');
  };

  const handleRemoveWork = (id: string) => {
    if (confirm('Tem certeza que deseja remover este trabalho? Todas as avaliações e atribuições associadas também serão perdidas.')) {
      setLocalWorks(prev => prev.filter(w => w.id !== id));
      
      // Cleanup assignments
      setLocalAssignments(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(evId => {
          updated[evId] = updated[evId].filter(wId => wId !== id);
        });
        return updated;
      });
    }
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionLabel.trim()) return;
    
    const newCriterion: Criterion = {
      id: \`crit_\${Date.now()}\`,
      label: newCriterionLabel.trim()
    };
    
    setLocalCriteria(prev => [...prev, newCriterion]);
    setNewCriterionLabel('');
  };

  const handleRemoveCriterion = (id: string) => {
    if (confirm('Atenção: Remover um critério afetará as notas já calculadas. Deseja continuar?')) {
      setLocalCriteria(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddEvaluatorUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvaluatorName.trim()) return;
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newEvaluator: Evaluator = {
      id: \`EV-\${Date.now()}\`,
      name: newEvaluatorName.trim(),
      accessCode: code,
      areas: newEvaluatorAreas
    };
    
    setLocalEvaluators(prev => [...prev, newEvaluator]);
    setNewEvaluatorName('');
    setNewEvaluatorAreas([]);
  };

  const handleRemoveEvaluatorUser = (id: string) => {
    if (confirm('Tem certeza que deseja remover este avaliador? Suas atribuições serão perdidas.')) {
      setLocalEvaluators(prev => prev.filter(e => e.id !== id));
      
      // Cleanup assignments
      setLocalAssignments(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

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

  const handleSyncWorks = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchFromSupabase();
      if (res && res.posters && res.posters.length > 0) {
        setLocalWorks(res.posters);
        alert('Trabalhos sincronizados com sucesso!');
      } else {
        alert('Nenhum trabalho encontrado no banco ou erro na sincronização.');
      }
    } catch (e: any) {
      alert('Erro ao sincronizar: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const setPrintEvaluators = (evals: Evaluator[]) => {
    // print logic placeholder
    window.print();
  };

  const sortedWorks = [...localWorks].sort((a, b) => a.posterId.localeCompare(b.posterId));

  const posterStats = useMemo(() => {
    return localWorks.map(work => {
      const workEvals = evaluations.filter(e => e.posterId === work.id);
      const evalCount = workEvals.length;
      
      let totalScore = 0;
      let maxPossible = 0;
      
      workEvals.forEach(ev => {
        localCriteria.forEach(c => {
          if (ev.scores[c.id]) {
            totalScore += ev.scores[c.id];
            maxPossible += 10;
          }
        });
      });

      const averageScore = evalCount > 0 ? totalScore / evalCount : 0;
      const normalizedMax = evalCount > 0 ? maxPossible / evalCount : 0;

      return {
        id: work.id,
        posterId: work.posterId,
        title: work.title,
        presenterName: work.presenterName,
        evalCount,
        averageScore,
        maxPossible: normalizedMax
      };
    }).sort((a, b) => {
      if (b.evalCount !== a.evalCount) return b.evalCount - a.evalCount;
      return b.averageScore - a.averageScore;
    });
  }, [localWorks, evaluations, localCriteria]);

  const renderWorkCardWithAssign = (work: Poster) => {
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

code = topPart + code;
fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Reconstructed AdminPanel!');
