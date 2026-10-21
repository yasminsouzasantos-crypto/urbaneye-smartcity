import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, ShieldCheck, ArrowRight, Activity, Radio, Eye, EyeOff } from 'lucide-react';
import { Role, useAuth } from '@/hooks/useAuth';

type Mode = 'entrar' | 'criar';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('entrar');
  const [role, setRole] = useState<Role>('cidadao');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
    const result = await (
      mode === 'criar' ? signUp({ name, email, password, role }) : signIn({ email, password }));
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    navigate('/', { replace: true });
    } catch { setError('Não foi possível entrar. Tente novamente.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-background relative overflow-hidden">
      {/* decorative city grid */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-72 bg-[hsl(var(--urban-navy))]"
        style={{
          backgroundImage:
            'linear-gradient(hsla(0,0%,100%,0.06) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: 'hsl(var(--urban-blue))' }}
      />

      <div className="relative mx-auto w-full max-w-md px-5 pt-12 pb-10">
        <header className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-4 urban-shadow-lg animate-pop-in">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary-foreground))]">UrbanEye</h1>
          <p className="text-sm text-[hsla(0,0%,100%,0.7)] mt-1">
            Monitoramento urbano inteligente em tempo real
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[hsla(0,0%,100%,0.75)]">
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <Radio className="w-3.5 h-3.5" /> Sensores
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <MapPin className="w-3.5 h-3.5" /> Mapa vivo
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <Activity className="w-3.5 h-3.5" /> Indicadores
            </span>
          </div>
        </header>

        <form
          onSubmit={submit}
          className="urban-glass urban-shadow-lg rounded-3xl p-5 animate-slide-up-fade"
        >
          <fieldset disabled={busy} className="contents">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-secondary mb-5">
            {(['entrar', 'criar'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  mode === m ? 'bg-card urban-shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                {m === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {mode === 'criar' && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setRole('cidadao')}
                  className={`rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98] ${
                    role === 'cidadao'
                      ? 'border-primary bg-[hsl(var(--urban-blue-light))]'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <User className="w-5 h-5 text-primary mb-1" />
                  <span className="block text-sm font-semibold">Cidadão</span>
                  <span className="block text-[11px] text-muted-foreground">Abrir e acompanhar chamados</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98] ${
                    role === 'admin'
                      ? 'border-primary bg-[hsl(var(--urban-blue-light))]'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-primary mb-1" />
                  <span className="block text-sm font-semibold">Administrador</span>
                  <span className="block text-[11px] text-muted-foreground">Gestão, indicadores e calor</span>
                </button>
              </div>

              <label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Nome
              </label>
              <input
                id="signup-name"
                value={name}
                maxLength={60}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'admin' ? 'Ex.: Eng. Marina' : 'Ex.: Yasmin Souza'}
                className="w-full rounded-xl border border-border bg-card p-3.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </>
          )}

          <label htmlFor="auth-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            E-mail
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            maxLength={255}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="w-full rounded-xl border border-border bg-card p-3.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          <label htmlFor="auth-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Senha
          </label>
          <div className="relative mb-4">
            <input
              id="auth-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              maxLength={72}
              autoComplete={mode === 'criar' ? 'new-password' : 'current-password'}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-xl border border-border bg-card p-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:opacity-90 disabled:opacity-60"
          >
            {mode === 'criar' ? 'Criar conta' : 'Entrar'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            {mode === 'criar'
              ? 'As permissões do perfil escolhido são aplicadas em toda a navegação.'
              : 'Ainda não tem conta? Toque em “Criar conta” acima.'}
          </p>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
