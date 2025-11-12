// components/Header.tsx - Mode-specific buttons with Notifications
"use client";

import { useState } from "react";
import { ChartVariable, CHART_VARIABLES } from "@/types/chartTypes";
import NotificationDropdown from "@/components/NotificationDropdown";

export type ViewMode = "realtime" | "historical";

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  // For Dashboard page - Chart variable selector
  selectedVariable?: ChartVariable;
  setSelectedVariable?: (value: ChartVariable) => void;
  // For Monitoring page - View mode toggle
  viewMode?: ViewMode;
  setViewMode?: (value: ViewMode) => void;
}

export default function Header({
  isDarkMode,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedVariable,
  setSelectedVariable,
  viewMode,
  setViewMode,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDarkMode
          ? "bg-gray-800/95 border-gray-700"
          : "bg-white/95 border-gray-200"
      } border-b shadow-sm`}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
        {/* Left Side - Hamburger + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <h1
            className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <span className="hidden sm:inline">Welcome to </span>
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Dashboard</span>
          </h1>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* View Mode Toggle - Redesigned */}
          {viewMode && setViewMode && (
            <div
              className={`flex items-center rounded-xl p-1 shadow-lg backdrop-blur-sm ${
                isDarkMode
                  ? "bg-slate-800/90 border border-slate-700/50"
                  : "bg-white/90 border border-gray-200"
              }`}
            >
              {/* Real-time Button */}
              <button
                onClick={() => setViewMode("realtime")}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                  viewMode === "realtime"
                    ? isDarkMode
                      ? "bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30"
                      : "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 text-white shadow-xl shadow-purple-400/30"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {/* Animated Pulse Icon for Real-time */}
                <div className="relative">
                  <svg
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      viewMode === "realtime" ? "animate-pulse" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  {viewMode === "realtime" && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></span>
                      <span
                        className="absolute inset-0 rounded-full bg-current opacity-10 animate-ping"
                        style={{ animationDelay: "0.3s" }}
                      ></span>
                    </>
                  )}
                </div>
                <span className="tracking-wide">Real-time</span>
                {viewMode === "realtime" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                )}
              </button>

              {/* Historical Button */}
              <button
                onClick={() => setViewMode("historical")}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                  viewMode === "historical"
                    ? isDarkMode
                      ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-white shadow-xl shadow-cyan-500/30"
                      : "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-white shadow-xl shadow-cyan-400/30"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {/* Chart Icon */}
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="tracking-wide">Historical</span>
                {viewMode === "historical" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                )}
              </button>
            </div>
          )}

          <style jsx>{`
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            .animate-shimmer {
              animation: shimmer 2s infinite;
            }
          `}</style>

          {/* Variable Selector - Only for Dashboard page */}
          {selectedVariable && setSelectedVariable && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base font-semibold ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {CHART_VARIABLES[selectedVariable].label}
                </span>
                <span className="sm:hidden">{selectedVariable}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden ${
                      isDarkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="py-2">
                      {(Object.keys(CHART_VARIABLES) as ChartVariable[]).map(
                        (varKey) => {
                          const varConfig = CHART_VARIABLES[varKey];
                          const isSelected = selectedVariable === varKey;

                          return (
                            <button
                              key={varKey}
                              onClick={() => {
                                setSelectedVariable(varKey);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between group ${
                                isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300"
                                  : "hover:bg-gray-100 text-gray-700"
                              } ${
                                isSelected
                                  ? isDarkMode
                                    ? "bg-blue-600/20"
                                    : "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: varConfig.anode.color,
                                    boxShadow: `0 0 8px ${varConfig.anode.color}60`,
                                  }}
                                />
                                <div>
                                  <div className="font-semibold text-sm">
                                    {varConfig.label}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Unit: {varConfig.unit}
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <svg
                                  className="w-5 h-5 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
              isDarkMode
                ? "bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700"
                : "bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-amber-500/30"
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300"
                fill="currentColor"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* ✅ Alert Notifications Dropdown */}
          <NotificationDropdown isDarkMode={isDarkMode} />

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2 ml-1 md:ml-2">
            <div
              className={`hidden lg:block text-right text-sm ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <p className="font-semibold leading-tight">Ratchanon</p>
              <p
                className={`text-xs leading-tight ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Admin
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              RT
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
