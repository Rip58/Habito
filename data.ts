import { ActivityLog, HeatmapDay, Category } from './types';

export const generateHeatmapData = (): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const today = new Date();
  // Generate last 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    
    const randomCount = Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (randomCount > 0) level = 1;
    if (randomCount > 3) level = 2;
    if (randomCount > 7) level = 3;
    if (randomCount > 10) level = 4;

    days.push({
      date: d.toISOString().split('T')[0],
      count: randomCount,
      level,
    });
  }
  return days;
};

export const recentLogs: ActivityLog[] = [
  { id: '1', timestamp: '12 Oct, 14:23:01', eventName: 'Optimización del Sistema', category: 'Infraestructura', intensity: 85, status: 'COMPLETED' },
  { id: '2', timestamp: '12 Oct, 11:45:12', eventName: 'Pico de Autenticación de Usuarios', category: 'Seguridad', intensity: 45, status: 'COMPLETED' },
  { id: '3', timestamp: '11 Oct, 23:59:44', eventName: 'Sincronización de Respaldo Nocturno', category: 'Datos', intensity: 100, status: 'COMPLETED' },
  { id: '4', timestamp: '11 Oct, 18:12:05', eventName: 'Disparador de Webhook', category: 'API', intensity: 20, status: 'PENDING' },
  { id: '5', timestamp: '11 Oct, 09:30:00', eventName: 'Rutina Matutina', category: 'Fitness', intensity: 60, status: 'COMPLETED' },
];

export const initialCategories: Category[] = [
  { id: '1', name: 'Programación Diaria', target: '3 horas', enabled: true, color: '#30e87a' },
  { id: '2', name: 'Ejercicio', target: '45 min', enabled: false, color: '#60a5fa' },
  { id: '3', name: 'Lectura', target: '1 sesión', enabled: true, color: '#f472b6' },
];