// hooks/useAlerts.ts - FIXED VERSION with Real-time Alert Checking
"use client";

import { useState, useEffect, useCallback } from "react";
import type { AlertRule, AlertHistoryItem } from "@/types/alerts";

export const useAlerts = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRules = localStorage.getItem("alertRules");
      const savedHistory = localStorage.getItem("alertHistory");

      if (savedRules) {
        try {
          setAlertRules(JSON.parse(savedRules));
        } catch (error) {
          console.error("Failed to parse alert rules:", error);
        }
      } else {
        // Default rules
        const defaultRules: AlertRule[] = [
          {
            id: "1",
            sensor: "ph_Anode",
            condition: "above",
            threshold: 8.5,
            enabled: true,
            severity: "warning",
          },
          {
            id: "2",
            sensor: "temperature_Anode",
            condition: "above",
            threshold: 35,
            enabled: true,
            severity: "critical",
          },
          {
            id: "3",
            sensor: "hydrogen",
            condition: "below",
            threshold: 50,
            enabled: true,
            severity: "warning",
          },
        ];
        setAlertRules(defaultRules);
        localStorage.setItem("alertRules", JSON.stringify(defaultRules));
      }

      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setAlertHistory(history);
          setUnreadCount(
            history.filter((a: AlertHistoryItem) => !a.read).length
          );
        } catch (error) {
          console.error("Failed to parse alert history:", error);
        }
      }
    }
  }, []);

  // Save to localStorage whenever rules change
  useEffect(() => {
    if (typeof window !== "undefined" && alertRules.length > 0) {
      localStorage.setItem("alertRules", JSON.stringify(alertRules));
    }
  }, [alertRules]);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alertHistory", JSON.stringify(alertHistory));
      setUnreadCount(alertHistory.filter((a) => !a.read).length);
    }
  }, [alertHistory]);

  const addAlertRule = useCallback((rule: AlertRule) => {
    setAlertRules((prev) => [...prev, rule]);
  }, []);

  const updateAlertRule = useCallback((updatedRule: AlertRule) => {
    setAlertRules((prev) =>
      prev.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule))
    );
  }, []);

  const deleteAlertRule = useCallback((id: string) => {
    setAlertRules((prev) => prev.filter((rule) => rule.id !== id));
  }, []);

  const addAlertHistory = useCallback(
    (alert: Omit<AlertHistoryItem, "id" | "read">) => {
      const newAlert: AlertHistoryItem = {
        ...alert,
        id: Date.now().toString(),
        read: false,
      };
      setAlertHistory((prev) => [newAlert, ...prev].slice(0, 100)); // Keep last 100 alerts
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setAlertHistory((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlertHistory((prev) => prev.map((alert) => ({ ...alert, read: true })));
  }, []);

  const clearHistory = useCallback(() => {
    setAlertHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("alertHistory");
    }
  }, []);

  // ✅ NEW: Check single sensor value against rules
  const checkAlert = useCallback(
    (sensor: string, value: number) => {
      const rule = alertRules.find((r) => r.sensor === sensor && r.enabled);
      if (!rule) return null;

      const isTriggered =
        (rule.condition === "above" && value > rule.threshold) ||
        (rule.condition === "below" && value < rule.threshold);

      if (isTriggered) {
        const alert = {
          sensor,
          value: value.toFixed(2),
          threshold: rule.threshold.toString(),
          message: `${sensor} is ${rule.condition} threshold (${value.toFixed(
            2
          )} ${rule.condition === "above" ? ">" : "<"} ${rule.threshold})`,
          severity: rule.severity,
          timestamp: new Date().toISOString(),
        };
        addAlertHistory(alert);
        return alert;
      }

      return null;
    },
    [alertRules, addAlertHistory]
  );

  // ✅ NEW: Check all sensor values at once
  const checkAllSensors = useCallback(
    (sensorValues: Record<string, number>) => {
      const triggeredAlerts: Array<Omit<AlertHistoryItem, "id" | "read">> = [];

      Object.entries(sensorValues).forEach(([sensor, value]) => {
        if (value === null || value === undefined) return;

        const alert = checkAlert(sensor, value);
        if (alert) {
          triggeredAlerts.push(alert);
        }
      });

      return triggeredAlerts;
    },
    [checkAlert]
  );

  return {
    alertRules,
    alertHistory,
    unreadCount,
    addAlertRule,
    updateAlertRule,
    deleteAlertRule,
    addAlertHistory,
    markAsRead,
    markAllAsRead,
    clearHistory,
    checkAlert,
    checkAllSensors, // ✅ Export new function
  };
};
