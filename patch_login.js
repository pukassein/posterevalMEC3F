import fs from 'fs';
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const newProps = `interface LoginProps {
  onLogin: (evaluator: Evaluator) => void;
  evaluators: Evaluator[];
}

export function Login({ onLogin, evaluators }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const idVal = identifier.trim();
    if (!idVal) return;
    
    if (idVal.toLowerCase() === 'admin') {
      onLogin({
        id: 'admin',
        name: 'Administrador',
        accessCode: 'admin'
      });
      return;
    }
    
    // Find evaluator by access code
    const ev = evaluators.find(e => e.accessCode === idVal);
    if (ev) {
      onLogin(ev);
    } else {
      setErrorMsg('Código de acesso inválido. Verifique com a administração.');
    }
  };`;

code = code.replace(/interface LoginProps {[\s\S]*?const handleSubmit = \(e: React\.FormEvent\) => {[\s\S]*?  };/, newProps);

code = code.replace('Nome ou ID do Avaliador', 'Código de Acesso (3 dígitos)');
code = code.replace('Insira seu Nome ou ID de Avaliador para iniciar a sessão.', 'Insira seu código de 3 dígitos para acessar suas avaliações.');
code = code.replace('placeholder="ex: Dr. Silva ou EV-102"', 'placeholder="ex: 492"');

code = code.replace(
`<div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
              Código de Acesso (3 dígitos)
            </label>`,
`<div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
              Código de Acesso (3 dígitos)
            </label>
            {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}`);

fs.writeFileSync('src/components/Login.tsx', code);
