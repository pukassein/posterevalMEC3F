import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add new state variables
code = code.replace(
  "const [filterTematica, setFilterTematica] = useState('');",
  "const [filterTematica, setFilterTematica] = useState('');\n  const [filterType, setFilterType] = useState('');\n  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);"
);

// Add handleToggleAssignmentFromWork
const handleToggleAssignmentFromWork = `  const handleToggleAssignmentFromWork = (posterId: string, evaluatorId: string) => {
    const currentSelected = localAssignments[evaluatorId] || [];
    const isAssigned = currentSelected.includes(posterId);
    
    const updated = isAssigned 
      ? currentSelected.filter(id => id !== posterId)
      : [...currentSelected, posterId];
      
    const newAssignments = { ...localAssignments, [evaluatorId]: updated };
    setLocalAssignments(newAssignments);
    onSaveAssignments(newAssignments);
  };\n`;

code = code.replace(
  "const handleTogglePoster = (posterId: string) => {",
  handleToggleAssignmentFromWork + "\n  const handleTogglePoster = (posterId: string) => {"
);

// Update sortedWorks
const sortedWorksOld = `  const sortedWorks = localWorks
    .filter(w => (filterDate ? w.presentationDate === filterDate : true))
    .filter(w => (filterTematica ? w.tematica === filterTematica : true))`;

const sortedWorksNew = `  const sortedWorks = localWorks
    .filter(w => (filterDate ? w.presentationDate === filterDate : true))
    .filter(w => (filterTematica ? w.tematica === filterTematica : true))
    .filter(w => (filterType ? w.type === filterType : true))`;

code = code.replace(sortedWorksOld, sortedWorksNew);

// Update Filters UI
const filtersOld = `              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                >
                  <option value="">Todas as Datas (Orais)</option>
                  <option value="26/08">26/08</option>
                  <option value="27/08">27/08</option>
                  <option value="28/08">28/08</option>
                </select>
                <select
                  value={filterTematica}
                  onChange={(e) => setFilterTematica(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                >
                  <option value="">Todas as Temáticas</option>
                  {Object.entries(TEMATICAS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>`;

const filtersNew = `              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                >
                  <option value="">Todos os Tipos</option>
                  <option value="poster">Pôster</option>
                  <option value="oral">Comunicação Oral</option>
                </select>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                >
                  <option value="">Todas as Datas (Orais)</option>
                  <option value="26/08">26/08</option>
                  <option value="27/08">27/08</option>
                  <option value="28/08">28/08</option>
                </select>
                <select
                  value={filterTematica}
                  onChange={(e) => setFilterTematica(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 transition-colors"
                >
                  <option value="">Todas as Temáticas</option>
                  {Object.entries(TEMATICAS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>`;

code = code.replace(filtersOld, filtersNew);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
