import React, { useState, useMemo, useEffect } from 'react';
import { Award, FileText, Settings2, Users, Plus, Trash2, CheckSquare, Save, LogOut, ChevronDown, ChevronUp, Printer, UserPlus, Clock, Tag, RefreshCw, Search, X, Download } from 'lucide-react';
import { Poster, Criterion, Evaluation, Tematica, TEMATICAS, Evaluator } from '../types';
import { fetchFromSupabase } from '../lib/dataSync';
import * as XLSX from 'xlsx';

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
  const [activeTematicaOral, setActiveTematicaOral] = useState<Tematica | 'ALL'>('ALL');
  const [activeTematicaPoster, setActiveTematicaPoster] = useState<Tematica | 'ALL'>('ALL');
  const [localWorks, setLocalWorks] = useState<Poster[]>(posters);
  const [localCriteria, setLocalCriteria] = useState<Criterion[]>(criteria);
  const [localAssignments, setLocalAssignments] = useState<Record<string, string[]>>(assignments);
  const [localEvaluators, setLocalEvaluators] = useState<Evaluator[]>(evaluators);

  const [activeDateOral, setActiveDateOral] = useState<string | 'ALL'>('ALL');
  const [evaluatorCountFilterOral, setEvaluatorCountFilterOral] = useState<string>('ALL');
  const [evaluatorCountFilterPoster, setEvaluatorCountFilterPoster] = useState<string>('ALL');
  const [searchOral, setSearchOral] = useState('');
  const [searchPoster, setSearchPoster] = useState('');
  const [searchAssignments, setSearchAssignments] = useState('');
  const [searchEvaluators, setSearchEvaluators] = useState('');
  const [searchAssignmentEvaluators, setSearchAssignmentEvaluators] = useState('');
  const [isImportingAssignments, setIsImportingAssignments] = useState(false);
  const [assignmentEditorId, setAssignmentEditorId] = useState<string | null>(null);
  const [assignmentCodes, setAssignmentCodes] = useState('');
  const [resultsTematicaFilter, setResultsTematicaFilter] = useState<Tematica | 'ALL'>('ALL');
  const [resultsTypeFilter, setResultsTypeFilter] = useState<'ALL' | 'oral' | 'poster'>('ALL');

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
  const [editingEvaluatorId, setEditingEvaluatorId] = useState<string | null>(null);
  const [editEvaluatorName, setEditEvaluatorName] = useState('');
  
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
      id: `W-${Date.now()}`,
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
      id: `crit_${Date.now()}`,
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
      id: `EV-${Date.now()}`,
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

  const handleEditEvaluatorClick = (ev: Evaluator) => {
    setEditingEvaluatorId(ev.id);
    setEditEvaluatorName(ev.name);
    setEditEvaluatorAreas(ev.areas || []);
  };

  const handleSaveEvaluator = (id: string) => {
    if (!editEvaluatorName.trim()) return;
    setLocalEvaluators(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, name: editEvaluatorName.trim(), areas: editEvaluatorAreas };
      }
      return e;
    }));
    setEditingEvaluatorId(null);
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

  const [printEvaluatorsList, setPrintEvaluatorsList] = useState<Evaluator[] | null>(null);

  const handlePrintEvaluators = (evals: Evaluator[]) => {
    setPrintEvaluatorsList(evals);
  };

  const handleExportEvaluators = () => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      ['Avaliador', 'Código de Acesso'],
      ...filteredEvaluators.map(ev => [ev.name, ev.accessCode])
    ].map(row => row.map(escapeCsv).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliadores_codigos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const normalizePosterCode = (value: string) => {
    const match = value.trim().toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)-?(\d+)$/);
    return match ? `${match[1]}${match[2].padStart(3, '0')}` : value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const handleImportAssignments = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsImportingAssignments(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });
      const posterMap = new Map(localWorks.map(work => [normalizePosterCode(work.posterId), work.id]));
      const evaluatorsByName = new Map<string, Evaluator>(localEvaluators.map(ev => [ev.name.trim().toLocaleLowerCase(), ev] as [string, Evaluator]));
      const nextEvaluators = [...localEvaluators];
      const usedAccessCodes = new Set(localEvaluators.map(ev => ev.accessCode));
      const nextAssignments = { ...localAssignments };
      const unmatched: string[] = [];
      const duplicates: string[] = [];
      let importedAssignments = 0;

      rows.slice(1).forEach(row => {
        const hasSeparateCodeColumn = String(row[1] || '').trim().length > 0;
        const codes = hasSeparateCodeColumn ? String(row[0] || '').split(',').map(code => code.trim()).filter(Boolean) : [];
        const name = String(hasSeparateCodeColumn ? row[1] : row[0] || '').trim();
        if (!name) return;
        const key = name.toLocaleLowerCase();
        let evaluator = evaluatorsByName.get(key);
        if (!evaluator) {
          let accessCode = '';
          do {
            accessCode = Math.floor(1000 + Math.random() * 9000).toString();
          } while (usedAccessCodes.has(accessCode));
          usedAccessCodes.add(accessCode);
          evaluator = { id: `EV-${Date.now()}-${nextEvaluators.length}`, name, accessCode, areas: [] };
          evaluatorsByName.set(key, evaluator);
          nextEvaluators.push(evaluator);
        }
        const assignments = new Set(nextAssignments[evaluator.id] || []);
        codes.forEach(code => {
          const workId = posterMap.get(normalizePosterCode(code));
          if (!workId) {
            unmatched.push(`${name}: ${code}`);
          } else if (assignments.has(workId)) {
            duplicates.push(`${name}: ${code}`);
          } else {
            assignments.add(workId);
            importedAssignments++;
          }
        });
        nextAssignments[evaluator.id] = Array.from(assignments);
      });

      setLocalEvaluators(nextEvaluators);
      setLocalAssignments(nextAssignments);
      alert(`Importação concluída: ${nextEvaluators.length - localEvaluators.length} avaliador(es) novo(s) e ${importedAssignments} atribuição(ões).${unmatched.length ? `\n\nNão encontrados (${unmatched.length}):\n${unmatched.join('\n')}` : ''}${duplicates.length ? `\n\nDuplicados ignorados (${duplicates.length}):\n${duplicates.join('\n')}` : ''}`);
    } catch (error: any) {
      alert('Erro ao importar a planilha: ' + error.message);
    } finally {
      setIsImportingAssignments(false);
    }
  };

  const handleAssignPastedCodes = (evaluatorId: string) => {
    const posterMap = new Map(localWorks.map(work => [normalizePosterCode(work.posterId), work.id]));
    const codes = assignmentCodes.split(/[\s,;]+/).map(code => code.trim()).filter(Boolean);
    const nextAssignments = { ...localAssignments, [evaluatorId]: [...(localAssignments[evaluatorId] || [])] };
    const assigned = new Set(nextAssignments[evaluatorId]);
    const unmatched: string[] = [];
    codes.forEach(code => {
      const workId = posterMap.get(normalizePosterCode(code));
      if (workId) assigned.add(workId); else unmatched.push(code);
    });
    nextAssignments[evaluatorId] = Array.from(assigned);
    setLocalAssignments(nextAssignments);
    setAssignmentCodes('');
    setAssignmentEditorId(null);
    if (unmatched.length) alert(`Não encontrados: ${unmatched.join(', ')}`);
  };

  const handleResetEvaluators = () => {
    if (!confirm('Isso excluirá todos os avaliadores e todas as atribuições. Trabalhos e avaliações serão mantidos. Continuar?')) return;
    setLocalEvaluators([]);
    setLocalAssignments({});
    setAssignmentEditorId(null);
  };

  const sortedWorks = [...localWorks].sort((a, b) => a.posterId.localeCompare(b.posterId));

  const filteredEvaluators = [...localEvaluators]
    .filter(ev => !searchEvaluators.trim() || ev.name.toLocaleLowerCase().includes(searchEvaluators.toLocaleLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  const presentationDates = useMemo(() => {
    const dates = new Set<string>();
    localWorks.forEach(w => {
      if (w.type === 'oral' && w.presentationDate) dates.add(w.presentationDate);
    });
    return Array.from(dates).sort();
  }, [localWorks]);

  const getAssignedEvaluatorCount = (workId: string) => {
    const work = localWorks.find(item => item.id === workId);
    return Object.keys(localAssignments).filter(evId => (localAssignments[evId] || []).some(assignment =>
      assignment === workId || (work && normalizePosterCode(assignment) === normalizePosterCode(work.posterId))
    )).length;
  };

  const filterByEvaluatorCount = (count: number, filter: string) => {
    if (filter === 'ALL') return true;
    if (filter === '0') return count === 0;
    if (filter === '1') return count === 1;
    if (filter === '2') return count === 2;
    if (filter === '3+') return count >= 3;
    return true;
  };

  const matchesSearch = (work: Poster, query: string) => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    return work.title.toLowerCase().includes(lowerQuery) || 
           work.posterId.toLowerCase().includes(lowerQuery) || 
           work.presenterName.toLowerCase().includes(lowerQuery);
  };

  const posterStats = useMemo(() => {
    let filteredWorks = localWorks;
    
    if (resultsTypeFilter !== 'ALL') {
      filteredWorks = filteredWorks.filter(w => w.type === resultsTypeFilter);
    }
    
    if (resultsTematicaFilter !== 'ALL') {
      filteredWorks = filteredWorks.filter(w => w.tematica === resultsTematicaFilter);
    }

    return filteredWorks.map(work => {
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
        type: work.type,
        tematica: work.tematica,
        evalCount,
        averageScore,
        maxPossible: normalizedMax
      };
    }).sort((a, b) => {
      if (b.evalCount !== a.evalCount) return b.evalCount - a.evalCount;
      return b.averageScore - a.averageScore;
    });
  }, [localWorks, evaluations, localCriteria, resultsTypeFilter, resultsTematicaFilter]);

  const renderWorkCardWithAssign = (work: Poster) => {
    const isExpanded = expandedWorkId === work.id;
    const assignedEvaluatorIds = Object.keys(localAssignments).filter(evId => (localAssignments[evId] || []).some(assignment =>
      assignment === work.id || normalizePosterCode(assignment) === normalizePosterCode(work.posterId)
    ));
    
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
      <div key={work.id} className={`flex flex-col p-4 border rounded-xl relative cursor-pointer transition-colors ${getTematicaColor(work.tematica)}`} onClick={() => setExpandedWorkId(isExpanded ? null : work.id)}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div className="mb-4 sm:mb-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
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
              <>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchAssignmentEvaluators}
                    onChange={(e) => setSearchAssignmentEvaluators(e.target.value)}
                    placeholder="Buscar avaliador..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                {localEvaluators
                  .filter(ev => !searchAssignmentEvaluators.trim() || ev.name.toLocaleLowerCase().includes(searchAssignmentEvaluators.toLocaleLowerCase()))
                  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
                  .map(ev => {
                  const isAssigned = (localAssignments[ev.id] || []).some(assignment =>
                    assignment === work.id || normalizePosterCode(assignment) === normalizePosterCode(work.posterId)
                  );
                  const isMatch = ev.areas?.includes(work.tematica as Tematica);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => handleToggleAssignmentFromWork(work.id, ev.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center ${
                        isAssigned 
                          ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm ring-1 ring-teal-200 ring-offset-1' 
                          : isMatch
                            ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isAssigned && <CheckSquare className="w-3 h-3 mr-1.5" />}
                      {!isAssigned && <div className="w-3 h-3 mr-1.5 border border-slate-300 rounded-sm" />}
                      {ev.name} {isMatch && !isAssigned && <span className="ml-1 text-[10px] text-amber-700 opacity-80">(Recomendado)</span>}
                    </button>
                  );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };


  
  if (printEvaluatorsList) {
    return (
      <div className="bg-white text-black p-8 print:p-2 min-h-screen w-full">
        <style>
          {`
            @media print {
              @page { margin: 1cm; }
              body { background: white; }
              .page-break { page-break-after: always; }
              .print-guide { break-inside: avoid; }
              tr { break-inside: avoid; }
              .print-page-number::after { content: "Página " counter(page) " / " counter(pages); }
            }
          `}
        </style>
        <div className="mb-8 flex gap-4 print:hidden">
          <button className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition" onClick={() => setPrintEvaluatorsList(null)}>Voltar</button>
          <button className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition flex items-center gap-2" onClick={() => window.print()}>
            <Printer className="w-5 h-5" /> Imprimir Agora
          </button>
        </div>
        {printEvaluatorsList.map((ev, index) => {
          const assignedWorks = (localAssignments[ev.id] || [])
            .map(assignment => localWorks.find(w => w.id === assignment || normalizePosterCode(assignment) === normalizePosterCode(w.posterId)))
            .filter(Boolean) as Poster[];
            
          assignedWorks.sort((a, b) => {
            const dateA = a.presentationDate || '';
            const dateB = b.presentationDate || '';
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            const timeA = a.presentationTime || '';
            const timeB = b.presentationTime || '';
            if (timeA !== timeB) return timeA.localeCompare(timeB);
            return a.posterId.localeCompare(b.posterId);
          });

          const workGroups = [
            { label: 'Pôsteres', works: assignedWorks.filter(w => w.type === 'poster') },
            { label: 'Comunicação Oral', works: assignedWorks.filter(w => w.type === 'oral') },
          ].filter(group => group.works.length > 0);
            
          return (
            <div key={ev.id} className={`print-guide ${index < printEvaluatorsList.length - 1 ? 'page-break mb-12 pb-12 border-b-2 border-slate-200 print:border-none print:mb-0 print:pb-0' : ''}`}>
              <div className="flex justify-between items-center mb-4 print:mb-2">
                <h1 className="text-3xl print:text-xl font-bold">Guia do Avaliador</h1>
                <img src="https://www.mec3f.com/logomec3f.png" alt="Logo MEC3F" className="h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="mb-8 p-6 print:mb-3 print:p-3 border-2 border-slate-900 rounded-xl bg-slate-50 print:bg-transparent flex justify-between items-center gap-4">
                <div>
                    <p className="text-2xl print:text-lg font-bold mb-2 print:mb-1">{ev.name}</p>
                  <div className="flex flex-wrap gap-4 print:gap-2 items-center mb-2 print:mb-1">
                    <p className="text-lg print:text-sm">Código de Acesso: <span className="font-mono bg-slate-200 px-2 py-1 print:px-1 print:py-0 rounded text-slate-900">{ev.accessCode}</span></p>
                    {ev.areas && ev.areas.length > 0 && <p className="text-slate-600">Áreas: {ev.areas.join(', ')}</p>}
                  </div>
                  <p className="text-sm text-slate-500">Acesse o sistema em: <strong className="text-slate-900">{window.location.origin}</strong></p>
                </div>
                <div className="flex-shrink-0 bg-white p-2 print:p-1 border border-slate-200 rounded-lg">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin)}`} alt="QR Code" className="w-20 h-20 print:w-14 print:h-14" />
                </div>
              </div>
              
              <h2 className="text-xl print:text-base font-bold mb-4 print:mb-2 flex items-center gap-2">
                Trabalhos Atribuídos 
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-sm">{assignedWorks.length}</span>
              </h2>
              <div className="mb-4 print:mb-2 p-3 border border-slate-300 rounded-lg bg-slate-50 print:bg-transparent text-xs leading-relaxed">
                <p className="font-bold mb-1">Como avaliar</p>
                <p>Avalie cada trabalho de 0 a 10 considerando: apresentação visual, mérito científico, metodologia, clareza dos resultados e defesa oral. Use comentários construtivos quando necessário.</p>
                <p className="mt-1 font-semibold">Se houver algum problema com a plataforma, use esta página como ficha de avaliação: preencha a nota de cada trabalho e entregue-a à organização.</p>
              </div>
              {assignedWorks.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum trabalho atribuído no momento.</p>
              ) : (
                <div className="space-y-5 print:space-y-3">
                  {workGroups.map(group => (
                    <section key={group.label}>
                      <h3 className="text-lg print:text-sm font-bold mb-2 print:mb-1">{group.label} ({group.works.length})</h3>
                      <table className="w-full border-collapse border border-slate-300 text-xs">
                        <thead>
                          <tr>
                            <th colSpan={6} className="border border-slate-300 p-2 text-left">
                              <div className="flex justify-between items-center">
                                <span>{ev.name} — Código: {ev.accessCode}</span>
                                <span className="print-page-number" />
                              </div>
                            </th>
                          </tr>
                          <tr className="bg-slate-50">
                            <th className="border border-slate-300 p-1.5 text-left whitespace-nowrap">ID</th>
                            <th className="border border-slate-300 p-1.5 text-left whitespace-nowrap">Tipo / Área</th>
                            <th className="border border-slate-300 p-1.5 text-left">Título</th>
                            <th className="border border-slate-300 p-1.5 text-left min-w-[140px]">Apresentador</th>
                            <th className="border border-slate-300 p-1.5 text-left whitespace-nowrap">Nota (0–10)</th>
                            <th className="border border-slate-300 p-1.5 text-left whitespace-nowrap">Horário</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.works.map(w => (
                            <tr key={w.id}>
                              <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-700 whitespace-nowrap">{w.posterId}</td>
                              <td className="border border-slate-300 p-1.5 whitespace-nowrap">
                                <span className="font-bold uppercase text-xs text-slate-900">{w.type}</span><br/>
                                <span className="text-xs text-slate-500">{w.tematica}</span>
                              </td>
                              <td className="border border-slate-300 p-1.5 font-medium text-slate-900">{w.title}</td>
                              <td className="border border-slate-300 p-1.5 text-slate-600">{w.presenterName}</td>
                              <td className="border border-slate-300 p-1.5 h-8 min-w-[70px]">&nbsp;</td>
                              <td className="border border-slate-300 p-1.5 text-slate-600 whitespace-nowrap">
                                {w.type === 'oral' && w.presentationDate ? w.presentationDate : ''}
                                {w.type === 'oral' && w.presentationDate && w.presentationTime ? <br/> : ''}
                                {w.presentationTime || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header Tabs */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 pb-1 pt-2 flex-1">
            <button 
              onClick={() => setActiveTab('results')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'results' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Award className="w-4 h-4 mr-1 sm:mr-2" />
              Resultados
            </button>
            <button 
              onClick={() => setActiveTab('evaluators')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'evaluators' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
              Avaliadores
            </button>
            <button 
              onClick={() => setActiveTab('oral')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'oral' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              Comunicação Oral
            </button>
            <button 
              onClick={() => setActiveTab('posters')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'posters' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              Pôsteres
            </button>
            <button 
              onClick={() => setActiveTab('assignments')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'assignments' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Users className="w-4 h-4 mr-1 sm:mr-2" />
              Atribuições
            </button>
            <button 
              onClick={() => setActiveTab('criteria')}
              className={`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center ${activeTab === 'criteria' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Settings2 className="w-4 h-4 mr-1 sm:mr-2" />
              Critérios
            </button>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 shrink-0 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center border border-slate-200"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full p-4 pb-12 space-y-6 mt-4">
        
        {/* TAB: RESULTS */}
        {activeTab === 'results' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">Desempenho dos Trabalhos</h2>
                 <p className="text-sm text-slate-500 mt-1">Ranking baseado na média total das avaliações concluídas.</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Trabalho</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setResultsTypeFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsTypeFilter === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos</button>
                  <button onClick={() => setResultsTypeFilter('oral')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsTypeFilter === 'oral' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Comunicação Oral</button>
                  <button onClick={() => setResultsTypeFilter('poster')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsTypeFilter === 'poster' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Pôsteres</button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Área Temática</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setResultsTematicaFilter('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${resultsTematicaFilter === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>
                  {(Object.keys(TEMATICAS) as Tematica[]).map(t => (
                    <button key={t} onClick={() => setResultsTematicaFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${resultsTematicaFilter === t ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 rounded-tl-xl w-24">Rank</th>
                    <th className="p-4 w-32">ID</th>
                    <th className="p-4 w-32">Tipo / Área</th>
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
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="p-4 text-sm font-mono font-bold text-slate-600">{stat.posterId}</td>
                      <td className="p-4">
                        <div className="text-xs font-bold uppercase text-slate-900">{stat.type === 'oral' ? 'Oral' : 'Pôster'}</div>
                        <div className="text-xs text-slate-500 font-medium">{stat.tematica}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 leading-snug">{stat.title}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{stat.presenterName}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full ${stat.evalCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
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
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sincronizar Trabalhos do Banco do Evento
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWork(!showAddWork)}
                  className="flex items-center justify-between w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
                >
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Adicionar Novo Trabalho</span>
                  <Plus className={`w-5 h-5 text-slate-600 transition-transform ${showAddWork ? 'rotate-45' : ''}`} />
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
                        <input type="text" placeholder="Horário (ex: 14:30)" value={newWorkTime} onChange={(e) => setNewWorkTime(e.target.value)} className={`px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors ${newWorkType === 'oral' ? 'w-1/3' : 'w-full'}`} />
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


        {/* TAB: ORAL */}
        {activeTab === 'oral' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por título, ID ou apresentador..." 
                  value={searchOral} 
                  onChange={(e) => setSearchOral(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
              </div>
              
              <select 
                value={evaluatorCountFilterOral} 
                onChange={(e) => setEvaluatorCountFilterOral(e.target.value)} 
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-600"
              >
                <option value="ALL">Qualquer nº de Avaliadores</option>
                <option value="0">Sem avaliadores</option>
                <option value="1">1 Avaliador</option>
                <option value="2">2 Avaliadores</option>
                <option value="3+">3 ou mais Avaliadores</option>
              </select>

              <select 
                value={activeDateOral} 
                onChange={(e) => setActiveDateOral(e.target.value)} 
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-600"
              >
                <option value="ALL">Todas as Datas</option>
                {presentationDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTematicaOral('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTematicaOral === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Todos
              </button>
              {(Object.entries(TEMATICAS) as [Tematica, string][]).map(([key, label]) => (
                <button 
                  key={key}
                  onClick={() => setActiveTematicaOral(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTematicaOral === key ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {key} - {label.split(' - ')[0]}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorks
                .filter(w => w.type === 'oral' && 
                             (activeTematicaOral === 'ALL' || w.tematica === activeTematicaOral) &&
                             (activeDateOral === 'ALL' || w.presentationDate === activeDateOral) &&
                             filterByEvaluatorCount(getAssignedEvaluatorCount(w.id), evaluatorCountFilterOral) &&
                             matchesSearch(w, searchOral))
                .map(renderWorkCardWithAssign)}
            </div>
            
            {sortedWorks.filter(w => w.type === 'oral' && 
                             (activeTematicaOral === 'ALL' || w.tematica === activeTematicaOral) &&
                             (activeDateOral === 'ALL' || w.presentationDate === activeDateOral) &&
                             filterByEvaluatorCount(getAssignedEvaluatorCount(w.id), evaluatorCountFilterOral) &&
                             matchesSearch(w, searchOral)).length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 italic">Nenhum trabalho de comunicação oral encontrado para esta seleção.</p>
              </div>
            )}
          </div>
        )}


        {/* TAB: POSTERS */}
        {activeTab === 'posters' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por título, ID ou apresentador..." 
                  value={searchPoster} 
                  onChange={(e) => setSearchPoster(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
              </div>
              
              <select 
                value={evaluatorCountFilterPoster} 
                onChange={(e) => setEvaluatorCountFilterPoster(e.target.value)} 
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-600"
              >
                <option value="ALL">Qualquer nº de Avaliadores</option>
                <option value="0">Sem avaliadores</option>
                <option value="1">1 Avaliador</option>
                <option value="2">2 Avaliadores</option>
                <option value="3+">3 ou mais Avaliadores</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTematicaPoster('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTematicaPoster === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Todos
              </button>
              {(Object.entries(TEMATICAS) as [Tematica, string][]).map(([key, label]) => (
                <button 
                  key={key}
                  onClick={() => setActiveTematicaPoster(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTematicaPoster === key ? 'bg-indigo-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {key} - {label.split(' - ')[0]}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorks
                .filter(w => w.type === 'poster' && 
                             (activeTematicaPoster === 'ALL' || w.tematica === activeTematicaPoster) &&
                             filterByEvaluatorCount(getAssignedEvaluatorCount(w.id), evaluatorCountFilterPoster) &&
                             matchesSearch(w, searchPoster))
                .map(renderWorkCardWithAssign)}
            </div>
            
            {sortedWorks.filter(w => w.type === 'poster' && 
                             (activeTematicaPoster === 'ALL' || w.tematica === activeTematicaPoster) &&
                             filterByEvaluatorCount(getAssignedEvaluatorCount(w.id), evaluatorCountFilterPoster) &&
                             matchesSearch(w, searchPoster)).length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 italic">Nenhum pôster encontrado para esta seleção.</p>
              </div>
            )}
          </div>
        )}


        {/* TAB: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Gerenciar Atribuições</h2>
                  <p className="text-sm text-slate-500 mt-1">Veja quais trabalhos estão atribuídos a cada avaliador e remova atribuições se necessário.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportAssignments} className="hidden" />
                    {isImportingAssignments ? 'Importando...' : 'Importar planilha'}
                  </label>
                  <div className="relative w-full sm:w-64 shrink-0">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar avaliador..." 
                      value={searchAssignments} 
                      onChange={(e) => setSearchAssignments(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {localEvaluators.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhum avaliador cadastrado.</p>
                ) : (
                  localEvaluators
                  .filter(ev => !searchAssignments.trim() || ev.name.toLowerCase().includes(searchAssignments.toLowerCase()))
                  .map(ev => {
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
                              <div key={work.id} className="text-sm p-3 bg-white border border-slate-200 rounded-lg shadow-sm flex items-start gap-2 relative group pr-8">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 shrink-0 ${work.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {work.posterId}
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900 leading-tight">{work.title}</div>
                                </div>
                                <button
                                  onClick={() => handleToggleAssignmentFromWork(work.id, ev.id)}
                                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remover atribuição"
                                >
                                  <X className="w-4 h-4" />
                                </button>
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

{/* TAB: CRITERIA */}
        {activeTab === 'criteria' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 text-left gap-4 sm:gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Definições de Critérios</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Esses critérios aparecerão nos formulários de todos os avaliadores.
                    Você não poderá editar uma nota existente se o critério for deletado.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  
                </div>
              </div>

              <div className="space-y-4 max-w-2xl text-left">
                {localCriteria.map(criterion => (
                  <div key={criterion.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="mb-2 sm:mb-0">
                      <div className="font-bold text-slate-900">{criterion.label}</div>
                      <div className="text-xs font-mono text-slate-400 mt-1">ID: {criterion.id}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveCriterion(criterion.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center self-start sm:self-auto shrink-0"
                      title="Remover critério"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Adicionar Novo Critério</h3>
                <form onSubmit={handleAddCriterion} className="flex flex-col md:flex-row gap-3 max-w-2xl">
                  <input
                    type="text"
                    value={newCriterionLabel}
                    onChange={(e) => setNewCriterionLabel(e.target.value)}
                    placeholder="Ex: Qualidade da Resposta"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                  />
                  <button type="submit" disabled={!newCriterionLabel.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Adicionar</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        
        {/* TAB: EVALUATORS */}
        {activeTab === 'evaluators' && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <UserPlus className="w-5 h-5 mr-3 text-teal-600 shrink-0" />
                    Gerenciar Avaliadores
                  </h2>
                  {localEvaluators.length > 0 && (
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={handleExportEvaluators}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-bold text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Exportar Excel
                      </button>
                      <button
                        onClick={handleResetEvaluators}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-bold text-sm"
                      >
                        Limpar Avaliadores
                      </button>
                      <button
                        onClick={() => handlePrintEvaluators(filteredEvaluators)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-bold text-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir Todos
                      </button>
                    </div>
                  )}
                </div>

                
              </div>

              <form onSubmit={handleAddEvaluatorUser} className="flex flex-col gap-3 mb-8 max-w-2xl bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div className="flex flex-col md:flex-row gap-3">
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
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Áreas de Atuação (Recomendação)</span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(TEMATICAS) as Tematica[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setNewEvaluatorAreas(prev => 
                            prev.includes(t) ? prev.filter(area => area !== t) : [...prev, t]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          newEvaluatorAreas.includes(t) 
                            ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="relative mb-5 max-w-2xl">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchEvaluators}
                  onChange={(e) => setSearchEvaluators(e.target.value)}
                  placeholder="Buscar avaliador por nome..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                />
              </div>

              <div className="space-y-3">
                {localEvaluators.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">Nenhum avaliador cadastrado. Crie um acima.</p>
                ) : filteredEvaluators.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">Nenhum avaliador encontrado.</p>
                ) : (
                  filteredEvaluators.map(ev => (
                    <div key={ev.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                      {editingEvaluatorId === ev.id ? (
                        <div className="flex-1 flex flex-col gap-3">
                          <input
                            type="text"
                            value={editEvaluatorName}
                            onChange={(e) => setEditEvaluatorName(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors w-full sm:max-w-md"
                          />
                          <div className="flex flex-wrap gap-2">
                            {(Object.keys(TEMATICAS) as Tematica[]).map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  setEditEvaluatorAreas(prev => 
                                    prev.includes(t) ? prev.filter(area => area !== t) : [...prev, t]
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  editEvaluatorAreas.includes(t) 
                                    ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-mono font-bold text-lg shadow-sm border border-teal-200 shrink-0">
                            {ev.accessCode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="font-bold text-slate-900">{ev.name}</div>
                              <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                                {(localAssignments[ev.id] || []).length} trabalho(s) atribuído(s)
                              </span>
                            </div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5">Código de Acesso: {ev.accessCode}</div>
                            {ev.areas && ev.areas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ev.areas.map(area => (
                                  <span key={area} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {editingEvaluatorId === ev.id ? (
                          <>
                            <button 
                              onClick={() => handleSaveEvaluator(ev.id)}
                              className="text-white bg-teal-600 hover:bg-teal-700 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Salvar"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingEvaluatorId(null)}
                              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setAssignmentEditorId(assignmentEditorId === ev.id ? null : ev.id); setAssignmentCodes(''); }}
                              className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Atribuir trabalhos por código"
                            >
                              <Tag className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handlePrintEvaluators([ev])}
                              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Imprimir guia do avaliador"
                            >
                              <Printer className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleEditEvaluatorClick(ev)}
                              className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Editar avaliador"
                            >
                              <Settings2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleRemoveEvaluatorUser(ev.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Remover avaliador"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {assignmentEditorId === ev.id && editingEvaluatorId !== ev.id && (
                        <div className="w-full sm:w-80 flex flex-col gap-2 sm:order-3">
                          <textarea
                            value={assignmentCodes}
                            onChange={(e) => setAssignmentCodes(e.target.value)}
                            placeholder="Cole os códigos: ENS-092, ENS-081, SMA-025"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 resize-none"
                          />
                          <button
                            onClick={() => handleAssignPastedCodes(ev.id)}
                            disabled={!assignmentCodes.trim()}
                            className="bg-teal-600 disabled:bg-slate-300 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-teal-700"
                          >
                            Atribuir códigos
                          </button>
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}
