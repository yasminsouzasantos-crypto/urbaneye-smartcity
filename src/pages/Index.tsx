import { useState, useCallback } from 'react';
import { Plus, MapPin, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUrbanReports } from '@/hooks/useUrbanReports';
import UrbanMap from '@/components/UrbanMap';
import Dashboard from '@/components/Dashboard';
import ReportModal from '@/components/ReportModal';
import { UrbanReport, ProblemType } from '@/types/urban';

export default function Index() {
  const { position, hasPermission, loading } = useGeolocation();
  const { reports, addReport, stats } = useUrbanReports(position);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setSelectedReport] = useState<UrbanReport | null>(null);

  const handleReportClick = useCallback((report: UrbanReport) => {
    setSelectedReport(report);
  }, []);

  const handleSubmitReport = useCallback(
    (type: ProblemType, description: string) => {
      addReport(type, description, position);
    },
    [addReport, position]
  );

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

      {/* Map */}
      <div className="absolute inset-0">
        <UrbanMap position={position} reports={reports} onReportClick={handleReportClick} />
      </div>

      {/* Dashboard overlay */}
      <div className="absolute bottom-6 left-0 right-0 z-[500]">
        <Dashboard stats={stats} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-28 right-4 z-[600] w-14 h-14 rounded-2xl bg-primary text-primary-foreground urban-shadow-lg flex items-center justify-center active:scale-[0.92] transition-transform hover:opacity-90"
        aria-label="Reportar problema"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Report Modal */}
      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
