import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Role, useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('cidadao');
  const [name, setName] = useState('');

  const enter = () => {
    login(role, name);
    navigate(role === 'admin' ? '/gestao' : '/', { replace: true });
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-center px-5 py-10 bg-background">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">UrbanEye</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento urbano inteligente — escolha como deseja entrar
          </p>
        </div>

        <div className="space-y-3 mb-5">
          <button
            onClick={() => setRole('cidadao')}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
              role === 'cidadao'
                ? 'border-primary bg-[hsl(var(--urban-blue-light))]'
                : 'border-border bg-background hover:border-primary/30'
            }`}
          >
            <User className="w-6 h-6 text-primary shrink-0" />
            <span>
              <span className="block font-semibold">Cidadão</span>
              <span className="block text-xs text-muted-foreground">
                Ver o mapa, abrir chamados e acompanhar os seus registros
              </span>
            </span>
          </button>

          <button
            onClick={() => setRole('admin')}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
              role === 'admin'
                ? 'border-primary bg-[hsl(var(--urban-blue-light))]'
                : 'border-border bg-background hover:border-primary/30'
            }`}
          >
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <span>
              <span className="block font-semibold">Administrador</span>
              <span className="block text-xs text-muted-foreground">
                Gestão dos chamados, indicadores, mapa de calor e ranking
              </span>
            </span>
          </button>
        </div>

        <label htmlFor="login-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Nome (opcional)
        </label>
        <input
          id="login-name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder={role === 'admin' ? 'Ex.: Eng. Marina' : 'Ex.: Yasmin'}
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground"
        />

        <button
          onClick={enter}
          className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:opacity-90"
        >
          Entrar como {role === 'admin' ? 'Administrador' : 'Cidadão'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Acesso de demonstração. As permissões de cada perfil são aplicadas na navegação.
        </p>
      </div>
    </main>
  );
}
