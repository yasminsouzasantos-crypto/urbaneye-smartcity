import { useState, useCallback, useEffect } from 'react';
import { Plus, MapPin, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUrbanReports } from '@/hooks/useUrbanReports';
import UrbanMap from '@/components/UrbanMap';
import Dashboard from '@/components/Dashboard';
import ReportModal from '@/components/ReportModal';
import ReportDetail from '@/components/ReportDetail';
import MyReports from '@/components/MyReports';
import AdminDashboard from '@/components/AdminDashboard';
import BottomNav, { TabKey } from '@/components/BottomNav';
import { ProblemType, ReportStatus, UrbanReport } from '@/types/urban';
import { reverseGeocode } from '@/lib/urban';
import { toast } from 'sonner';

export default function Index() {
  const { position, hasPermission, loading } = useGeolocation();
  const { reports, addReport, updateStatus, stats } = useUrbanReports(position);
  const [tab, setTab] = useState<TabKey>('map');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<UrbanReport | null>(null);
  const [address, setAddress] = useState<string | undefined>();
  const [addressLoading, setAddressLoading] = useState(false);

  // keep the approximate address in sync with the user position
  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    const t = setTimeout(async () => {
      const found = await reverseGeocode(position[0], position[1]);
      if (!cancelled) {
        setAddress(found);
        setAddressLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [position]);

  const handleReportClick = useCallback((report: UrbanReport) => setSelected(report), []);

  const handleSubmitReport = useCallback(
    (data: { type: ProblemType; description: string; photo?: string }) => {
      addReport({ ...data, position, address });
    },
    [addReport, position, address]
  );

  const handleStatusChange = useCallback(
    (id: string, status: ReportStatus) => {
      updateStatus(id, status);
      setSelected((prev) =>
        prev && prev.id === id
          ? { ...prev, status, resolvedAt: status === 'resolvido' ? prev.resolvedAt ?? new Date() : undefined }
          : prev
      );
      toast.success('Status atualizado');
    },
    [updateStatus]
  );

  // keep selected report fresh after updates
  const selectedLive = selected ? reports.find((r) => r.id === selected.id) ?? selected : null;

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
                Smart City Monitor
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

      {tab === 'map' && (
        <>
          <div className="absolute inset-0">
            <UrbanMap position={position} reports={reports} onReportClick={handleReportClick} />
          </div>
          <div className="absolute bottom-20 left-0 right-0 z-[500]">
            <Dashboard stats={stats} />
          </div>
        </>
      )}

      {tab === 'mine' && (
        <MyReports reports={reports} onSelect={setSelected} onCreate={() => setModalOpen(true)} />
      )}

      {tab === 'admin' && <AdminDashboard reports={reports} onSelect={setSelected} />}

      {/* FAB */}
      {tab !== 'admin' && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-36 right-4 z-[600] w-14 h-14 rounded-2xl bg-primary text-primary-foreground urban-shadow-lg flex items-center justify-center active:scale-[0.92] transition-transform hover:opacity-90"
          aria-label="Reportar problema"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      <BottomNav active={tab} onChange={setTab} />

      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReport}
        position={position}
        address={address}
        addressLoading={addressLoading}
      />

      <ReportDetail
        report={selectedLive}
        onClose={() => setSelected(null)}
        canManage={tab === 'admin'}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
