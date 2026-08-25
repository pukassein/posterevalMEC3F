import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// add Evaluator to import
code = code.replace("import { Poster, Criterion, Evaluation, Tematica, TEMATICAS } from '../types';", "import { Poster, Criterion, Evaluation, Tematica, TEMATICAS, Evaluator } from '../types';");

// update AdminPanelProps
code = code.replace(
`interface AdminPanelProps {
  posters: Poster[];
  assignments: Record<string, string[]>;
  evaluations: Evaluation[];
  criteria: Criterion[];
  onSaveAssignments: (assignments: Record<string, string[]>) => void;
  onSaveCriteria: (criteria: Criterion[]) => void;
  onSavePosters: (posters: Poster[]) => void;
  onLogout: () => void;
}`,
`interface AdminPanelProps {
  posters: Poster[];
  assignments: Record<string, string[]>;
  evaluations: Evaluation[];
  criteria: Criterion[];
  evaluators: Evaluator[];
  onSaveAssignments: (assignments: Record<string, string[]>) => void;
  onSaveCriteria: (criteria: Criterion[]) => void;
  onSavePosters: (posters: Poster[]) => void;
  onSaveEvaluators: (evaluators: Evaluator[]) => void;
  onLogout: () => void;
}`);

// update AdminPanel component definition
code = code.replace(
`export function AdminPanel({ posters, assignments, evaluations, criteria, onSaveAssignments, onSaveCriteria, onSavePosters, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'assignments' | 'criteria' | 'works'>('results');`,
`export function AdminPanel({ posters, assignments, evaluations, criteria, evaluators = [], onSaveAssignments, onSaveCriteria, onSavePosters, onSaveEvaluators, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'evaluators' | 'assignments' | 'criteria' | 'works'>('results');
  const [localEvaluators, setLocalEvaluators] = useState<Evaluator[]>(evaluators);
  const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [savedEvaluatorsMsg, setSavedEvaluatorsMsg] = useState(false);`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
