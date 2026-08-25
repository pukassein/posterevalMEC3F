import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Evaluators autosave
code = code.replace(
`    setLocalEvaluators([...localEvaluators, newEv]);
    setNewEvaluatorName('');`,
`    const updatedEvaluators = [...localEvaluators, newEv];
    setLocalEvaluators(updatedEvaluators);
    setNewEvaluatorName('');
    onSaveEvaluators(updatedEvaluators);`);

code = code.replace(
`    if (confirm('Tem certeza que deseja remover este avaliador? Suas atribuições serão mantidas apenas se vinculadas, mas ele não poderá acessar.')) {
      setLocalEvaluators(localEvaluators.filter(e => e.id !== id));
    }`,
`    if (confirm('Tem certeza que deseja remover este avaliador? Suas atribuições serão mantidas apenas se vinculadas, mas ele não poderá acessar.')) {
      const updatedEvaluators = localEvaluators.filter(e => e.id !== id);
      setLocalEvaluators(updatedEvaluators);
      onSaveEvaluators(updatedEvaluators);
    }`);

// Assignments autosave
code = code.replace(
`    setLocalAssignments(newAssignments);
    setNewEvaluatorId('');`,
`    setLocalAssignments(newAssignments);
    setNewEvaluatorId('');
    onSaveAssignments(newAssignments);`);

code = code.replace(
`    setLocalAssignments(newAssignments);`,
`    setLocalAssignments(newAssignments);
    onSaveAssignments(newAssignments);`);

// Replace the second occurrence too (in handleRemovePosterFromEvaluator)
// Actually we can just do a regex
code = code.replace(
`  const handleRemovePosterFromEvaluator = (posterId: string) => {
    if (!selectedEvaluator) return;
    const newAssignments = { ...localAssignments };
    newAssignments[selectedEvaluator] = newAssignments[selectedEvaluator].filter(id => id !== posterId);
    setLocalAssignments(newAssignments);
  };`,
`  const handleRemovePosterFromEvaluator = (posterId: string) => {
    if (!selectedEvaluator) return;
    const newAssignments = { ...localAssignments };
    newAssignments[selectedEvaluator] = newAssignments[selectedEvaluator].filter(id => id !== posterId);
    setLocalAssignments(newAssignments);
    onSaveAssignments(newAssignments);
  };`);

// Criteria autosave
code = code.replace(
`      setLocalCriteria([...localCriteria, newCrit]);
      setNewCriterionLabel('');`,
`      const updatedCriteria = [...localCriteria, newCrit];
      setLocalCriteria(updatedCriteria);
      setNewCriterionLabel('');
      onSaveCriteria(updatedCriteria);`);

code = code.replace(
`  const handleRemoveCriterion = (id: string) => {
    setLocalCriteria(localCriteria.filter(c => c.id !== id));
  };`,
`  const handleRemoveCriterion = (id: string) => {
    const updatedCriteria = localCriteria.filter(c => c.id !== id);
    setLocalCriteria(updatedCriteria);
    onSaveCriteria(updatedCriteria);
  };`);

// Works autosave
code = code.replace(
`      setLocalWorks([...localWorks, newWork]);
      
      setNewWorkTitle('');`,
`      const updatedWorks = [...localWorks, newWork];
      setLocalWorks(updatedWorks);
      onSavePosters(updatedWorks);
      
      setNewWorkTitle('');`);

code = code.replace(
`  const handleRemoveWork = (id: string) => {
    setLocalWorks(localWorks.filter(w => w.id !== id));
  };`,
`  const handleRemoveWork = (id: string) => {
    const updatedWorks = localWorks.filter(w => w.id !== id);
    setLocalWorks(updatedWorks);
    onSavePosters(updatedWorks);
  };`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
