// FILE 4: app/dashboard/page.tsx - FIXED
// ========================================
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import OverviewCards from "@/components/OverviewCards";
import GenericSensorChart from "@/components/GenericSensorChart";
import CompositionBarChart from "@/components/CompositionBarChart";
import StatusPanel from "@/components/StatusPanel";
import TimeSeriesChart, { SensorDataPoint } from "@/components/TimeSeriesChart";
import SensorPerformance from "@/components/SensorPerformance";
import { useSensorData } from "@/hooks/useSensorData";
import { ChartVariable } from "@/types/chartTypes";

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<ChartVariable>("pH");

  const {
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
    PumpSpeedData,
    pumpStatus,
    isConnected,
    controlPump,
  } = useSensorData();

  const [combinedData, setCombinedData] = useState<SensorDataPoint[]>([]);

  // ✅ FIXED: ลบ useEffect ที่ทำให้ console spam
  // useEffect(() => {
  //   console.log("🎯 Dashboard Page Mounted");
  // }, []);

  useEffect(() => {
    if (phData.length > 0) {
      const combined: SensorDataPoint[] = phData.map((phItem, index) => ({
        ph_Anode: phItem.ph_Anode ?? 0,
        ph_Cathode: phItem.ph_Cathode ?? 0,
        temperature_Anode: temperatureData[index]?.temperature_Anode ?? 0,
        temperature_Cathode: temperatureData[index]?.temperature_Cathode ?? 0,
        Ionic_Anode: ionicData[index]?.Ionic_Anode ?? 0,
        Ionic_Cathode: ionicData[index]?.Ionic_Cathode ?? 0,
        hydrogen: hydrogenData[index]?.value ?? 0,
        Voltage: voltageData[index]?.value ?? 0,
        Humidity: humidityData[index]?.value ?? 0,
        time: phItem.time ?? "",
        timestamp: Date.now(),
      }));

      setCombinedData(combined);
    }
  }, [
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
  ]);

  return (
    <ProtectedRoute>
      <div
        className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
        />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="lg:ml-64 transition-all duration-300">
          <Header
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            selectedVariable={selectedVariable}
            setSelectedVariable={setSelectedVariable}
          />

          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <main className="p-3 sm:p-4 md:p-6 space-y-6 w-full">
            <section>
              <h2
                className={`text-xl sm:text-2xl font-bold mb-4 px-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Overview
              </h2>
              <OverviewCards
                isDarkMode={isDarkMode}
                hydrogenData={hydrogenData}
                phData={phData}
                PumpSpeedData={PumpSpeedData}
                voltageData={voltageData}
                temperatureData={temperatureData}
                humidityData={humidityData}
                ionicData={ionicData}
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-8 xl:grid-rows-5 gap-4 md:gap-6 w-full h-full">
              <div className="xl:col-span-3 xl:row-span-2">
                <GenericSensorChart
                  isDarkMode={isDarkMode}
                  allData={combinedData}
                  selectedVariable={selectedVariable}
                />
              </div>

              <div className="xl:col-span-3 xl:row-span-2">
                <CompositionBarChart isDarkMode={isDarkMode} />
              </div>

              <div className="xl:col-span-2 xl:row-span-3">
                <StatusPanel
                  isDarkMode={isDarkMode}
                  pumpStatus={pumpStatus}
                  controlPump={controlPump}
                  phData={phData}
                />
              </div>

              <div className="xl:col-span-6 xl:row-span-3">
                <TimeSeriesChart
                  isDarkMode={isDarkMode}
                  allData={combinedData}
                  selectedVariable={selectedVariable}
                />
              </div>
            </section>

            <section>
              <SensorPerformance
                isDarkMode={isDarkMode}
                hydrogenData={hydrogenData}
                phData={phData}
                PumpSpeedData={PumpSpeedData}
                voltageData={voltageData}
                temperatureData={temperatureData}
                humidityData={humidityData}
                ionicData={ionicData}
              />
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
