import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { UrbanReport, PROBLEM_SHORT, STATUS_COLORS, DEFAULT_LOCATION } from '@/types/urban';

/** Grid-based heat aggregation (no extra dependency needed). */
function heatCells(reports: UrbanReport[]) {
  const cell = 0.006;
  const map = new Map<string, { lat: number; lng: number; count: number }>();
  for (const r of reports) {
    const key = `${Math.round(r.lat / cell)}:${Math.round(r.lng / cell)}`;
    const entry = map.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      map.set(key, {
        lat: Math.round(r.lat / cell) * cell,
        lng: Math.round(r.lng / cell) * cell,
        count: 1,
      });
    }
  }
  return [...map.values()];
}

export default function AdminMap({
  reports,
  heat,
  onSelect,
}: {
  reports: UrbanReport[];
  heat: boolean;
  onSelect: (r: UrbanReport) => void;
}) {
  const cells = useMemo(() => heatCells(reports), [reports]);
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <MapContainer
      center={DEFAULT_LOCATION}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {heat
        ? cells.map((c) => {
            const t = c.count / max;
            const color = t > 0.66 ? '#ef4444' : t > 0.33 ? '#f59e0b' : '#22c55e';
            return (
              <CircleMarker
                key={`${c.lat}-${c.lng}`}
                center={[c.lat, c.lng]}
                radius={12 + t * 22}
                pathOptions={{ color: 'transparent', fillColor: color, fillOpacity: 0.18 + t * 0.35 }}
              >
                <Popup>
                  <span className="text-sm font-medium">{c.count} chamados nesta área</span>
                </Popup>
              </CircleMarker>
            );
          })
        : reports.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={7}
              pathOptions={{ color: '#fff', weight: 2, fillColor: STATUS_COLORS[r.status], fillOpacity: 0.9 }}
              eventHandlers={{ click: () => onSelect(r) }}
            >
              <Popup>
                <span className="text-sm font-medium">{PROBLEM_SHORT[r.type]}</span>
              </Popup>
            </CircleMarker>
          ))}
    </MapContainer>
  );
}
