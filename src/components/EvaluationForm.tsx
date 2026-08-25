import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Clock, Tag } from 'lucide-react';
import { Poster, Evaluation, Evaluator, Criterion, TEMATICAS } from '../types';

interface EvaluationFormProps {
  poster: Poster;
  evaluator: Evaluator;
  criteria: Criterion[];
  existingEvaluation?: Evaluation;
  onSave: (evaluation: Evaluation) => void;
  onBack: () => void;
}

export function EvaluationForm({ poster, evaluator, criteria, existingEvaluation, onSave, onBack }: EvaluationFormProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [generalComments, setGeneralComments] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingEvaluation) {
      setScores(existingEvaluation.scores);
      setGeneralComments(existingEvaluation.generalComments);
    } else {
      const initialScores: Record<string, number> = {};
      criteria.forEach(c => initialScores[c.id] = -1);
      setScores(initialScores);
    }
  }, [existingEvaluation, criteria]);

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const isFormValid = criteria.every(c => scores[c.id] !== undefined && scores[c.id] !== -1);

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    const evaluation: Evaluation = {
      posterId: poster.id,
      scores,
      generalComments,
      evaluatorId: evaluator.id,
      timestamp: new Date().toISOString(),
    };
    
    onSave(evaluation);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-full bg-fixed overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shrink-0 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-3 -ml-2 p-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Voltar para a Lista</span>
          </button>
          
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-2">
            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${poster.type === 'poster' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
              {poster.type === 'poster' ? 'Pôster' : 'Oral'}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {poster.posterId}
            </span>
            {poster.tematica && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200" title={TEMATICAS[poster.tematica]}>
                <Tag className="w-3 h-3 mr-1" />
                {poster.tematica}
              </span>
            )}
            {poster.presentationTime && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Clock className="w-3 h-3 mr-1" />
                {poster.presentationTime}
              </span>
            )}
            {existingEvaluation && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                <Check className="w-3.5 h-3.5 mr-1" />
                Avaliado
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {poster.title}
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Apresentador(a): <span className="font-semibold text-slate-700">{poster.presenterName}</span>
          </p>
        </div>
      </header>

      {/* Scrollable Form Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto w-full pb-32" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          
          {/* Scoring Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left p-5">
            <div className="border-b border-slate-100 pb-4 mb-5">
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Critérios de Avaliação</h3>
               <p className="text-sm text-slate-500 mt-1">Pontue cada métrica de 0 (Ruim) a 10 (Excelente).</p>
            </div>
            
            <div className="space-y-7">
              {criteria.map(({ id, label }) => (
                <div key={id} className="py-1">
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm font-bold text-slate-800">
                      {label}
                    </label>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {scores[id] !== undefined && scores[id] !== -1 ? `${scores[id]} / 10` : 'Obrigatório'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pb-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                      const isSelected = scores[id] === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(id, score)}
                          className={`
    shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl text-lg font-bold transition-all focus:outline-none focus:ring-4 focus:ring-teal-100 active:scale-95
    ${isSelected 
       ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2' 
       : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'}
  `}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-left mb-8">
            <label htmlFor="comments" className="block text-base font-bold text-slate-900 mb-2">
              Comentários Gerais (Opcional)
            </label>
            <p className="text-sm text-slate-500 mb-4">Adicione um feedback qualitativo construtivo para o apresentador.</p>
            <textarea
              id="comments"
              rows={4}
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 outline-none transition-colors text-slate-900 resize-none"
              placeholder="Escreva seu feedback aqui..."
            />
          </section>
        </div>
      </div>

      {/* Fixed Bottom Submit Area */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm shrink-0">
            {!isFormValid ? (
              <span className="text-amber-600 font-semibold flex items-center text-xs sm:text-sm">
                Falta avaliar
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center">
                <Check className="w-5 h-5 mr-1" />
                Pronto!
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`
              flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 text-sm sm:text-base whitespace-nowrap
              ${isFormValid 
                ? 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20' 
                : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            {existingEvaluation ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}
