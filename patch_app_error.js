import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update AdminPanel prop types if we need to? No, we can just change the App.tsx implementation to alert the error.

code = code.replace(
`  const handleSaveAssignments = async (newAssignments: Record<string, string[]>) => {
    setAssignments(newAssignments);
    localStorage.setItem('poster_eval_assignments', JSON.stringify(newAssignments));
    
    if (supabase) {
      await syncToSupabase('Eval_assignments', newAssignments);
    }
  };`,
`  const handleSaveAssignments = async (newAssignments: Record<string, string[]>) => {
    setAssignments(newAssignments);
    localStorage.setItem('poster_eval_assignments', JSON.stringify(newAssignments));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_assignments', newAssignments);
      if (res && !res.success) alert('Supabase Error (Assignments): ' + res.error);
    }
  };`);

code = code.replace(
`  const handleSaveCriteria = async (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
    localStorage.setItem('poster_eval_criteria', JSON.stringify(newCriteria));
    
    if (supabase) {
      await syncToSupabase('Eval_criteria', newCriteria);
    }
  };`,
`  const handleSaveCriteria = async (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
    localStorage.setItem('poster_eval_criteria', JSON.stringify(newCriteria));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_criteria', newCriteria);
      if (res && !res.success) alert('Supabase Error (Criteria): ' + res.error);
    }
  };`);

code = code.replace(
`  const handleSavePosters = async (newPosters: Poster[]) => {
    setPosters(newPosters);
    localStorage.setItem('poster_eval_posters', JSON.stringify(newPosters));
    
    if (supabase) {
      await syncToSupabase('Eval_posters', newPosters);
    }
  };`,
`  const handleSavePosters = async (newPosters: Poster[]) => {
    setPosters(newPosters);
    localStorage.setItem('poster_eval_posters', JSON.stringify(newPosters));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_posters', newPosters);
      if (res && !res.success) alert('Supabase Error (Posters): ' + res.error);
    }
  };`);

code = code.replace(
`  const handleSaveEvaluators = async (newEvaluators: Evaluator[]) => {
    setEvaluators(newEvaluators);
    localStorage.setItem('poster_eval_evaluators', JSON.stringify(newEvaluators));
    
    if (supabase) {
      await syncToSupabase('Eval_evaluators', newEvaluators);
    }
  };`,
`  const handleSaveEvaluators = async (newEvaluators: Evaluator[]) => {
    setEvaluators(newEvaluators);
    localStorage.setItem('poster_eval_evaluators', JSON.stringify(newEvaluators));
    
    if (supabase) {
      const res = await syncToSupabase('Eval_evaluators', newEvaluators);
      if (res && !res.success) alert('Supabase Error (Evaluators): ' + res.error);
    }
  };`);

code = code.replace(
`    if (supabase) {
      await syncToSupabase('Eval_evaluations', [evaluation]);
    }`,
`    if (supabase) {
      const res = await syncToSupabase('Eval_evaluations', [evaluation]);
      if (res && !res.success) alert('Supabase Error (Evaluation): ' + res.error);
    }`);

fs.writeFileSync('src/App.tsx', code);
