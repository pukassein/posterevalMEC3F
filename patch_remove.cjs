const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add states
content = content.replace(
  "const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);",
  "const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);\n  const [deletedWork, setDeletedWork] = useState<{work: Poster, index: number} | null>(null);"
);

// Replace handleRemoveWork
const removeFn = `
  const handleRemoveWork = (id: string) => {
    if (window.confirm('Tem certeza que deseja ocultar este trabalho? Ele será removido apenas desta lista, não do banco original. Você pode trazê-lo de volta sincronizando com o banco do evento.')) {
      const index = localWorks.findIndex(w => w.id === id);
      if (index !== -1) {
        setDeletedWork({ work: localWorks[index], index });
        const updatedWorks = localWorks.filter(w => w.id !== id);
        setLocalWorks(updatedWorks);
        onSavePosters(updatedWorks);
        setTimeout(() => setDeletedWork(null), 10000);
      }
    }
  };

  const handleUndoRemoveWork = () => {
    if (deletedWork) {
      const updatedWorks = [...localWorks];
      updatedWorks.splice(deletedWork.index, 0, deletedWork.work);
      setLocalWorks(updatedWorks);
      onSavePosters(updatedWorks);
      setDeletedWork(null);
    }
  };
`;

content = content.replace(
  "  const handleRemoveWork = (id: string) => {\n    const updatedWorks = localWorks.filter(w => w.id !== id);\n    setLocalWorks(updatedWorks);\n    onSavePosters(updatedWorks);\n  };",
  removeFn
);

// Add Undo Toast UI
const undoToast = `
      {deletedWork && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="font-medium text-sm">Trabalho removido.</span>
          <button 
            onClick={handleUndoRemoveWork}
            className="text-teal-400 font-bold hover:text-teal-300 transition-colors uppercase text-sm px-2 py-1 bg-white/10 rounded-lg"
          >
            Desfazer
          </button>
        </div>
      )}
`;

content = content.replace(
  "    <div className=\"min-h-screen bg-slate-50 flex flex-col\">",
  "    <div className=\"min-h-screen bg-slate-50 flex flex-col\">\n" + undoToast
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
