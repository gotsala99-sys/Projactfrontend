// app/settings/page.tsx
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProfileTab from "@/components/settings/ProfileTab";
import PasswordTab from "@/components/settings/PasswordTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { User, Lock, Shield } from "lucide-react";

type TabType = "profile" | "password" | "security";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as TabType, label: "โปรไฟล์", icon: User },
    { id: "password" as TabType, label: "รหัสผ่าน", icon: Lock },
    { id: "security" as TabType, label: "ความปลอดภัย", icon: Shield },
  ];

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
          />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1
                  className={`text-3xl md:text-4xl font-bold mb-2 ${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                      : "text-gray-900"
                  }`}
                >
                  ตั้งค่า
                </h1>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ
                </p>
              </div>

              {/* Tab Navigation */}
              <div
                className={`flex space-x-1 mb-6 p-1 rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                } shadow-sm backdrop-blur-sm`}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        isActive
                          ? isDarkMode
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-400/30"
                          : isDarkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === "profile" && (
                  <ProfileTab isDarkMode={isDarkMode} />
                )}
                {activeTab === "password" && (
                  <PasswordTab isDarkMode={isDarkMode} />
                )}
                {activeTab === "security" && (
                  <SecurityTab isDarkMode={isDarkMode} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </ProtectedRoute>
  );
}
