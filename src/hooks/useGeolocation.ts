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
    const { latitude, longitude } = pos.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    setState((previous) => previous.hasPermission && previous.position[0] === latitude && previous.position[1] === longitude ? previous : ({
      position: [pos.coords.latitude, pos.coords.longitude],
      hasPermission: true,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    let active = true;
    const success = (pos: GeolocationPosition) => { if (active) updatePosition(pos); };
    const failure = (error: GeolocationPositionError) => {
      if (active) setState(s => ({ ...s, loading: false, hasPermission: error.code === 1 ? false : s.hasPermission }));
    };
    navigator.geolocation.getCurrentPosition(
      success,
      failure,
      { enableHighAccuracy: true, timeout: 8000 }
    );

    const watchId = navigator.geolocation.watchPosition(success, failure, {
      enableHighAccuracy: true,
    });

    return () => { active = false; navigator.geolocation.clearWatch(watchId); };
  }, [updatePosition]);

  return state;
}
