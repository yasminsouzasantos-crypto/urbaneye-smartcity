import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import MapAutoSize from '@/components/map/MapAutoSize';
import { UrbanReport, PROBLEM_LABELS, SEVERITY_LABELS, SEVERITY_COLORS, STATUS_COLORS, STATUS_LABELS, PRIORITY_LABELS } from '@/types/urban';
import { WORLD_BOUNDS } from '@/lib/mapConfig';

function UserMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  const centered = useRef(false);

  useEffect(() => {
    if (centered.current) return;
    centered.current = true;
    map.setView(position, map.getZoom(), { animate: false });
  }, [position, map]);

  return (
    <>
      <CircleMarker
        center={position}
        radius={20}
        pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.15 }}
        className="user-marker-pulse"
      />
      <CircleMarker
        center={position}
        radius={7}
        pathOptions={{ color: '#fff', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }}
      >
        <Popup>
          <span className="text-sm font-medium">📍 Você está aqui</span>
        </Popup>
      </CircleMarker>
    </>
  );
}

function RecenterButton({ position }: { position: [number, number] }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(position, 15, { animate: true })}
      className="absolute right-3 top-20 z-[500] w-11 h-11 rounded-xl bg-card text-foreground urban-shadow flex items-center justify-center active:scale-[0.94] transition-transform"
      aria-label="Centralizar no meu local"
    >
      <LocateFixed className="w-5 h-5 text-primary" />
    </button>
  );
}

function ReportMarker({ report, onClick }: { report: UrbanReport; onClick: (r: UrbanReport) => void }) {
  const color = SEVERITY_COLORS[report.severity];
  return (
    <CircleMarker
      center={[report.lat, report.lng]}
      radius={report.isSensor ? 6 : 9}
      pathOptions={{
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9,
      }}
      eventHandlers={{ click: () => onClick(report) }}
    >
      <Popup>
        <div className="min-w-[180px]">
          <p className="font-semibold text-sm mb-1">{PROBLEM_LABELS[report.type]}</p>
          <p className="text-xs text-muted-foreground mb-1">{report.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{SEVERITY_LABELS[report.severity]}</span>
            <span className="font-medium">
              {STATUS_DOTS[report.status]} {STATUS_LABELS[report.status]}
            </span>
            <span className="text-muted-foreground">
              {report.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {report.isSensor && (
            <span className="text-[10px] text-muted-foreground mt-1 block">📡 Detectado por sensor</span>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

interface UrbanMapProps {
  position: [number, number];
  reports: UrbanReport[];
  onReportClick: (report: UrbanReport) => void;
  active?: boolean;
}

export default function UrbanMap({ position, reports, onReportClick, active = true }: UrbanMapProps) {
  const markers = useMemo(
    () => reports.map(r => <ReportMarker key={r.id} report={r} onClick={onReportClick} />),
    [reports, onReportClick]
  );

  return (
    <MapContainer
      center={position}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      maxZoom={19}
      worldCopyJump={false}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1}
    >
      <MapAutoSize active={active} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={19}
        noWrap
        bounds={WORLD_BOUNDS}
      />
      <UserMarker position={position} />
      <RecenterButton position={position} />
      {markers}
    </MapContainer>
  );
}
