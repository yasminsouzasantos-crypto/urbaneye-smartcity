import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  ImageIcon,
  Layers,
  MapPin,
  Search,
  Wrench,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  PROBLEM_SHORT,
  ProblemType,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  Severity,
  STATUS_COLORS,
  UrbanReport,
} from '@/types/urban';
import { formatDuration, regionFor, resolutionMs } from '@/lib/urban';
import AdminMap from './AdminMap';

const DAY = 86400000;

export default function AdminDashboard({
  reports,
  onSelect,
}: {
  reports: UrbanReport[];
  onSelect: (r: UrbanReport) => void;
}) {
  const [heat, setHeat] = useState(true);

  const data = useMemo(() => {
    const now = Date.now();
    const counts = {
      total: reports.length,
      aberto: reports.filter((r) => r.status === 'aberto').length,
      analise: reports.filter((r) => r.status === 'analise').length,
      atendimento: reports.filter((r) => r.status === 'atendimento').length,
      resolvido: reports.filter((r) => r.status === 'resolvido').length,
      criticos: reports.filter((r) => r.severity === 'severe' && r.status !== 'resolvido').length,
    };

    const resolved = reports.map(resolutionMs).filter((v): v is number => v !== null);
    const avgMs = resolved.length ? resolved.reduce((a, b) => a + b, 0) / resolved.length : 0;

    // avg resolution this week vs previous week
    const week = reports.filter((r) => r.resolvedAt && now - r.resolvedAt.getTime() <= 7 * DAY);
    const prevWeek = reports.filter(
      (r) =>
        r.resolvedAt &&
        now - r.resolvedAt.getTime() > 7 * DAY &&
        now - r.resolvedAt.getTime() <= 14 * DAY
    );
    const avgOf = (list: UrbanReport[]) => {
      const v = list.map(resolutionMs).filter((x): x is number => x !== null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    };
    const weekAvg = avgOf(week);
    const prevAvg = avgOf(prevWeek);
    const trendPct = prevAvg ? Math.round(((weekAvg - prevAvg) / prevAvg) * 100) : 0;

    const byType = (['acidente', 'obra', 'iluminacao', 'transito'] as ProblemType[]).map((t) => ({
      name: PROBLEM_SHORT[t],
      value: reports.filter((r) => r.type === t).length,
    }));

    const bySeverity = (['severe', 'warning', 'normal'] as Severity[]).map((s) => ({
      name: SEVERITY_LABELS[s],
      value: reports.filter((r) => r.severity === s).length,
      color: SEVERITY_COLORS[s],
    }));

    const byDay = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(now - (13 - i) * DAY);
      const label = day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const count = reports.filter(
        (r) => r.timestamp.toDateString() === day.toDateString()
      ).length;
      return { name: label, chamados: count };
    });

    const regionsMap = new Map<string, { total: number; resolvedMs: number[]; criticos: number }>();
    for (const r of reports) {
      const key = r.region ?? regionFor(r.lat, r.lng);
      const entry = regionsMap.get(key) ?? { total: 0, resolvedMs: [], criticos: 0 };
      entry.total += 1;
      if (r.severity === 'severe' && r.status !== 'resolvido') entry.criticos += 1;
      const ms = resolutionMs(r);
      if (ms !== null) entry.resolvedMs.push(ms);
      regionsMap.set(key, entry);
    }
    const regions = [...regionsMap.entries()]
      .map(([name, v]) => ({
        name,
        total: v.total,
        criticos: v.criticos,
        avgMs: v.resolvedMs.length
          ? v.resolvedMs.reduce((a, b) => a + b, 0) / v.resolvedMs.length
          : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const recurring = [...byType].sort((a, b) => b.value - a.value);

    return { counts, avgMs, trendPct, byType, bySeverity, byDay, regions, recurring };
  }, [reports]);

  const kpis = [
    { label: 'Total', value: data.counts.total, icon: Activity, color: 'text-primary' },
    { label: 'Abertos', value: data.counts.aberto, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Em análise', value: data.counts.analise, icon: Search, color: 'text-[hsl(var(--urban-warning))]' },
    { label: 'Atendimento', value: data.counts.atendimento, icon: Wrench, color: 'text-primary' },
    { label: 'Resolvidos', value: data.counts.resolvido, icon: CheckCircle2, color: 'text-[hsl(var(--urban-ok))]' },
    { label: 'Críticos', value: data.counts.criticos, icon: Flame, color: 'text-destructive' },
  ];

  const alerts: { text: string; tone: 'danger' | 'warn' }[] = [];
  if (data.counts.criticos > 0)
    alerts.push({
      text: `⚠️ ${data.counts.criticos} chamados críticos aguardando atendimento`,
      tone: 'danger',
    });
  if (data.regions[0])
    alerts.push({
      text: `🔴 Região ${data.regions[0].name} possui a maior concentração de problemas (${data.regions[0].total})`,
      tone: 'warn',
    });
  if (data.trendPct !== 0)
    alerts.push({
      text: `⏱️ Tempo médio de resolução ${data.trendPct > 0 ? 'aumentou' : 'reduziu'} ${Math.abs(
        data.trendPct
      )}% esta semana`,
      tone: data.trendPct > 0 ? 'danger' : 'warn',
    });

  const pieColors = ['#3b82f6', '#f59e0b', '#a855f7', '#22c55e'];

  const recent = useMemo(
    () => [...reports].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8),
    [reports]
  );

  return (
    <div className="h-full overflow-y-auto px-4 pt-20 pb-28 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Gestão urbana</h2>
        <p className="text-sm text-muted-foreground">Análise dos chamados da cidade</p>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((a) => (
          <div
            key={a.text}
            className={`rounded-2xl p-3 text-sm font-medium animate-slide-up-fade ${
              a.tone === 'danger'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-[hsl(var(--urban-warning))]/12 text-[hsl(var(--urban-warning))]'
            }`}
          >
            {a.text}
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {kpis.map((k) => (
          <div key={k.label} className="urban-glass urban-shadow rounded-2xl p-3 flex flex-col items-center gap-1">
            <k.icon className={`w-4 h-4 ${k.color}`} />
            <span className="text-lg font-bold tabular-nums">{k.value}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">
              {k.label}
            </span>
          </div>
        ))}
      </div>

      <div className="urban-glass urban-shadow rounded-2xl p-4 flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Tempo médio de resolução
          </p>
          <p className="text-base font-bold">{data.avgMs ? formatDuration(data.avgMs) : '—'}</p>
        </div>
      </div>

      {/* Chamados por tipo */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Chamados por tipo</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.byType} margin={{ left: -20, right: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="value" name="Chamados" radius={[8, 8, 0, 0]}>
              {data.byType.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Gravidade */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Chamados por gravidade</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data.bySeverity} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
              {data.bySeverity.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1">
          {data.bySeverity.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              {s.name} ({s.value})
            </span>
          ))}
        </div>
      </section>

      {/* Evolução */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Evolução dos chamados (14 dias)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.byDay} margin={{ left: -20, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="chamados"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Problemas recorrentes */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Problemas mais recorrentes</h3>
        <ul className="space-y-2">
          {data.recurring.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-secondary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{r.name}</span>
              <span className="text-sm font-bold tabular-nums">{r.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ranking de regiões */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Ranking de regiões
        </h3>
        <ul className="space-y-2.5">
          {data.regions.map((r, i) => (
            <li key={r.name}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{r.name}</span>
                <span className="text-sm font-bold tabular-nums">{r.total} chamados</span>
              </div>
              <div className="ml-9 mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(r.total / data.regions[0].total) * 100}%` }}
                />
              </div>
              <p className="ml-9 mt-1 text-[11px] text-muted-foreground">
                Tempo médio: {r.avgMs ? formatDuration(r.avgMs) : '—'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Chamados recentes */}
      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Chamados recentes</h3>
        <ul className="space-y-2">
          {recent.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r)}
                className="w-full text-left flex items-center gap-3 rounded-xl p-2 hover:bg-secondary active:scale-[0.99] transition-all"
              >
                {r.photo ? (
                  <img src={r.photo} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                ) : (
                  <span className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{PROBLEM_SHORT[r.type]}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {r.address ?? r.region ?? 'Local registrado'}
                  </span>
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: STATUS_COLORS[r.status] }}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Mapa */}

      <section className="urban-glass urban-shadow rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Mapa dos chamados
          </h3>
          <div className="flex rounded-full bg-secondary p-1 text-[11px] font-semibold">
            <button
              onClick={() => setHeat(true)}
              className={`px-3 py-1 rounded-full transition-all ${heat ? 'bg-background urban-shadow' : 'text-muted-foreground'}`}
            >
              Calor
            </button>
            <button
              onClick={() => setHeat(false)}
              className={`px-3 py-1 rounded-full transition-all ${!heat ? 'bg-background urban-shadow' : 'text-muted-foreground'}`}
            >
              Pontos
            </button>
          </div>
        </div>
        <div className="h-64 rounded-xl overflow-hidden">
          <AdminMap reports={reports} heat={heat} onSelect={onSelect} />
        </div>
        {!heat && (
          <div className="flex flex-wrap gap-3 mt-2">
            {Object.entries(STATUS_COLORS).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                {k}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
