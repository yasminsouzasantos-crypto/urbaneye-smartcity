import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import UrbanMap from '../UrbanMap';
import AdminMap from '../AdminMap';

const { tileLayer, map } = vi.hoisted(() => ({ tileLayer: vi.fn(), map: { setView: vi.fn(), getZoom: () => 14 } }));
// No network: validates the options passed by each map, not provider availability.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: (props: unknown) => { tileLayer(props); return null; },
  CircleMarker: () => null,
  Popup: () => null,
  AttributionControl: () => null,
  useMap: () => map,
}));
vi.mock('./MapAutoSize', () => ({ default: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('contrato dos fundos cartográficos (sem rede)', () => {
  it.each(['principal', 'gestão'])('usa OSM sem chave, atribuição e identificação/cache normais no mapa %s', name => {
    render(name === 'principal'
      ? <UrbanMap position={[-23.5015, -47.4526]} reports={[]} onReportClick={vi.fn()} />
      : <AdminMap reports={[]} heat onSelect={vi.fn()} />);
    expect(tileLayer).toHaveBeenCalledTimes(1);
    const options = tileLayer.mock.calls[0][0];
    expect(options.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(options.attribution).toContain('https://www.openstreetmap.org/copyright');
    expect(options.attribution).toContain('OpenStreetMap contributors');
    expect(options).toMatchObject({ referrerPolicy: 'strict-origin-when-cross-origin', updateWhenIdle: true,
      updateWhenZooming: false, noWrap: true, maxZoom: 19 });
    expect(options.subdomains).toBeUndefined();
    expect(options.detectRetina).toBeUndefined();
  });

  it.each(['principal', 'gestão'])('não monta tiles do mapa %s oculto e permite reativá-lo', name => {
    const view = (active: boolean) => name === 'principal'
      ? <UrbanMap active={active} position={[-23.5015, -47.4526]} reports={[]} onReportClick={vi.fn()} />
      : <AdminMap active={active} reports={[]} heat onSelect={vi.fn()} />;
    const { rerender } = render(view(false));
    expect(tileLayer).not.toHaveBeenCalled();
    rerender(view(true));
    expect(tileLayer).toHaveBeenCalledTimes(1);
  });
});
