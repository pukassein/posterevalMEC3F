import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { EvaluationForm } from './components/EvaluationForm';
import { AdminPanel } from './components/AdminPanel';
import { mockPosters } from './data';
import { ViewState, Evaluator, Poster, Evaluation, Criterion } from './types';
import { fetchFromSupabase, syncToSupabase } from './lib/dataSync';
import { supabase } from './lib/supabase';

const INITIAL_CRITERIA: Criterion[] = [
  { id: 'visualPresentation', label: 'Apresentação Visual' },
  { id: 'scientificMerit', label: 'Mérito Científico' },
  { id: 'methodology', label: 'Metodologia' },
  { id: 'clarityOfResults', label: 'Clareza dos Resultados' },
  { id: 'oralDefense', label: 'Defesa Oral' },
];

export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  // Record mapping evaluatorId string to an array of assigned posterId strings
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [criteria, setCriteria] = useState<Criterion[]>(INITIAL_CRITERIA);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const savedEvaluator = localStorage.getItem('poster_eval_evaluator');
      if (savedEvaluator) {
        const parsed = JSON.parse(savedEvaluator);
        setEvaluator(parsed);
        if (parsed.id === 'admin') {
          setView('admin');
        } else {
          setView('dashboard');
        }
      }

      if (supabase) {
        setIsSupabaseConnected(true);
        const data = await fetchFromSupabase();
        if (data) {
          // If we successfully fetched from Supabase, use that data (even if empty)
          // instead of mock data, so the user sees their actual database state.
          setPosters(data.posters);
          setEvaluations(data.evaluations);
          setAssignments(data.assignments);
          if (data.evaluators) {
             setEvaluators(data.evaluators);
          } else {
             // Fallback to local storage only for evaluators if Supabase table is missing
             const savedEvaluators = localStorage.getItem('poster_eval_evaluators');
             if (savedEvaluators) setEvaluators(JSON.parse(savedEvaluators));
          }
          
          if (data.criteria.length > 0) {
            setCriteria(data.criteria);
          } else {
            // If criteria is empty in DB, we should probably initialize it and sync it
            setCriteria(INITIAL_CRITERIA);
            await syncToSupabase('Eval_criteria', INITIAL_CRITERIA);
          }
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local storage if no Supabase or empty
      const savedEvaluations = localStorage.getItem('poster_eval_evaluations');
      const savedAssignments = localStorage.getItem('poster_eval_assignments');
      const savedCriteria = localStorage.getItem('poster_eval_criteria');
      const savedPosters = localStorage.getItem('poster_eval_posters');
      const savedEvaluators = localStorage.getItem('poster_eval_evaluators');
      
      if (savedPosters) {
        setPosters(JSON.parse(savedPosters));
      } else {
        setPosters(mockPosters); // Only use mock posters if local storage is also empty
      }
      
      if (savedEvaluations) setEvaluations(JSON.parse(savedEvaluations));
      if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
      if (savedCriteria) setCriteria(JSON.parse(savedCriteria));
      if (savedEvaluators) setEvaluators(JSON.parse(savedEvaluators));
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleLogin = (newEvaluator: Evaluator) => {
    setEvaluator(newEvaluator);
    localStorage.setItem('poster_eval_evaluator', JSON.stringify(newEvaluator));
    
    if (newEvaluator.id === 'admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setEvaluator(null);
    localStorage.removeItem('poster_eval_evaluator');
    setView('login');
  };

  const handleSelectPoster = (poster: Poster) => {
    setSelectedPoster(poster);
    setView('evaluation');
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    const updatedEvaluations = evaluations.filter(
      e => !(e.posterId === evaluation.posterId && e.evaluatorId === evaluation.evaluatorId)
    );
    updatedEvaluations.push(evaluation);
    
    setEvaluations(updatedEvaluations);
    localStorage.setItem('poster_eval_evaluations', JSON.stringify(updatedEvaluations));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_evaluations', [evaluation]);
      if (res && !res.success) alert('Supabase Error (Evaluation): ' + res.error);
    }
    
    setView('dashboard');
    setSelectedPoster(null);
  };

  const handleClearEvaluation = async (posterId: string) => {
    const work = posters.find(poster => poster.id === posterId);
    if (!confirm(`Limpar a avaliação de ${work?.posterId || 'este trabalho'}? O trabalho ficará pendente novamente.`)) return;

    const updatedEvaluations = evaluations.filter(evaluation => evaluation.posterId !== posterId);
    setEvaluations(updatedEvaluations);
    localStorage.setItem('poster_eval_evaluations', JSON.stringify(updatedEvaluations));

    if (supabase) {
      const { error } = await supabase.from('Eval_evaluations').delete().eq('posterId', posterId);
      if (error) alert('Supabase Error (Evaluation): ' + error.message);
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedPoster(null);
  };

  const handleSaveAssignments = async (newAssignments: Record<string, string[]>) => {
    setAssignments(newAssignments);
    localStorage.setItem('poster_eval_assignments', JSON.stringify(newAssignments));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_assignments', newAssignments);
      if (res && !res.success) alert('Supabase Error (Assignments): ' + res.error);
    }
  };

  const handleAddAssignment = (posterId: string) => {
    if (!evaluator) return;
    const current = assignments[evaluator.id] || [];
    if (current.includes(posterId)) return;
    handleSaveAssignments({ ...assignments, [evaluator.id]: [...current, posterId] });
  };

  const handleSaveCriteria = async (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
    localStorage.setItem('poster_eval_criteria', JSON.stringify(newCriteria));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_criteria', newCriteria);
      if (res && !res.success) alert('Supabase Error (Criteria): ' + res.error);
    }
  };

  const handleSavePosters = async (newPosters: Poster[]) => {
    setPosters(newPosters);
    localStorage.setItem('poster_eval_posters', JSON.stringify(newPosters));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_posters', newPosters);
      if (res && !res.success) alert('Supabase Error (Posters): ' + res.error);
    }
  };

  const handleSaveEvaluators = async (newEvaluators: Evaluator[]) => {
    setEvaluators(newEvaluators);
    localStorage.setItem('poster_eval_evaluators', JSON.stringify(newEvaluators));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_evaluators', newEvaluators);
      if (res && !res.success) alert('Supabase Error (Evaluators): ' + res.error);
    }
  };

  const currentEvaluatorAssignments = evaluator ? assignments[evaluator.id] || [] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-slate-900 min-h-screen bg-slate-50 overscroll-none">
      {view === 'login' && (
        <Login onLogin={handleLogin} evaluators={evaluators} />
      )}
      
      {view === 'admin' && (
        <AdminPanel 
          posters={posters}
          assignments={assignments}
          evaluations={evaluations}
          criteria={criteria}
          onSaveAssignments={handleSaveAssignments}
          onSaveCriteria={handleSaveCriteria}
          evaluators={evaluators}
          onSavePosters={handleSavePosters}
          onSaveEvaluators={handleSaveEvaluators}
          onClearEvaluation={handleClearEvaluation}
          onLogout={handleLogout}
        />
      )}

      {view === 'dashboard' && evaluator && (
        <Dashboard 
          posters={posters}
          evaluations={evaluations}
          evaluator={evaluator}
          assignments={currentEvaluatorAssignments}
          onSelectPoster={handleSelectPoster}
          onAddAssignment={handleAddAssignment}
          onLogout={handleLogout}
        />
      )}
      
      {view === 'evaluation' && evaluator && selectedPoster && (
        <EvaluationForm 
          poster={selectedPoster}
          evaluator={evaluator}
          criteria={criteria}
          existingEvaluation={evaluations.find(e => e.posterId === selectedPoster.id && e.evaluatorId === evaluator.id)}
          onSave={handleSaveEvaluation}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}
