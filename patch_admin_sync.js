const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add import
if (!content.includes("import { supabase } from '../lib/supabase';")) {
  content = content.replace(
    "import { Save, LogOut, CheckSquare, Square, UserPlus, Trash2, LayoutDashboard, Settings2, Users, FileText, Plus, Award, Clock, Tag } from 'lucide-react';",
    "import { Save, LogOut, CheckSquare, Square, UserPlus, Trash2, LayoutDashboard, Settings2, Users, FileText, Plus, Award, Clock, Tag, RefreshCw } from 'lucide-react';\nimport { supabase } from '../lib/supabase';"
  );
}

// Add state
if (!content.includes("isSyncing")) {
  content = content.replace(
    "const [showAddWork, setShowAddWork] = useState(false);",
    "const [showAddWork, setShowAddWork] = useState(false);\n  const [isSyncing, setIsSyncing] = useState(false);"
  );
}

// Add sync function
const syncFunc = `
  const handleSyncWorks = async () => {
    setIsSyncing(true);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const [postersRes, scheduleRes] = await Promise.all([
        supabase.from('posters').select('*'),
        supabase.from('schedule_items').select('*').eq('type', 'session').not('code', 'is', null)
      ]);

      if (postersRes.error) throw postersRes.error;
      if (scheduleRes.error) throw scheduleRes.error;

      const newPosters = (postersRes.data || []).map(p => ({
        id: p.id,
        posterId: p.code || p.id,
        title: p.title || 'Sem Título',
        presenterName: p.presenter || p.authors || 'Sem apresentador',
        type: 'poster' as const,
        tematica: p.theme || 'ECO',
      }));

      const newOrals = (scheduleRes.data || []).map(s => ({
        id: s.id,
        posterId: s.code || s.id,
        title: s.title || 'Sem Título',
        presenterName: s.presenter || s.authors || 'Sem apresentador',
        type: 'oral' as const,
        presentationTime: s.start_time,
        presentationDate: s.date,
      }));

      const allNewWorks = [...newPosters, ...newOrals];
      
      // Merge with existing localWorks (prefer new from event db)
      const mergedMap = new Map(localWorks.map(w => [w.posterId, w]));
      allNewWorks.forEach(w => {
        mergedMap.set(w.posterId, { ...mergedMap.get(w.posterId), ...w });
      });

      const updatedWorks = Array.from(mergedMap.values());
      setLocalWorks(updatedWorks);
      onSavePosters(updatedWorks);
      alert(\`Sincronização concluída com sucesso! \${allNewWorks.length} trabalhos importados/atualizados.\`);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao sincronizar trabalhos: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };
`;

if (!content.includes("handleSyncWorks")) {
  content = content.replace(
    "const handleAddWork = (e: React.FormEvent) => {",
    syncFunc + "\n\n  const handleAddWork = (e: React.FormEvent) => {"
  );
}

// Add UI button
const uiButton = `
                <button
                  type="button"
                  onClick={handleSyncWorks}
                  disabled={isSyncing}
                  className="flex items-center justify-between w-full p-4 mb-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition disabled:opacity-50"
                >
                  <span className="text-sm font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw className={\`w-5 h-5 \${isSyncing ? 'animate-spin' : ''}\`} />
                    Sincronizar Trabalhos do Banco do Evento
                  </span>
                </button>
`;

if (!content.includes("Sincronizar Trabalhos do Banco do Evento")) {
  content = content.replace(
    '<button\n                  type="button"\n                  onClick={() => setShowAddWork(!showAddWork)}',
    uiButton + '\n                <button\n                  type="button"\n                  onClick={() => setShowAddWork(!showAddWork)}'
  );
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log("Patched AdminPanel.tsx");
