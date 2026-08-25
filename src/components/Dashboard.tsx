import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, Circle, Clock, Tag, Filter } from 'lucide-react';
import { Poster, Evaluation, Evaluator, Criterion, Tematica, TEMATICAS } from '../types';

interface DashboardProps {
  posters: Poster[];
  evaluations: Evaluation[];
  evaluator: Evaluator;
  assignments: string[];
  onSelectPoster: (poster: Poster) => void;
  onLogout: () => void;
}

export function Dashboard({ posters, evaluations, evaluator, assignments, onSelectPoster, onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTematica, setSelectedTematica] = useState<Tematica | 'ALL'>('ALL');

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

    return matchesSearch && matchesTematica;
  });

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
        </div>
      </header>

      {/* Poster List */}
      <main className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 pb-12">
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
              <p className="text-slate-500">Nenhum pôster encontrado para "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
