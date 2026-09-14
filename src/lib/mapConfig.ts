import type { LatLngBoundsExpression } from 'leaflet';

export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Single world representation: Leaflet is bounded to one copy of the globe,
 * so no horizontal repetition appears when zooming out.
 */
export const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];
