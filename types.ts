import React from 'react';

export interface ActivityLog {
  id: string;
  timestamp: string;
  eventName: string;
  category: 'Infrastructure' | 'Security' | 'Data' | 'API' | 'Coding' | 'Fitness';
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
  ANALYTICS = 'analytics',
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