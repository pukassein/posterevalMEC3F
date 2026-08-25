import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Add "Evaluators" tab button in nav
const oldNav = `<button
            onClick={() => setActiveTab('results')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'results' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Resultados
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'works' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Trabalhos
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'assignments' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Users className="w-4 h-4 mr-2" />
            Atribuições
          </button>`;

const newNav = `<button
            onClick={() => setActiveTab('results')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'results' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Resultados
          </button>
          <button
            onClick={() => setActiveTab('evaluators')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'evaluators' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Avaliadores
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'works' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Trabalhos
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={\`py-3 px-2 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center \${activeTab === 'assignments' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            <Users className="w-4 h-4 mr-2" />
            Atribuições
          </button>`;

code = code.replace(oldNav, newNav);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
