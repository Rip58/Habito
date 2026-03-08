import React from 'react';

export interface ActivityLog {
  id?: string; // Prisma CUID
  timestamp: string;
  dateObj?: Date;
  eventName: string;
  category: string;
  categoryId?: string; // Foreign Key ID
  intensity: number; // 0-100
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 is empty, 4 is most intense
}

export interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export enum Page {
  OVERVIEW = 'overview',
  FOCUS = 'focus',
  LOGS = 'logs',
  ALERTS = 'alerts',
  SETTINGS = 'settings',
}

export interface Category {
  id: string;
  name: string;
  target: string;
  enabled: boolean;
  color: string;
}

export interface TimerSession {
  id?: string;
  categoryId: string;
  category: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  note?: string;
}