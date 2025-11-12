// components/alerts/AlertHistory.tsx
"use client";

import { AlertTriangle, Info, AlertCircle, Clock } from "lucide-react";
import type { AlertHistoryItem } from "@/types/alerts";

interface AlertHistoryProps {
  alertHistory: AlertHistoryItem[];
  isDarkMode: boolean;
}

export default function AlertHistory({
  alertHistory,
  isDarkMode,
}: AlertHistoryProps) {
  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return isDarkMode
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-red-50 border-red-200 text-red-600";
      case "warning":
        return isDarkMode
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          : "bg-yellow-50 border-yellow-200 text-yellow-600";
      default:
        return isDarkMode
          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
          : "bg-blue-50 border-blue-200 text-blue-600";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const sortedHistory = [...alertHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h2
        className={`text-xl font-bold mb-6 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Alert History
      </h2>

      {sortedHistory.length === 0 ? (
        <div
          className={`text-center py-12 rounded-xl border ${
            isDarkMode
              ? "bg-gray-800/30 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <Clock
            className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No alerts yet
          </p>
          <p
            className={`text-sm mt-2 ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            When alerts are triggered, they will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistory.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${getSeverityColor(
                alert.severity
              )} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(alert.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-lg">{alert.sensor}</h3>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Value: <span className="font-bold">{alert.value}</span>
                    </span>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Threshold:{" "}
                      <span className="font-bold">{alert.threshold}</span>
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-bold ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
