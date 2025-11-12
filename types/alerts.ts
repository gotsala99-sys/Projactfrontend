// types/alerts.ts

export interface AlertRule {
  id: string;
  sensor: string;
  condition: "above" | "below";
  threshold: number;
  enabled: boolean;
  severity: "info" | "warning" | "critical";
}

export interface AlertHistoryItem {
  id: string;
  sensor: string;
  value: string;
  threshold: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  read: boolean;
}