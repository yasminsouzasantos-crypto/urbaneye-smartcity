import type { LatLngBoundsExpression } from 'leaflet';

// Public standard tiles for low-volume, interactive local demonstrations.
// Honour browser caching; no offline download/prefetch or automated tile scans.
// https://operations.osmfoundation.org/policies/tiles/
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
export const MAP_TILE_OPTIONS = {
  attribution: MAP_ATTRIBUTION,
  referrerPolicy: 'strict-origin-when-cross-origin',
  maxZoom: 19,
  noWrap: true,
  updateWhenIdle: true,
  updateWhenZooming: false,
} as const;

/**
 * Single world representation: Leaflet is bounded to one copy of the globe,
 * so no horizontal repetition appears when zooming out.
 */
export const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];
