import type { LatLngBoundsExpression } from 'leaflet';

/**
 * Single world representation: Leaflet is bounded to one copy of the globe,
 * so no horizontal repetition appears when zooming out.
 */
export const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];
