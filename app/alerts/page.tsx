// app/alerts/page.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AlertRuleCard from "@/components/alerts/AlertRuleCard";
import AlertHistory from "@/components/alerts/AlertHistory";
import { useSensorData } from "@/hooks/useSensorData";
import { useAlerts } from "@/hooks/useAlerts";
import { Bell, Plus, Activity, AlertCircle } from "lucide-react";

export default function AlertsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "history">("rules");

  const {
    phData,
    temperatureData,
    hydrogenData,
    voltageData,
    humidityData,
    ionicData,
  } = useSensorData();
  const {
    alertRules,
    alertHistory,
    addAlertRule,
    updateAlertRule,
    deleteAlertRule,
    checkAllSensors,
  } = useAlerts();

  // ✅ Track last checked values to avoid duplicate alerts
  const lastCheckedValues = useRef<Record<string, number>>({});

  // ✅ Check alerts against current sensor values
  useEffect(() => {
    const checkAlerts = () => {
      // Get latest values from each sensor array
      const latestValues: Record<string, number> = {};

      if (phData.length > 0) {
        const latest = phData[phData.length - 1];
        latestValues.ph_Anode = latest.ph_Anode;
        latestValues.ph_Cathode = latest.ph_Cathode;
      }

      if (temperatureData.length > 0) {
        const latest = temperatureData[temperatureData.length - 1];
        latestValues.temperature_Anode = latest.temperature_Anode;
        latestValues.temperature_Cathode = latest.temperature_Cathode;
      }

      if (hydrogenData.length > 0) {
        const latest = hydrogenData[hydrogenData.length - 1];
        latestValues.hydrogen = latest.value;
      }

      if (voltageData.length > 0) {
        const latest = voltageData[voltageData.length - 1];
        latestValues.voltage = latest.value;
      }

      if (humidityData.length > 0) {
        const latest = humidityData[humidityData.length - 1];
        latestValues.humidity = latest.value;
      }

      if (ionicData.length > 0) {
        const latest = ionicData[ionicData.length - 1];
        latestValues.ionic_Anode = latest.Ionic_Anode;
        latestValues.ionic_Cathode = latest.Ionic_Cathode;
      }

      // ✅ Only check if values have changed
      const hasChanges = Object.entries(latestValues).some(
        ([key, value]) => lastCheckedValues.current[key] !== value
      );

      if (hasChanges) {
        console.log(
          "🔔 Checking alerts for updated sensor values:",
          latestValues
        );
        const triggered = checkAllSensors(latestValues);

        if (triggered.length > 0) {
          console.log("⚠️ Triggered alerts:", triggered);
        }

        // Update last checked values
        lastCheckedValues.current = { ...latestValues };
      }
    };

    // Check immediately when data changes
    if (phData.length > 0 || temperatureData.length > 0) {
      checkAlerts();
    }

    // Also check periodically (every 5 seconds)
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, [
    phData,
    temperatureData,
    hydrogenData,
    voltageData,
    humidityData,
    ionicData,
    checkAllSensors,
  ]);

  const sensorOptions = [
    { value: "ph_Anode", label: "pH (Anode)", unit: "pH" },
    { value: "ph_Cathode", label: "pH (Cathode)", unit: "pH" },
    { value: "temperature_Anode", label: "Temperature (Anode)", unit: "°C" },
    {
      value: "temperature_Cathode",
      label: "Temperature (Cathode)",
      unit: "°C",
    },
    { value: "hydrogen", label: "Hydrogen Volume", unit: "cm³" },
    { value: "voltage", label: "Voltage", unit: "V" },
    { value: "humidity", label: "Humidity", unit: "%" },
    { value: "ionic_Anode", label: "Ionic (Anode)", unit: "mS/cm" },
    { value: "ionic_Cathode", label: "Ionic (Cathode)", unit: "mS/cm" },
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
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Bell
                    className={`w-8 h-8 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <h1
                    className={`text-3xl md:text-4xl font-bold ${
                      isDarkMode
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        : "text-gray-900"
                    }`}
                  >
                    Alert Management
                  </h1>
                </div>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Configure alert rules and monitor sensor thresholds
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-6 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Active Rules
                      </p>
                      <p
                        className={`text-3xl font-bold mt-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {alertRules.filter((r) => r.enabled).length}
                      </p>
                    </div>
                    <Activity
                      className={`w-12 h-12 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Today is Alerts
                      </p>
                      <p
                        className={`text-3xl font-bold mt-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {
                          alertHistory.filter((a) => {
                            const today = new Date().toDateString();
                            return (
                              new Date(a.timestamp).toDateString() === today
                            );
                          }).length
                        }
                      </p>
                    </div>
                    <Bell
                      className={`w-12 h-12 ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Critical Alerts
                      </p>
                      <p
                        className={`text-3xl font-bold mt-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {
                          alertHistory.filter((a) => a.severity === "critical")
                            .length
                        }
                      </p>
                    </div>
                    <AlertCircle
                      className={`w-12 h-12 ${
                        isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div
                className={`flex space-x-1 mb-6 p-1 rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "rules"
                      ? isDarkMode
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Alert Rules
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "history"
                      ? isDarkMode
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Alert History
                </button>
              </div>

              {/* Content */}
              {activeTab === "rules" ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className={`text-xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Alert Rules
                    </h2>
                    <button
                      onClick={() => {
                        const newRule = {
                          id: Date.now().toString(),
                          sensor: "ph_Anode",
                          condition: "above" as const,
                          threshold: 7.5,
                          enabled: true,
                          severity: "warning" as const,
                        };
                        addAlertRule(newRule);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isDarkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      Add Rule
                    </button>
                  </div>

                  <div className="space-y-4">
                    {alertRules.map((rule) => (
                      <AlertRuleCard
                        key={rule.id}
                        rule={rule}
                        sensorOptions={sensorOptions}
                        isDarkMode={isDarkMode}
                        onUpdate={updateAlertRule}
                        onDelete={deleteAlertRule}
                      />
                    ))}

                    {alertRules.length === 0 && (
                      <div
                        className={`text-center py-12 rounded-xl border ${
                          isDarkMode
                            ? "bg-gray-800/30 border-gray-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Bell
                          className={`w-16 h-16 mx-auto mb-4 ${
                            isDarkMode ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-lg ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No alert rules configured
                        </p>
                        <p
                          className={`text-sm mt-2 ${
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Click --Add Rule-- to create your first alert
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <AlertHistory
                  alertHistory={alertHistory}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
