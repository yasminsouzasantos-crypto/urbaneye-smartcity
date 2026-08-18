import { Map, ClipboardList, BarChart3 } from 'lucide-react';

export type TabKey = 'map' | 'mine' | 'admin';

const TABS: { key: TabKey; label: string; icon: typeof Map }[] = [
  { key: 'map', label: 'Mapa', icon: Map },
  { key: 'mine', label: 'Meus chamados', icon: ClipboardList },
  { key: 'admin', label: 'Gestão', icon: BarChart3 },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[700] urban-glass border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors active:scale-[0.97] ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
