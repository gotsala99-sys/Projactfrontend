// app/pump-control/page.tsx - ✅ FIXED VERSION
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PumpControlPanel from "@/components/PumpControlPanel";
import { useSensorData } from "@/hooks/useSensorData"; // ✅ เพิ่ม
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PumpControlPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ เพิ่ม - ดึงข้อมูลจาก hook
  const {
    PumpSpeedData,
    pumpStatus,
    isConnected,
    controlPump, // ✅ เพิ่ม
  } = useSensorData();

  return (
    <ProtectedRoute>
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isDarkMode={isDarkMode} 
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* ✅ เพิ่ม Connection Status */}
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

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 space-y-6 w-full">
          {/* ✅ ส่ง props ครบถ้วน */}
          <PumpControlPanel 
            isDarkMode={isDarkMode}
            pumpStatus={pumpStatus}
            pumpSpeedData={PumpSpeedData}
            controlPump={controlPump} // ✅ เพิ่ม
            isConnected={isConnected}
          />
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}