import React, { useState, useMemo, useEffect } from 'react';
import { Award, FileText, Settings2, Users, Plus, Trash2, CheckSquare, Save, LogOut, ChevronDown, ChevronUp, Printer, UserPlus, Clock, Tag, RefreshCw, Search, X, Download, Pencil } from 'lucide-react';
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
  onClearEvaluation: (posterId: string) => void;
  onLogout: () => void;
}

export function AdminPanel({ posters, assignments, evaluations, criteria, evaluators = [], onSaveAssignments, onSaveCriteria, onSavePosters, onSaveEvaluators, onClearEvaluation, onLogout }: AdminPanelProps) {
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
  const [resultsSort, setResultsSort] = useState<'score' | 'poster' | 'id'>('score');
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsEvaluationFilter, setResultsEvaluationFilter] = useState<'ALL' | 'EVALUATED' | 'PENDING'>('ALL');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
  const [assignmentWorkId, setAssignmentWorkId] = useState<string | null>(null);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editWorkTitle, setEditWorkTitle] = useState('');
  const [editWorkPresenter, setEditWorkPresenter] = useState('');
  const [editWorkCode, setEditWorkCode] = useState('');
  const [editWorkTematica, setEditWorkTematica] = useState<Tematica>('SMA');
  const [editWorkDate, setEditWorkDate] = useState('');
  const [editWorkTime, setEditWorkTime] = useState('');
  const [editWorkEvaluationStatus, setEditWorkEvaluationStatus] = useState<Poster['evaluationStatus']>('presented');

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

  const handleEditWorkClick = (work: Poster) => {
    setEditingWorkId(work.id);
    setEditWorkTitle(work.title);
    setEditWorkPresenter(work.presenterName);
    setEditWorkCode(work.posterId);
    setEditWorkTematica(work.tematica || 'SMA');
    setEditWorkDate(work.presentationDate || '');
    setEditWorkTime(work.presentationTime || '');
    setEditWorkEvaluationStatus(work.evaluationStatus === 'absent' || work.evaluationStatus === 'not-evaluated' ? 'absent' : 'presented');
  };

  const handleSaveWork = (id: string) => {
    if (!editWorkTitle.trim() || !editWorkPresenter.trim() || !editWorkCode.trim()) return;
    setLocalWorks(prev => prev.map(work => work.id === id ? {
      ...work,
      title: editWorkTitle.trim(),
      presenterName: editWorkPresenter.trim(),
      posterId: editWorkCode.trim().toUpperCase(),
      tematica: editWorkTematica,
      presentationDate: work.type === 'oral' ? editWorkDate : undefined,
      presentationTime: editWorkTime.trim(),
      evaluationStatus: editWorkEvaluationStatus === 'absent' ? 'absent' : 'presented'
    } : work));
    setEditingWorkId(null);
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
  const [podiumSelection, setPodiumSelection] = useState<string[]>([]);
  const [showPodiumPrint, setShowPodiumPrint] = useState(false);
  const [showAllPodiumsPrint, setShowAllPodiumsPrint] = useState(false);
  const [evaluationActionId, setEvaluationActionId] = useState<string | null>(null);
  const [workSettingsOpen, setWorkSettingsOpen] = useState(false);
  const [evaluatorSettingsOpen, setEvaluatorSettingsOpen] = useState(false);

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
      assignment === workId || (work && (() => {
        const assignedWork = localWorks.find(item => item.id === assignment);
        return normalizePosterCode(assignedWork?.posterId || assignment) === normalizePosterCode(work.posterId);
      })())
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

  const isWorkAbsent = (work: Poster) => work.evaluationStatus === 'absent' || work.evaluationStatus === 'not-evaluated';
  const isWorkEvaluated = (work: Poster) => !isWorkAbsent(work) && evaluations.some(evaluation => evaluation.posterId === work.id);

  const toggleAttendance = (statId: string, status: 'presented' | 'absent') => {
    const target = localWorks.find(work => work.id === statId);
    if (!target) return;
    const targetCode = normalizePosterCode(target.posterId);
    setLocalWorks(prev => prev.map(work => normalizePosterCode(work.posterId) === targetCode
      ? { ...work, evaluationStatus: status }
      : work));
  };

  const posterStats = useMemo(() => {
    let filteredWorks = localWorks;
    
    if (resultsTypeFilter !== 'ALL') {
      filteredWorks = filteredWorks.filter(w => w.type === resultsTypeFilter);
    }
    
    if (resultsTematicaFilter !== 'ALL') {
      filteredWorks = filteredWorks.filter(w => w.tematica === resultsTematicaFilter);
    }

    const groups = new Map<string, Poster[]>();
    filteredWorks.forEach(work => { const key = normalizePosterCode(work.posterId); groups.set(key, [...(groups.get(key) || []), work]); });
    return [...groups.entries()].map(([normalizedId, workGroup]) => {
      const work = workGroup[0];
      const workIds = new Set(workGroup.map(item => item.id));
      const workEvals = workGroup.some(item => !isWorkAbsent(item))
        ? evaluations.filter(e => workIds.has(e.posterId))
        : [];
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
      const evaluatorNames = workEvals.map(ev =>
        localEvaluators.find(evaluator => evaluator.id === ev.evaluatorId)?.name || ev.evaluatorId
      );

      return {
        id: work.id,
        posterId: work.posterId,
        allIds: workGroup.map(item => item.posterId),
        title: work.title,
        presenterName: work.presenterName,
        type: work.type,
        tematica: work.tematica,
        evalCount,
        absent: workGroup.every(isWorkAbsent),
        averageScore,
        maxPossible: normalizedMax,
        evaluatorNames,
        comments: workEvals.filter(e => e.generalComments?.trim()).map(e => e.generalComments.trim()),
        normalizedId
      };
    }).sort((a, b) => {
      // Always keep works without evaluations at the end of the results list.
      if (a.evalCount === 0 && b.evalCount > 0) return 1;
      if (a.evalCount > 0 && b.evalCount === 0) return -1;
      if (resultsSort === 'id') return a.normalizedId.localeCompare(b.normalizedId, undefined, { numeric: true });
      if (resultsSort === 'poster') return a.presenterName.localeCompare(b.presenterName, 'pt-BR');
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return b.evalCount - a.evalCount;
    });
  }, [localWorks, evaluations, localCriteria, localEvaluators, resultsTypeFilter, resultsTematicaFilter, resultsSort]);

  const visiblePosterStats = useMemo(() => posterStats.filter(stat => {
    if (resultsEvaluationFilter === 'EVALUATED' && stat.evalCount === 0) return false;
    if (resultsEvaluationFilter === 'PENDING' && stat.evalCount > 0) return false;
    const q = resultsSearch.trim().toLowerCase();
    return !q || stat.allIds.some(id => id.toLowerCase().includes(q)) || stat.title.toLowerCase().includes(q) || stat.presenterName.toLowerCase().includes(q);
  }), [posterStats, resultsSearch, resultsEvaluationFilter]);

  const resultStatusCounts = useMemo(() => {
    const groups = new Map<string, Poster[]>();
    localWorks.filter(work => resultsTypeFilter === 'ALL' || work.type === resultsTypeFilter).forEach(work => {
      groups.set(normalizePosterCode(work.posterId), [...(groups.get(normalizePosterCode(work.posterId)) || []), work]);
    });
    let evaluated = 0;
    groups.forEach(workGroup => {
      if (workGroup.some(work => isWorkEvaluated(work))) evaluated += 1;
    });
    return { total: groups.size, evaluated, pending: groups.size - evaluated };
  }, [localWorks, evaluations, resultsTypeFilter]);

  const selectedPodiumWorks = visiblePosterStats.filter(stat => podiumSelection.includes(stat.id));

  const allPodiumGroups = (['poster', 'oral'] as const).flatMap(type =>
    (Object.keys(TEMATICAS) as Tematica[]).map(tematica => ({
      type,
      tematica,
      works: posterStats.filter(stat => stat.type === type && stat.tematica === tematica && stat.evalCount > 0).slice(0, 3)
    })).filter(group => group.works.length > 0)
  );

  const copyAllPodiums = async () => {
    const text = allPodiumGroups.map(group => [
      `${group.type === 'poster' ? 'PÔSTERES' : 'COMUNICAÇÃO ORAL'} — ${group.tematica}`,
      ...group.works.map((work, index) => `${index + 1}º — ${work.title} — ${work.presenterName} (${work.posterId}) — Nota: ${work.averageScore.toFixed(1)}`)
    ].join('\n')).join('\n\n');
    await navigator.clipboard.writeText(text);
    alert('Resultados dos pódios copiados.');
  };

  const handleExportResults = (type: 'oral' | 'poster', tematica: Tematica) => {
    const rows = posterStats.filter(s => s.type === type && s.tematica === tematica).map(s => ({ ID: s.posterId, 'IDs duplicados': s.allIds.join(', '), Temática: s.tematica, Tipo: type, Título: s.title, Apresentador: s.presenterName, Avaliadores: s.evaluatorNames.join(', '), 'Nº avaliações': s.evalCount, 'Nota média': Number(s.averageScore.toFixed(2)), Comentários: s.comments.join(' | ') }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), `${tematica}-${type}`); XLSX.writeFile(wb, `resultados_${tematica}_${type}.xlsx`);
  };

  const renderWorkCardWithAssign = (work: Poster) => {
    const isExpanded = expandedWorkId === work.id;
    const assignedEvaluatorIds = Object.keys(localAssignments).filter(evId => (localAssignments[evId] || []).some(assignment =>
      assignment === work.id || (() => {
        const assignedWork = localWorks.find(item => item.id === assignment);
        return normalizePosterCode(assignedWork?.posterId || assignment) === normalizePosterCode(work.posterId);
      })()
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
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isWorkEvaluated(work) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <CheckSquare className="w-3 h-3" />
                {isWorkEvaluated(work) ? 'Avaliado' : 'Pendente'}
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
            onClick={(e) => { e.stopPropagation(); handleEditWorkClick(work); }}
            className="text-slate-500 hover:text-teal-700 hover:bg-white p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-12"
            title="Editar trabalho"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveWork(work.id); }}
            className="text-red-500 hover:text-red-700 hover:bg-white p-2 rounded-lg transition-colors flex items-center justify-center sm:absolute sm:top-2 sm:right-2"
            title="Remover trabalho"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {editingWorkId === work.id && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={editWorkCode} onChange={(e) => setEditWorkCode(e.target.value)} placeholder="Código" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <select value={editWorkTematica} onChange={(e) => setEditWorkTematica(e.target.value as Tematica)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                {Object.entries(TEMATICAS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
              <input value={editWorkTitle} onChange={(e) => setEditWorkTitle(e.target.value)} placeholder="Título" className="px-3 py-2 border border-slate-200 rounded-lg text-sm md:col-span-2" />
              <input value={editWorkPresenter} onChange={(e) => setEditWorkPresenter(e.target.value)} placeholder="Apresentador" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <input value={editWorkTime} onChange={(e) => setEditWorkTime(e.target.value)} placeholder="Horário" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              {work.type === 'oral' && <input value={editWorkDate} onChange={(e) => setEditWorkDate(e.target.value)} placeholder="Data (ex.: 26/08)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />}
              <select value={editWorkEvaluationStatus === 'absent' ? 'absent' : 'presented'} onChange={(e) => setEditWorkEvaluationStatus(e.target.value as Poster['evaluationStatus'])} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="presented">Apresentado</option>
                <option value="absent">Ausente — não recebe certificado</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingWorkId(null)} className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="button" onClick={() => handleSaveWork(work.id)} className="px-3 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1"><Save className="w-4 h-4" /> Salvar</button>
            </div>
          </div>
        )}
        
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
                    assignment === work.id || (() => {
                      const assignedWork = localWorks.find(item => item.id === assignment);
                      return normalizePosterCode(assignedWork?.posterId || assignment) === normalizePosterCode(work.posterId);
                    })()
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


  
  if (showAllPodiumsPrint) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 print:p-4">
        <div className="print:hidden flex gap-3 mb-6"><button onClick={() => window.print()} className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold"><Printer className="w-4 h-4 inline mr-2" />Imprimir documento</button><button onClick={() => setShowAllPodiumsPrint(false)} className="px-5 py-2 border rounded-lg font-bold">Voltar</button></div>
        <h1 className="text-4xl font-black text-center mb-10">Resultados dos Pódios</h1>
        <div className="space-y-10 max-w-5xl mx-auto">{allPodiumGroups.map(group => <section key={`${group.type}-${group.tematica}`}><h2 className="text-2xl font-black border-b-2 border-slate-300 pb-2 mb-4">{group.type === 'poster' ? 'Pôsteres' : 'Comunicação Oral'} — {group.tematica}</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{group.works.map((work, index) => <div key={work.id} className="rounded-xl border border-slate-300 p-4"><div className="text-lg font-black">{index + 1}º</div><div className="font-bold mt-2">{work.title}</div><div className="text-sm text-slate-600">{work.presenterName}</div><div className="text-xs font-mono text-slate-500 mt-2">{work.posterId}</div><div className="font-bold text-teal-700 mt-2">Nota: {work.averageScore.toFixed(1)}</div></div>)}</div></section>)}</div>
      </div>
    );
  }

  if (showPodiumPrint) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 print:p-4">
        <div className="print:hidden flex gap-3 mb-6">
          <button onClick={() => window.print()} className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold"><Printer className="w-4 h-4 inline mr-2" />Imprimir / guardar imagem</button>
          <button onClick={() => setShowPodiumPrint(false)} className="px-5 py-2 border rounded-lg font-bold">Voltar</button>
        </div>
        <h1 className="text-4xl font-black text-center mb-2">Podium dos trabalhos</h1>
        <p className="text-center text-slate-600 font-bold mb-10">
          {resultsTypeFilter === 'poster' ? 'Pôsteres' : resultsTypeFilter === 'oral' ? 'Comunicação Oral' : 'Pôsteres e Comunicação Oral'}
          {' · '}{resultsTematicaFilter === 'ALL' ? 'Todas as áreas' : resultsTematicaFilter}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
          {selectedPodiumWorks.map((stat, index) => <div key={stat.id} className={`text-center rounded-2xl p-6 border-2 ${index === 0 ? 'md:order-2 border-amber-400 bg-amber-50 md:-translate-y-6' : index === 1 ? 'md:order-1 border-slate-300 bg-slate-50' : 'md:order-3 border-orange-300 bg-orange-50'}`}><div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">{stat.type === 'poster' ? 'Pôster' : 'Comunicação Oral'}</div><div className="text-5xl font-black mb-4">{index + 1}º</div><div className="font-bold text-xl">{stat.title}</div><div className="text-slate-600 mt-1">{stat.presenterName}</div><div className="text-xs font-mono text-slate-500 mt-5">{stat.posterId}</div></div>)}
        </div>
      </div>
    );
  }

  if (printEvaluatorsList) {
    return (
      <div className="bg-white text-black p-8 print:p-2 min-h-screen w-full">
        <style>
          {`
            @media print {
              @page {
                margin: 1cm;
                @bottom-right { content: "Página " counter(page) " / " counter(pages); font-size: 9pt; color: #334155; }
              }
              body { background: white; }
              .page-break { page-break-after: always; }
              .print-guide { break-inside: avoid; }
              tr { break-inside: avoid; }
              .print-page-number { display: none; }
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status da avaliação</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setResultsEvaluationFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsEvaluationFilter === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos ({resultStatusCounts.total})</button>
                  <button onClick={() => setResultsEvaluationFilter('EVALUATED')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsEvaluationFilter === 'EVALUATED' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Avaliados ({resultStatusCounts.evaluated})</button>
                  <button onClick={() => setResultsEvaluationFilter('PENDING')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${resultsEvaluationFilter === 'PENDING' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Não avaliados ({resultStatusCounts.pending})</button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Área Temática</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setResultsTematicaFilter('ALL'); setResultsSort('score'); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${resultsTematicaFilter === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>
                  {(Object.keys(TEMATICAS) as Tematica[]).map(t => (
                    <button key={t} onClick={() => { setResultsTematicaFilter(t); setResultsSort('score'); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${resultsTematicaFilter === t ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                <input value={resultsSearch} onChange={e => setResultsSearch(e.target.value)} placeholder="Buscar ID, título ou apresentador" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px]" />
                <select value={resultsSort} onChange={e => setResultsSort(e.target.value as typeof resultsSort)} className="border rounded-lg px-3 py-2 text-sm"><option value="score">Ordenar por nota</option><option value="poster">Ordenar por apresentador</option><option value="id">Ordenar por ID</option></select>
                <button type="button" disabled={selectedPodiumWorks.length === 0} onClick={() => setShowPodiumPrint(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-indigo-600 disabled:bg-slate-300 rounded-lg hover:bg-indigo-700"><Printer className="w-4 h-4" />Podium ({selectedPodiumWorks.length}/3)</button>
                <button type="button" onClick={copyAllPodiums} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"><FileText className="w-4 h-4" />Copiar todos</button>
                <button type="button" disabled={allPodiumGroups.length === 0} onClick={() => setShowAllPodiumsPrint(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-slate-800 disabled:bg-slate-300 rounded-lg hover:bg-slate-900"><Printer className="w-4 h-4" />Documento completo</button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportMenuOpen(open => !open)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Excel
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute left-0 top-11 z-20 w-72 p-2 bg-white border border-slate-200 rounded-xl shadow-lg">
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Escolha o arquivo</p>
                      {(Object.keys(TEMATICAS) as Tematica[]).flatMap(t => (['oral', 'poster'] as const).map(type => (
                        <button
                          key={`${t}-${type}`}
                          type="button"
                          onClick={() => { handleExportResults(type, t); setExportMenuOpen(false); }}
                          className="block w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 rounded-lg hover:bg-teal-50"
                        >
                          {t} — {type === 'oral' ? 'Comunicação Oral' : 'Pôsteres'}
                        </button>
                      )))}
                    </div>
                  )}
                </div>
              </div>
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 w-12">Sel.</th>
                    <th className="p-4 rounded-tl-xl w-24">Rank</th>
                    <th className="p-4 w-32">ID</th>
                    <th className="p-4 w-32">Tipo / Área</th>
                    <th className="p-4">Título & Apresentador</th>
                    <th className="p-4 w-32 text-center">Avaliações</th>
                    <th className="p-4 w-32 text-right">Nota Média</th>
                    <th className="p-4 w-64">Comentários</th>
                    <th className="p-4 rounded-tr-xl w-32 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visiblePosterStats.map((stat, idx) => (
                    <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4"><input type="checkbox" checked={podiumSelection.includes(stat.id)} disabled={podiumSelection.length >= 3 && !podiumSelection.includes(stat.id)} onClick={event => event.stopPropagation()} onChange={() => setPodiumSelection(current => current.includes(stat.id) ? current.filter(id => id !== stat.id) : current.length < 3 ? [...current, stat.id] : current)} aria-label={`Selecionar ${stat.title} para o podium`} /></td>
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
                      <td className="p-4 text-sm font-mono font-bold text-slate-600">
                        <div>{stat.posterId}</div>
                        {stat.allIds.length > 1 && (
                          <div className="mt-1 space-y-1">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-sans font-bold text-amber-800">
                              Vinculado a {stat.allIds.length - 1} outro ID{stat.allIds.length > 2 ? 's' : ''}
                            </span>
                            <div className="text-[10px] font-sans font-semibold text-amber-700">
                              IDs: {stat.allIds.join(', ')} · resultados combinados
                            </div>
                          </div>
                        )}
                      </td>
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
                            <span className="mt-1 text-xs text-slate-500">{stat.evaluatorNames.join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Pendente</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-600">{stat.comments.length ? stat.comments.map((c, i) => <div key={i} className="italic mb-1">“{c}”</div>) : '—'}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <select
                            value={stat.absent ? 'absent' : 'presented'}
                            onChange={(event) => toggleAttendance(stat.id, event.target.value as 'presented' | 'absent')}
                            className={`text-xs font-bold rounded-lg border px-2 py-1.5 ${stat.absent ? 'border-red-200 text-red-700 bg-red-50' : 'border-emerald-200 text-emerald-700 bg-emerald-50'}`}
                            aria-label={`Status de presença de ${stat.posterId}`}
                          >
                            <option value="presented">Apresentado</option>
                            <option value="absent">Ausente</option>
                          </select>
                        {stat.evalCount > 0 && !stat.absent && (
                          <div className="relative inline-flex items-center gap-2">
                            {evaluationActionId === stat.id && (
                              <button
                                onClick={() => { setEvaluationActionId(null); onClearEvaluation(stat.id); }}
                                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                              >
                                Limpar avaliação
                              </button>
                            )}
                            <button
                              onClick={() => setEvaluationActionId(current => current === stat.id ? null : stat.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Opções da avaliação"
                              aria-label={`Opções da avaliação de ${stat.posterId}`}
                            >
                              <Settings2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        </div>
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
                <div className="flex justify-end relative">
                  <button type="button" onClick={() => setWorkSettingsOpen(open => !open)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <Settings2 className="w-4 h-4" /> Opções
                  </button>
                  {workSettingsOpen && (
                    <div className="absolute right-0 top-11 z-10 w-72 p-2 bg-white border border-slate-200 rounded-xl shadow-lg space-y-1">
                      <button type="button" onClick={handleSyncWorks} disabled={isSyncing} className="flex items-center gap-2 w-full p-3 text-left text-sm font-bold text-teal-900 rounded-lg hover:bg-teal-50 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar trabalhos
                      </button>
                      <button type="button" onClick={() => setShowAddWork(!showAddWork)} className="flex items-center gap-2 w-full p-3 text-left text-sm font-bold text-slate-900 rounded-lg hover:bg-slate-50">
                        <Plus className="w-4 h-4" /> {showAddWork ? 'Fechar formulário' : 'Adicionar novo trabalho'}
                      </button>
                    </div>
                  )}
                </div>
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
                    <input type="text" placeholder="Buscar avaliador..." value={searchAssignments} onChange={(e) => setSearchAssignments(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {localEvaluators.length === 0 ? <p className="text-sm text-slate-500 italic">Nenhum avaliador cadastrado.</p> : (
                  localEvaluators.filter(ev => !searchAssignments.trim() || ev.name.toLowerCase().includes(searchAssignments.toLowerCase())).map(ev => {
                    const assignedWorks = localAssignments[ev.id] || [];
                    if (assignedWorks.length === 0) return null;
                    return <div key={ev.id} className="border border-slate-200 rounded-xl p-4"><h3 className="font-bold text-slate-900">{ev.name}</h3><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{assignedWorks.map(workId => { const work = localWorks.find(w => w.id === workId || normalizePosterCode(w.posterId) === normalizePosterCode(workId)); if (!work) return null; return <div key={work.id} className="text-sm p-3 bg-white border border-slate-200 rounded-lg"><span className="text-[10px] font-bold">{work.posterId}</span><div className="font-medium text-slate-900">{work.title}</div><button onClick={() => handleToggleAssignmentFromWork(work.id, ev.id)} className="text-xs text-red-600 mt-2">Remover atribuição</button></div>; })}</div></div>;
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CRITERIA */}
        {activeTab === 'criteria' && (
          <div className="space-y-6"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><h2 className="text-xl font-bold text-slate-900">Definições de Critérios</h2><div className="space-y-4 max-w-2xl text-left mt-6">{localCriteria.map(criterion => <div key={criterion.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50"><div><div className="font-bold text-slate-900">{criterion.label}</div><div className="text-xs font-mono text-slate-400 mt-1">ID: {criterion.id}</div></div><button onClick={() => handleRemoveCriterion(criterion.id)} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button></div>)}</div><form onSubmit={handleAddCriterion} className="flex gap-3 max-w-2xl mt-8"><input type="text" value={newCriterionLabel} onChange={(e) => setNewCriterionLabel(e.target.value)} placeholder="Ex: Qualidade da Resposta" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl" /><button type="submit" disabled={!newCriterionLabel.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold"><Plus className="w-4 h-4" /></button></form></div></div>
        )}

        {/* TAB: EVALUATORS */}
        {activeTab === 'evaluators' && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center"><UserPlus className="w-5 h-5 mr-3 text-teal-600" />Gerenciar Avaliadores</h2>
                  {localEvaluators.length > 0 && <div className="relative ml-auto"><button onClick={() => setEvaluatorSettingsOpen(open => !open)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"><Settings2 className="w-4 h-4" /> Opções</button>{evaluatorSettingsOpen && <div className="absolute right-0 top-11 z-10 w-56 p-2 bg-white border border-slate-200 rounded-xl shadow-lg"><button onClick={handleExportEvaluators} className="flex items-center gap-2 w-full p-3 text-left text-sm font-bold text-slate-700 rounded-lg hover:bg-slate-50"><Download className="w-4 h-4" /> Exportar Excel</button><button onClick={handleResetEvaluators} className="flex items-center gap-2 w-full p-3 text-left text-sm font-bold text-red-700 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /> Limpar avaliadores</button><button onClick={() => handlePrintEvaluators(filteredEvaluators)} className="flex items-center gap-2 w-full p-3 text-left text-sm font-bold text-slate-700 rounded-lg hover:bg-slate-50"><Printer className="w-4 h-4" /> Imprimir todos</button></div>}</div>}
                </div>
              </div>
              <form onSubmit={handleAddEvaluatorUser} className="flex flex-col gap-3 mb-8 max-w-2xl bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div className="flex flex-col md:flex-row gap-3"><input type="text" value={newEvaluatorName} onChange={(e) => setNewEvaluatorName(e.target.value)} placeholder="Nome do Novo Avaliador" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900" /><button type="submit" disabled={!newEvaluatorName.trim()} className="bg-slate-900 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold"><Plus className="w-4 h-4 mr-2 inline" />Criar Avaliador</button></div>
                <span className="text-sm font-bold text-slate-700">Áreas de Atuação (Recomendação)</span><div className="flex flex-wrap gap-2">{(Object.keys(TEMATICAS) as Tematica[]).map(t => <button key={t} type="button" onClick={() => setNewEvaluatorAreas(prev => prev.includes(t) ? prev.filter(area => area !== t) : [...prev, t])} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newEvaluatorAreas.includes(t) ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>)}</div>
              </form>
              <div className="relative mb-5 max-w-2xl"><Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchEvaluators} onChange={(e) => setSearchEvaluators(e.target.value)} placeholder="Buscar avaliador por nome..." className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900" /></div>
              <div className="space-y-3">{localEvaluators.length === 0 ? <p className="text-slate-500 text-sm italic">Nenhum avaliador cadastrado. Crie um acima.</p> : filteredEvaluators.map(ev => <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-mono font-bold text-lg">{ev.accessCode}</div><div><div className="font-bold text-slate-900">{ev.name}</div><div className="text-xs font-mono text-slate-500 mt-0.5">Código de Acesso: {ev.accessCode}</div>{ev.areas?.length ? <div className="flex flex-wrap gap-1 mt-2">{ev.areas.map(area => <span key={area} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">{area}</span>)}</div> : null}</div></div><div className="flex items-center gap-2"><button onClick={() => { setAssignmentEditorId(assignmentEditorId === ev.id ? null : ev.id); setAssignmentCodes(''); }} className="text-teal-600 p-2" title="Atribuir trabalhos"><Tag className="w-5 h-5" /></button><button onClick={() => handlePrintEvaluators([ev])} className="text-slate-500 p-2"><Printer className="w-5 h-5" /></button><button onClick={() => handleEditEvaluatorClick(ev)} className="text-indigo-500 p-2"><Settings2 className="w-5 h-5" /></button><button onClick={() => handleRemoveEvaluatorUser(ev.id)} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button></div></div>)}</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
