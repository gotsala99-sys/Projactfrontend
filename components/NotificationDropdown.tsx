// components/NotificationDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";

interface NotificationDropdownProps {
  isDarkMode: boolean;
}

export default function NotificationDropdown({
  isDarkMode,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { alertHistory, unreadCount, markAsRead, markAllAsRead } = useAlerts();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return isDarkMode
          ? "bg-red-500/10 border-red-500/30"
          : "bg-red-50 border-red-200";
      case "warning":
        return isDarkMode
          ? "bg-yellow-500/10 border-yellow-500/30"
          : "bg-yellow-50 border-yellow-200";
      default:
        return isDarkMode
          ? "bg-blue-500/10 border-blue-500/30"
          : "bg-blue-50 border-blue-200";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const recentAlerts = alertHistory.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
          isDarkMode
            ? "bg-slate-800 hover:bg-slate-700 border border-slate-700"
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }`}
        aria-label="Notifications"
      >
        <Bell
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border z-50 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-bold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  className={`w-12 h-12 mx-auto mb-3 ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              <div
                className={`divide-y ${
                  isDarkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                    } ${!alert.read ? getSeverityColor(alert.severity) : ""}`}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className={`font-medium text-sm ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {alert.sensor}
                          </p>
                          <span
                            className={`text-xs flex-shrink-0 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          {!alert.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentAlerts.length > 0 && (
            <div
              className={`p-3 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <a
                href="/alerts"
                className="block text-center text-sm text-blue-500 hover:text-blue-400 font-medium"
              >
                View all alerts
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
