import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Keeps the Leaflet canvas in sync with its container.
 * Fixes grey/blank tiles when the map is hidden, resized or rotated.
 */
export default function MapAutoSize({ active = true }: { active?: boolean }) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    const invalidate = () => map.invalidateSize({ animate: false });

    // initial paint (container may still be 0px tall on mount)
    const raf = requestAnimationFrame(invalidate);
    const t = setTimeout(invalidate, 300);

    const ro = new ResizeObserver(invalidate);
    ro.observe(el);
    window.addEventListener('orientationchange', invalidate);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('orientationchange', invalidate);
    };
  }, [map]);

  // re-measure whenever the map becomes visible again (tab switch)
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => map.invalidateSize({ animate: false }), 60);
    return () => clearTimeout(t);
  }, [active, map]);

  return null;
}
