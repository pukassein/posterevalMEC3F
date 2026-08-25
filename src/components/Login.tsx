import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Evaluator } from '../types';

interface LoginProps {
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <img 
          src="https://www.mec3f.com/logomec3f.png" 
          alt="MEC3F Logo" 
          className="h-16 mx-auto mb-6 object-contain" 
        />
        
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Login do Avaliador</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Insira seu código de 3 dígitos para acessar suas avaliações. 
            
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
              Código de Acesso (3 dígitos)
            </label>
            {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ex: 492"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-slate-900"
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={!identifier.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all hover:shadow-md focus:ring-4 focus:ring-teal-200 outline-none active:scale-[0.98]"
          >
            Iniciar Sessão
          </button>
        </form>
      </div>
    </div>
  );
}
