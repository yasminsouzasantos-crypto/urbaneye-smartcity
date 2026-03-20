import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '@/types/urban';

interface GeolocationState {
  position: [number, number];
  hasPermission: boolean;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: DEFAULT_LOCATION,
    hasPermission: false,
    loading: true,
  });

  const updatePosition = useCallback((pos: GeolocationPosition) => {
    setState({
      position: [pos.coords.latitude, pos.coords.longitude],
      hasPermission: true,
      loading: false,
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      () => setState(s => ({ ...s, loading: false })),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    const watchId = navigator.geolocation.watchPosition(updatePosition, () => {}, {
      enableHighAccuracy: true,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updatePosition]);

  return state;
}
