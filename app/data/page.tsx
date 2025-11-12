// app/monitoring/page.tsx - View Mode Toggle Only
"use client";

import { useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Header, { ViewMode } from "@/components/Header";
import DataMonitoring from "@/components/DataMonitoring";
import { useSensorData } from "@/hooks/useSensorData";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MonitoringPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("realtime");

  const {
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
    PumpSpeedData,
    historicalData,
    pumpStatus,
    isConnected,
    isLoading,
    isHistoryLoading,
    loadHistoryByDateRange,
  } = useSensorData();

  // Latest sensor data from real-time streams
  const latestSensorData = useMemo(() => {
    if (phData.length === 0) return null;

    return {
      ph_Anode: phData[phData.length - 1]?.ph_Anode || 0,
      ph_Cathode: phData[phData.length - 1]?.ph_Cathode || 0,
      temperature_Anode:
        temperatureData[temperatureData.length - 1]?.temperature_Anode || 0,
      temperature_Cathode:
        temperatureData[temperatureData.length - 1]?.temperature_Cathode || 0,
      Ionic_Anode: ionicData[ionicData.length - 1]?.Ionic_Anode || 0,
      Ionic_Cathode: ionicData[ionicData.length - 1]?.Ionic_Cathode || 0,
      Humidity: humidityData[humidityData.length - 1]?.value || 0,
      hydrogen: hydrogenData[hydrogenData.length - 1]?.value || 0,
      Voltage: voltageData[voltageData.length - 1]?.value || 0,
      PumpSpeed_Anode:
        PumpSpeedData[PumpSpeedData.length - 1]?.PumpSpeed_Anode || 0,
      PumpSpeed_Cathode:
        PumpSpeedData[PumpSpeedData.length - 1]?.PumpSpeed_Cathode || 0,
      time: phData[phData.length - 1]?.time || "",
      timestamp: Date.now(),
    };
  }, [
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
    PumpSpeedData,
  ]);

  // Combined real-time data for charts
  const realtimeData = useMemo(() => {
    if (phData.length === 0) return [];

    const maxLength = Math.max(
      phData.length,
      temperatureData.length,
      ionicData.length,
      humidityData.length,
      hydrogenData.length,
      voltageData.length,
      PumpSpeedData.length
    );

    const combined: Array<{
      ph_Anode: number | null;
      ph_Cathode: number | null;
      temperature_Anode: number | null;
      temperature_Cathode: number | null;
      Ionic_Anode: number | null;
      Ionic_Cathode: number | null;
      Humidity: number | null;
      hydrogen: number | null;
      Voltage: number | null;
      PumpSpeed_Anode: number | null;
      PumpSpeed_Cathode: number | null;
      time: string;
      timestamp: number;
    }> = [];

    for (let i = 0; i < maxLength; i++) {
      combined.push({
        ph_Anode: phData[i]?.ph_Anode ?? null,
        ph_Cathode: phData[i]?.ph_Cathode ?? null,
        temperature_Anode: temperatureData[i]?.temperature_Anode ?? null,
        temperature_Cathode: temperatureData[i]?.temperature_Cathode ?? null,
        Ionic_Anode: ionicData[i]?.Ionic_Anode ?? null,
        Ionic_Cathode: ionicData[i]?.Ionic_Cathode ?? null,
        Humidity: humidityData[i]?.value ?? null,
        hydrogen: hydrogenData[i]?.value ?? null,
        Voltage: voltageData[i]?.value ?? null,
        PumpSpeed_Anode: PumpSpeedData[i]?.PumpSpeed_Anode ?? null,
        PumpSpeed_Cathode: PumpSpeedData[i]?.PumpSpeed_Cathode ?? null,
        time:
          phData[i]?.time ||
          temperatureData[i]?.time ||
          ionicData[i]?.time ||
          humidityData[i]?.time ||
          hydrogenData[i]?.time ||
          voltageData[i]?.time ||
          PumpSpeedData[i]?.time ||
          "",
        timestamp: temperatureData[i]?.timestamp || Date.now(),
      });
    }

    return combined;
  }, [
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
    PumpSpeedData,
  ]);

  // Handle date range change
  const handleDateRangeChange = useCallback(
    async (start: string, end: string, intervalMinutes: number) => {
      try {
        console.log(
          `📅 Date range: ${start} to ${end} (${intervalMinutes}min interval)`
        );
        await loadHistoryByDateRange(start, end, intervalMinutes);
      } catch (error) {
        console.error("❌ Failed to load date range:", error);
      }
    },
    [loadHistoryByDateRange]
  );

  return (
  <ProtectedRoute>
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50"
      }`}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-64 transition-all duration-300">
        {/* Header with Glass Effect */}
        <div className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          isDarkMode 
            ? "bg-slate-900/80 border-slate-700/50 shadow-lg shadow-cyan-500/5" 
            : "bg-white/80 border-gray-200/50 shadow-lg shadow-blue-500/5"
        }`}>
          <Header
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Enhanced Connection Status Bar */}
        <div className="px-6 pt-6 pb-4">
          <div className={`rounded-2xl p-4 backdrop-blur-lg transition-all duration-300 ${
            isDarkMode 
              ? "bg-slate-800/40 border border-slate-700/50" 
              : "bg-white/70 border border-gray-200 shadow-lg"
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              
              {/* Connection Status with Animation */}
              <div className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isConnected
                  ? isDarkMode
                    ? "bg-green-500/20 border border-green-500/50"
                    : "bg-green-50 border border-green-200"
                  : isDarkMode
                  ? "bg-red-500/20 border border-red-500/50"
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="relative w-3 h-3">
                  {isConnected ? (
                    <>
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-full bg-green-500"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 rounded-full bg-red-500"></div>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isConnected
                      ? isDarkMode ? "text-green-400" : "text-green-700"
                      : isDarkMode ? "text-red-400" : "text-red-700"
                  }`}
                >
                  {isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
                </span>
              </div>

              {/* View Mode Badge */}
              <div
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  viewMode === "realtime"
                    ? isDarkMode
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                      : "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200 shadow-lg shadow-cyan-500/10"
                    : isDarkMode
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/20"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-lg shadow-blue-500/10"
                }`}
              >
                <span className="mr-2">{viewMode === "realtime" ? "⚡" : "📊"}</span>
                {viewMode === "realtime" ? "Real-time Mode" : "Historical Mode"}
              </div>

              {/* Loading Indicator */}
              {(isLoading || isHistoryLoading) && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  isDarkMode
                    ? "bg-slate-700/50 border border-slate-600/50"
                    : "bg-gray-100 border border-gray-200"
                }`}>
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin"></div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    {viewMode === "realtime"
                      ? "กำลังโหลดข้อมูลเริ่มต้น..."
                      : "กำลังดึงข้อมูลย้อนหลัง..."}
                  </span>
                </div>
              )}

              {/* Data Count - Realtime */}
              {viewMode === "realtime" && !isLoading && realtimeData.length > 0 && (
                <div
                  className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                    isDarkMode
                      ? "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  📊 <span className="font-bold">{realtimeData.length.toLocaleString()}</span> จุดข้อมูล (1 ชม.)
                </div>
              )}

              {/* Data Count - Historical */}
              {viewMode === "historical" && !isHistoryLoading && historicalData.length > 0 && (
                <div
                  className={`px-4 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                    isDarkMode
                      ? "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  📊 <span className="font-bold">{historicalData.length.toLocaleString()}</span> จุดข้อมูล
                </div>
              )}

              {/* Live Streaming Badge */}
              {isConnected && viewMode === "realtime" && phData.length > 0 && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-300 ${
                    isDarkMode
                      ? "bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20"
                      : "bg-green-50 text-green-700 border border-green-200 shadow-lg shadow-green-500/10"
                  }`}
                >
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 rounded-full bg-green-500 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full bg-green-500"></div>
                  </div>
                  Live Streaming
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="p-3 sm:p-5 space-y-5">
          {/* Main Data Monitoring Component */}
          <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${
            isDarkMode 
              ? "bg-slate-800/40 border border-slate-700/50 shadow-2xl shadow-cyan-500/5" 
              : "bg-white/70 border border-gray-200 shadow-2xl shadow-blue-500/5"
          }`}>
            <DataMonitoring
              isDarkMode={isDarkMode}
              sensorData={latestSensorData}
              historicalData={historicalData}
              realtimeData={realtimeData}
              isLoading={viewMode === "historical" ? isHistoryLoading : isLoading}
              viewMode={viewMode}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Enhanced Debug Info */}
          {process.env.NODE_ENV === "development" && (
            <div
              className={`rounded-2xl p-6 backdrop-blur-lg transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-800/40 border border-slate-700/50"
                  : "bg-white/70 border border-gray-200 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode
                    ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50"
                    : "bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200"
                }`}>
                  <span className="text-xl">🛠</span>
                </div>
                <div>
                  <h3
                    className={`text-base font-bold ${
                      isDarkMode ? "text-slate-200" : "text-gray-800"
                    }`}
                  >
                    Debug Information
                  </h3>
                  <p className={`text-xs ${
                    isDarkMode ? "text-slate-500" : "text-gray-500"
                  }`}>
                    Development Mode Only
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current Mode */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode
                    ? "bg-slate-900/50 border border-slate-700/50"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <p
                    className={`text-xs font-semibold mb-3 ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    📍 Current Mode
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      viewMode === "realtime"
                        ? "text-green-500"
                        : "text-blue-500"
                    }`}
                  >
                    {viewMode.toUpperCase()}
                  </p>
                </div>

                {/* Real-time Data */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode
                    ? "bg-slate-900/50 border border-slate-700/50"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <p
                    className={`text-xs font-semibold mb-3 ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    ⚡ Real-time Data
                  </p>
                  <ul
                    className={`space-y-1 text-xs ${
                      isDarkMode ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    <li className="flex justify-between">
                      <span>pH:</span>
                      <span className="font-bold text-cyan-500">{phData.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Temp:</span>
                      <span className="font-bold text-orange-500">{temperatureData.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold text-purple-500">{realtimeData.length}</span>
                    </li>
                  </ul>
                </div>

                {/* Historical Data */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode
                    ? "bg-slate-900/50 border border-slate-700/50"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <p
                    className={`text-xs font-semibold mb-3 ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    📊 Historical Data
                  </p>
                  <ul
                    className={`space-y-1 text-xs ${
                      isDarkMode ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    <li className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold text-blue-500">{historicalData.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Valid:</span>
                      <span className="font-bold text-green-500">
                        {historicalData.filter(
                          (d) => d.ph_Anode !== null && d.ph_Cathode !== null
                        ).length}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Connection Status */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode
                    ? "bg-slate-900/50 border border-slate-700/50"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <p
                    className={`text-xs font-semibold mb-3 ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    🔌 Connection
                  </p>
                  <ul
                    className={`space-y-1 text-xs ${
                      isDarkMode ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    <li className="flex justify-between items-center">
                      <span>WebSocket:</span>
                      <span
                        className={`font-bold ${
                          isConnected ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isConnected ? " ON" : " OFF"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Pump:</span>
                      <span
                        className={`font-bold ${
                          pumpStatus.anode.isOn ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {pumpStatus.anode.isOn ? " ON" : " OFF"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {latestSensorData && (
                <div
                  className={`mt-4 pt-4 border-t flex items-center justify-between ${
                    isDarkMode
                      ? "border-slate-700"
                      : "border-gray-200"
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    isDarkMode ? "text-slate-500" : "text-gray-500"
                  }`}>
                    Last Update:
                  </span>
                  <span className={`text-xs font-mono ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>
                    {latestSensorData.time}
                  </span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  </ProtectedRoute>
);
}
