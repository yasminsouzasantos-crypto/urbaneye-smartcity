import { useState, useCallback, useEffect, useRef } from 'react';
import { UrbanReport, ProblemType, Severity, DEFAULT_LOCATION } from '@/types/urban';

const INITIAL_REPORTS: UrbanReport[] = [
  { id: '1', type: 'acidente', description: 'Colisão entre dois veículos na rotatória', severity: 'severe', lat: -23.4985, lng: -47.4510, timestamp: new Date(Date.now() - 600000) },
  { id: '2', type: 'obra', description: 'Recapeamento da via', severity: 'warning', lat: -23.5045, lng: -47.4580, timestamp: new Date(Date.now() - 1200000) },
  { id: '3', type: 'iluminacao', description: 'Poste com lâmpada queimada', severity: 'normal', lat: -23.5000, lng: -47.4450, timestamp: new Date(Date.now() - 1800000) },
  { id: '4', type: 'transito', description: 'Congestionamento intenso', severity: 'warning', lat: -23.4960, lng: -47.4490, timestamp: new Date(Date.now() - 300000) },
  { id: '5', type: 'acidente', description: 'Moto caída na pista', severity: 'severe', lat: -23.5030, lng: -47.4420, timestamp: new Date(Date.now() - 900000) },
];

function randomNear(center: [number, number], range = 0.015): [number, number] {
  return [
    center[0] + (Math.random() - 0.5) * range,
    center[1] + (Math.random() - 0.5) * range,
  ];
}

const SENSOR_TYPES: { type: ProblemType; desc: string; severity: Severity }[] = [
  { type: 'transito', desc: 'Fluxo intenso detectado por sensor', severity: 'warning' },
  { type: 'acidente', desc: 'Possível acidente detectado por sensor', severity: 'severe' },
  { type: 'transito', desc: 'Velocidade reduzida detectada', severity: 'normal' },
];

export function useUrbanReports(userPosition: [number, number]) {
  const [reports, setReports] = useState<UrbanReport[]>(INITIAL_REPORTS);
  const idCounter = useRef(100);

  const addReport = useCallback((type: ProblemType, description: string, position: [number, number]) => {
    const severity: Severity = type === 'acidente' ? 'severe' : type === 'obra' ? 'warning' : 'normal';
    const newReport: UrbanReport = {
      id: String(++idCounter.current),
      type,
      description,
      severity,
      lat: position[0],
      lng: position[1],
      timestamp: new Date(),
    };
    setReports(prev => [newReport, ...prev]);
    return newReport;
  }, []);

  // Sensor simulation
  useEffect(() => {
    const center = userPosition[0] !== DEFAULT_LOCATION[0] ? userPosition : DEFAULT_LOCATION;
    const interval = setInterval(() => {
      const sensor = SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)];
      const [lat, lng] = randomNear(center);
      const sensorReport: UrbanReport = {
        id: `sensor-${++idCounter.current}`,
        type: sensor.type,
        description: sensor.desc,
        severity: sensor.severity,
        lat,
        lng,
        timestamp: new Date(),
        isSensor: true,
      };
      setReports(prev => [sensorReport, ...prev].slice(0, 50));
    }, 8000);

    return () => clearInterval(interval);
  }, [userPosition]);

  const stats = {
    total: reports.length,
    severe: reports.filter(r => r.severity === 'severe').length,
    warning: reports.filter(r => r.severity === 'warning').length,
    normal: reports.filter(r => r.severity === 'normal').length,
  };

  return { reports, addReport, stats };
}
