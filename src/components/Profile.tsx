import { LogOut, ShieldCheck, User, ClipboardList, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Profile({ myCount, total }: { myCount: number; total: number }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="h-full overflow-y-auto px-4 pt-20 pb-28">
      <h2 className="text-xl font-bold mb-4">Perfil</h2>

      <section className="urban-glass urban-shadow rounded-2xl p-4 flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
          {isAdmin ? (
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          ) : (
            <User className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user?.name}</p>
          {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'Administrador · Gestão urbana' : 'Cidadão · Monitoramento'}
          </p>
        </div>

      </section>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="urban-glass urban-shadow rounded-2xl p-4">
          <ClipboardList className="w-4 h-4 text-primary mb-1" />
          <p className="text-lg font-bold tabular-nums">{myCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Meus chamados
          </p>
        </div>
        <div className="urban-glass urban-shadow rounded-2xl p-4">
          <MapPin className="w-4 h-4 text-primary mb-1" />
          <p className="text-lg font-bold tabular-nums">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Chamados na cidade
          </p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full rounded-xl border-2 border-border p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all text-destructive"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>
    </div>
  );
}
