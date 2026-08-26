import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, Circle, Clock, Tag, Filter } from 'lucide-react';
import { Poster, Evaluation, Evaluator, Criterion, Tematica, TEMATICAS } from '../types';

interface DashboardProps {
  posters: Poster[];
  evaluations: Evaluation[];
  evaluator: Evaluator;
  assignments: string[];
  onSelectPoster: (poster: Poster) => void;
  onAddAssignment: (posterId: string) => void;
  onLogout: () => void;
}

export function Dashboard({ posters, evaluations, evaluator, assignments, onSelectPoster, onAddAssignment, onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTematica, setSelectedTematica] = useState<Tematica | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'poster' | 'oral'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [showEmergencySearch, setShowEmergencySearch] = useState(false);
  const [emergencyQuery, setEmergencyQuery] = useState('');

  const normalizePosterCode = (value: string) => {
    const match = value.trim().toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)-?(\d+)$/);
    return match ? `${match[1]}${match[2].padStart(3, '0')}` : value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };
  const assignedPosters = posters.filter(poster => assignments.some(assignment =>
    assignment === poster.id || (() => {
      const assignedPoster = posters.find(item => item.id === assignment);
      return normalizePosterCode(assignedPoster?.posterId || assignment) === normalizePosterCode(poster.posterId);
    })()
  ));

  const filteredPosters = assignedPosters.filter(poster => {
    const matchesSearch = poster.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      poster.posterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poster.presenterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTematica = selectedTematica === 'ALL' || poster.tematica === selectedTematica;
    const matchesType = selectedType === 'ALL' || poster.type === selectedType;
    const matchesDate = selectedDate === 'ALL' || poster.presentationDate === selectedDate;

    return matchesSearch && matchesTematica && matchesType && matchesDate;
  });

  const presentationDates = Array.from(new Set(assignedPosters.map(poster => poster.presentationDate).filter(Boolean) as string[])).sort();
  const formatDate = (date: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [, month, day] = date.split('-');
      return `${day}/${month}`;
    }
    return date;
  };

  const emergencyResults = posters.filter(poster => {
    const query = emergencyQuery.trim().toLowerCase();
    if (!query) return false;
    const title = String(poster.title || '').toLowerCase();
    const code = String(poster.posterId || '').toLowerCase();
    const tematica = String(poster.tematica || '').toLowerCase();
    const tematicaLabel = poster.tematica && TEMATICAS[poster.tematica]
      ? TEMATICAS[poster.tematica].toLowerCase()
      : '';
    return title.includes(query) || code.includes(query) || tematica.includes(query) || tematicaLabel.includes(query);
  }).slice(0, 12);

  const isAssigned = (poster: Poster) => assignments.some(assignment =>
    assignment === poster.id || String(assignment).toUpperCase() === String(poster.posterId || '').toUpperCase()
  );

  const getEvaluationStatus = (posterId: string) => {
    return evaluations.some(e => e.posterId === posterId && e.evaluatorId === evaluator.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="https://www.mec3f.com/logomec3f.png" 
              alt="MEC3F Logo" 
              className="h-10 object-contain" 
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Pôsteres</h1>
              <p className="text-sm text-slate-500 leading-tight">Avaliador: {evaluator.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-sm text-teal-600 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
          >
            Sair
          </button>
        </div>
        
        {/* Search Bar & Filters */}
        <div className="max-w-3xl mx-auto px-4 pb-4 space-y-3">
          <button
            onClick={() => { setShowEmergencySearch(true); setEmergencyQuery(''); }}
            className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm font-bold hover:bg-amber-100 transition-colors"
          >
            + Adicionar trabalho para avaliação (emergência)
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl leading-5 bg-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Buscar por ID, título ou apresentador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 pb-2">
            <div className="flex items-center text-slate-400 shrink-0 mr-1">
              <Filter className="w-4 h-4" />
            </div>
            <button
              onClick={() => setSelectedTematica('ALL')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedTematica === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            {Object.entries(TEMATICAS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedTematica(key as Tematica)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedTematica === key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title={value}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as 'ALL' | 'poster' | 'oral')}
              className="flex-1 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
              aria-label="Filtrar por tipo de trabalho"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="poster">Pôsteres</option>
              <option value="oral">Comunicação Oral</option>
            </select>
            <select
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="flex-1 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
              aria-label="Filtrar por data de apresentação"
            >
              <option value="ALL">Todas as datas</option>
              {presentationDates.map(date => <option key={date} value={date}>{formatDate(date)}</option>)}
            </select>
          </div>
        </div>
      </header>

      {showEmergencySearch && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 p-4 flex items-start justify-center pt-20" onClick={() => setShowEmergencySearch(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Adicionar trabalho</h2>
                <p className="text-sm text-slate-500">Busque por temática, código ou título.</p>
              </div>
              <button onClick={() => setShowEmergencySearch(false)} className="text-slate-400 hover:text-slate-700 text-2xl">×</button>
            </div>
            <input autoFocus value={emergencyQuery} onChange={(event) => setEmergencyQuery(event.target.value)} placeholder="Ex.: SMA, P-101 ou título..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto">
              {emergencyQuery.trim() && emergencyResults.map(poster => (
                <button key={poster.id} onClick={() => { onAddAssignment(poster.id); setShowEmergencySearch(false); onSelectPoster(poster); }} className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><span>{poster.posterId}</span><span>•</span><span>{poster.tematica || 'Sem temática'}</span>{isAssigned(poster) && <span className="text-teal-700">Já atribuído</span>}</div>
                  <div className="font-semibold text-slate-900 mt-1">{poster.title}</div>
                </button>
              ))}
              {emergencyQuery.trim() && emergencyResults.length === 0 && <p className="text-sm text-slate-500 text-center py-6">Nenhum trabalho encontrado.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Poster List */}
      <main className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 pb-12">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-800">Meus trabalhos</h2>
          <span className="text-xs font-semibold text-slate-500">{filteredPosters.length} encontrado{filteredPosters.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-4">
          {assignedPosters.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-600 font-medium">Você não tem pôsteres atribuídos no momento.</p>
              <p className="text-slate-400 text-sm mt-2">Entre em contato com a organização do evento caso ache que isso é um erro.</p>
            </div>
          ) : filteredPosters.length > 0 ? (
            filteredPosters.map((poster) => {
              const isEvaluated = getEvaluationStatus(poster.id);
              
              return (
                <div 
                  key={poster.id}
                  onClick={() => onSelectPoster(poster)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 active:scale-[0.98] transition-all cursor-pointer hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-2 space-y-1 sm:space-y-0 mb-2 flex-wrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${poster.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                          {poster.type === 'poster' ? 'Pôster' : 'Oral'}
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                          {poster.posterId}
                        </span>
                        {poster.tematica && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600" title={TEMATICAS[poster.tematica]}>
                            <Tag className="w-3 h-3 mr-1" />
                            {poster.tematica}
                          </span>
                        )}
                        {poster.presentationDate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                            {poster.presentationDate === '2026-08-26' ? '26/08' : 
                             poster.presentationDate === '2026-08-27' ? '27/08' : 
                             poster.presentationDate === '2026-08-28' ? '28/08' : 
                             poster.presentationDate}
                          </span>
                        )}
                        {poster.presentationTime && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {poster.presentationTime}
                          </span>
                        )}
                        {isEvaluated ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Avaliado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Circle className="w-3.5 h-3.5 mr-1" />
                            Pendente
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 leading-snug my-2">
                        {poster.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Apresentador: <span className="text-slate-700">{poster.presenterName}</span>
                      </p>
                    </div>
                    <div className="h-full flex items-center justify-center pt-2">
                      <ChevronRight className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhum trabalho encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
