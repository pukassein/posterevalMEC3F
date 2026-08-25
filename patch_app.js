import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// add evaluators state
code = code.replace(
`const [posters, setPosters] = useState<Poster[]>([]);`,
`const [posters, setPosters] = useState<Poster[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);`);

// update data loading
code = code.replace(
`setAssignments(data.assignments);`,
`setAssignments(data.assignments);
          if (data.evaluators) setEvaluators(data.evaluators);`);

code = code.replace(
`const savedPosters = localStorage.getItem('poster_eval_posters');`,
`const savedPosters = localStorage.getItem('poster_eval_posters');
      const savedEvaluators = localStorage.getItem('poster_eval_evaluators');`);

code = code.replace(
`if (savedCriteria) setCriteria(JSON.parse(savedCriteria));`,
`if (savedCriteria) setCriteria(JSON.parse(savedCriteria));
      if (savedEvaluators) setEvaluators(JSON.parse(savedEvaluators));`);

// handleSaveEvaluators function
code = code.replace(
`const currentEvaluatorAssignments = evaluator ? assignments[evaluator.id] || [] : [];`,
`const handleSaveEvaluators = async (newEvaluators: Evaluator[]) => {
    setEvaluators(newEvaluators);
    localStorage.setItem('poster_eval_evaluators', JSON.stringify(newEvaluators));
    
    if (supabase) {
      await syncToSupabase('Eval_evaluators', newEvaluators);
    }
  };

  const currentEvaluatorAssignments = evaluator ? assignments[evaluator.id] || [] : [];`);

// update Login props
code = code.replace(
`<Login onLogin={handleLogin} />`,
`<Login onLogin={handleLogin} evaluators={evaluators} />`);

// update AdminPanel props
code = code.replace(
`onSavePosters={handleSavePosters}
          onLogout={handleLogout}`,
`evaluators={evaluators}
          onSavePosters={handleSavePosters}
          onSaveEvaluators={handleSaveEvaluators}
          onLogout={handleLogout}`);

fs.writeFileSync('src/App.tsx', code);
