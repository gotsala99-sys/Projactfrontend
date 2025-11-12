// contexts/AlertsContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAlerts } from "@/hooks/useAlerts";

interface AlertsContextType {
  unreadCount: number;
  markAllAsRead: () => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { unreadCount, markAllAsRead } = useAlerts();

  return (
    <AlertsContext.Provider value={{ unreadCount, markAllAsRead }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlertsContext() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlertsContext must be used within AlertsProvider");
  }
  return context;
}