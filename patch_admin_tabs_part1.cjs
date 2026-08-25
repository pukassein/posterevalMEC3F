const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Replace works tab button with oral, posters, assignments
code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('works'\)\}.*?Trabalhos\s+<\/button>/s,
  `<button 
            onClick={() => setActiveTab('oral')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'oral' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            Comunicação Oral
          </button>
          <button 
            onClick={() => setActiveTab('posters')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'posters' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            Pôsteres
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'assignments' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            Atribuições
          </button>`
);

// Add state for new evaluator areas
code = code.replace(
  /const \[newEvaluatorName, setNewEvaluatorName\] = useState\(''\);/,
  `const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [newEvaluatorAreas, setNewEvaluatorAreas] = useState<Tematica[]>([]);`
);

// Evaluator creation logic
code = code.replace(
  /const handleAddEvaluator = \(e: React\.FormEvent\) => \{/,
  `const handleAddEvaluator = (e: React.FormEvent) => {`
);
code = code.replace(
  /const newEvaluator: Evaluator = \{[\s\S]*?\};/,
  `const newEvaluator: Evaluator = {
      id: \`EV-\${Date.now()}\`,
      name: newEvaluatorName.trim(),
      accessCode,
      areas: newEvaluatorAreas
    };`
);

// Evaluator reset logic
code = code.replace(
  /setNewEvaluatorName\(''\);\s*setNewEvaluatorCode\(''\);/,
  `setNewEvaluatorName('');\n    setNewEvaluatorCode('');\n    setNewEvaluatorAreas([]);`
);

// In Evaluator edit state
code = code.replace(
  /const \[editEvaluatorName, setEditEvaluatorName\] = useState\(''\);/,
  `const [editEvaluatorName, setEditEvaluatorName] = useState('');
  const [editEvaluatorAreas, setEditEvaluatorAreas] = useState<Tematica[]>([]);`
);

code = code.replace(
  /const startEditEvaluator = \(ev: Evaluator\) => \{/,
  `const startEditEvaluator = (ev: Evaluator) => {`
);
code = code.replace(
  /setEditEvaluatorName\(ev.name\);\s*setEditEvaluatorCode\(ev.accessCode\);/,
  `setEditEvaluatorName(ev.name);
    setEditEvaluatorCode(ev.accessCode);
    setEditEvaluatorAreas(ev.areas || []);`
);

code = code.replace(
  /const saveEditEvaluator = \(\) => \{[\s\S]*?const updated = localEvaluators.map\(e =>/s,
  `const saveEditEvaluator = () => {
    if (!editEvaluatorName.trim() || !editEvaluatorCode.trim()) return;
    const updated = localEvaluators.map(e =>`
);
code = code.replace(
  /e\.id === editingEvaluator \? \{ \.\.\.e, name: editEvaluatorName\.trim\(\), accessCode: editEvaluatorCode\.trim\(\) \} : e/,
  `e.id === editingEvaluator ? { ...e, name: editEvaluatorName.trim(), accessCode: editEvaluatorCode.trim(), areas: editEvaluatorAreas } : e`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Part 1 complete');
