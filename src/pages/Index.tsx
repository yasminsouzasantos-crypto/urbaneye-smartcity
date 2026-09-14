import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Plus, MapPin, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUrbanReports } from '@/hooks/useUrbanReports';
import { useAuth } from '@/hooks/useAuth';
import UrbanMap from '@/components/UrbanMap';
import Dashboard from '@/components/Dashboard';
import ReportModal from '@/components/ReportModal';
import ReportDetail from '@/components/ReportDetail';
import MyReports from '@/components/MyReports';
import Profile from '@/components/Profile';
import BottomNav, { TabKey } from '@/components/BottomNav';
import { Priority, ProblemType, ReportStatus, UrbanImageAnalysis, UrbanReport } from '@/types/urban';
import { reverseGeocode } from '@/lib/urban';
import { toast } from 'sonner';

const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));

export default function Index({ initialTab = 'map' }: { initialTab?: TabKey }) {
  const { position, hasPermission, loading } = useGeolocation();
  const { isAdmin, user } = useAuth();
  const { reports, addReport, updateStatus, updatePriority, confirmResolution, stats, storageError } =
    useUrbanReports(position, { userId: user.id, isAdmin });
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<UrbanReport | null>(null);
  const [address, setAddress] = useState<string | undefined>();
  const [addressLoading, setAddressLoading] = useState(false);

  // guard: citizens can never land on the management tab
  useEffect(() => {
    if (!isAdmin && tab === 'admin') setTab('map');
  }, [isAdmin, tab]);

  // keep the approximate address in sync with the user position
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setAddress(undefined);
    setAddressLoading(true);
    const t = setTimeout(async () => {
      const found = await reverseGeocode(position[0], position[1], controller.signal);
      if (!cancelled) {
        setAddress(found);
        setAddressLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
      controller.abort();
    };
  }, [position]);

  const handleReportClick = useCallback((report: UrbanReport) => setSelected(report), []);

  const handleSubmitReport = useCallback(
    (data: {
      type: ProblemType;
      description: string;
      photo?: string;
      aiAnalysis?: UrbanImageAnalysis;
    }) => {
      addReport({ ...data, position, address });
    },
    [addReport, position, address]
  );

  const handleStatusChange = useCallback(
    (id: string, status: ReportStatus) => {
      try {
        updateStatus(id, status);
        toast.success('Status atualizado');
      } catch (error) { toast.error((error as Error).message); }
    },
    [updateStatus]
  );

  const handlePriorityChange = useCallback(
    (id: string, priority: Priority) => {
      try {
        updatePriority(id, priority);
        toast.success('Prioridade atualizada');
      } catch (error) { toast.error((error as Error).message); }
    },
    [updatePriority]
  );

  const handleConfirmResolution = useCallback(
    (id: string, solved: boolean) => {
      try {
        confirmResolution(id, solved);
        toast.success(
          solved ? 'Obrigado por confirmar a resolução' : 'Chamado reaberto para novo atendimento'
        );
      } catch (error) { toast.error((error as Error).message); }
    },
    [confirmResolution]
  );

  // keep selected report fresh after updates
  const selectedLive = selected ? reports.find((r) => r.id === selected.id) ?? null : null;
  const mineCount = reports.filter((r) => r.mine).length;

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[500] urban-glass">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">UrbanEye</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isAdmin ? 'Gestão urbana' : 'Smart City Monitor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className={`w-4 h-4 ${hasPermission ? 'text-[hsl(var(--urban-ok))]' : 'text-muted-foreground'}`} />
            <span className="text-[10px] text-muted-foreground font-medium">
              {loading ? 'Localizando...' : hasPermission ? 'GPS ativo' : 'Sorocaba'}
            </span>
          </div>
        </div>
      </header>

      {storageError && (
        <div role="alert" className="absolute top-20 inset-x-4 z-[600] rounded-xl bg-destructive p-3 text-sm text-destructive-foreground">
          {storageError}
        </div>
      )}

      {/* Map stays mounted so Leaflet never repaints blank on tab change */}
      <div className={`absolute inset-0 ${tab === 'map' ? '' : 'invisible pointer-events-none'}`}>
        <UrbanMap
          position={position}
          reports={reports}
          onReportClick={handleReportClick}
          active={tab === 'map'}
          hasPermission={hasPermission}
        />
      </div>
      {tab === 'map' && (
        <div className="absolute bottom-20 left-0 right-0 z-[500]">
          <Dashboard stats={stats} />
        </div>
      )}

      {tab === 'mine' && (
        <div className="absolute inset-0 bg-background">
          <MyReports reports={reports} onSelect={setSelected} onCreate={() => setModalOpen(true)} />
        </div>
      )}

      {tab === 'admin' && isAdmin && (
        <div className="absolute inset-0 bg-background">
          <Suspense fallback={<p role="status" className="pt-20 px-4">Carregando gestão urbana...</p>}>
            <AdminDashboard reports={reports} onSelect={setSelected} />
          </Suspense>
        </div>
      )}

      {tab === 'profile' && (
        <div className="absolute inset-0 bg-background">
          <Profile myCount={mineCount} total={reports.length} />
        </div>
      )}

      {/* FAB */}
      {(tab === 'map' || tab === 'mine') && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-36 right-4 z-[600] w-14 h-14 rounded-2xl bg-primary text-primary-foreground urban-shadow-lg flex items-center justify-center active:scale-[0.92] transition-transform hover:opacity-90"
          aria-label="Reportar problema"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      <BottomNav active={tab} onChange={setTab} isAdmin={isAdmin} />

      <ReportModal
        key={user.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReport}
        position={position}
        address={address}
        addressLoading={addressLoading}
      />

      <ReportDetail
        key={selectedLive?.id ?? 'closed'}
        report={selectedLive}
        onClose={() => setSelected(null)}
        canManage={isAdmin}
        canViewPhoto={isAdmin || !!selectedLive?.mine}
        onStatusChange={handleStatusChange}
        onPriorityChange={isAdmin ? handlePriorityChange : undefined}
        onConfirmResolution={handleConfirmResolution}
      />
    </div>
  );
}
