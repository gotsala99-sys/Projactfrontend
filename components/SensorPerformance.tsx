"use client";

import { DiAtom } from "react-icons/di";
import { IoFlask } from "react-icons/io5";
import { MdOutlineShutterSpeed } from "react-icons/md";
import { IoBatteryHalfOutline } from "react-icons/io5";
import { TbTemperatureSun } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import { FaBattleNet } from "react-icons/fa6";

// Mock types for demo
interface ChartDataPoint {
  value: number;
  timestamp?: string;
}

interface PHChartData {
  ph_Anode: number;
  ph_Cathode: number;
  timestamp?: string;
}

interface TemperatureChartData {
  temperature_Anode: number;
  temperature_Cathode: number;
  time: string;
  timestamp?: number; // ✅ เพิ่มบรรทัดนี้
}

interface IonicChartData {
  Ionic_Anode: number;
  Ionic_Cathode: number;
  timestamp?: string;
}

interface PumpSpeedChartData {
  PumpSpeed_Anode: number;
  PumpSpeed_Cathode: number;
  time?: string;
}

interface SensorPerformanceProps {
  isDarkMode: boolean;
  hydrogenData: ChartDataPoint[];
  phData: PHChartData[];
  PumpSpeedData: PumpSpeedChartData[];
  voltageData: ChartDataPoint[];
  temperatureData: TemperatureChartData[];
  humidityData: ChartDataPoint[];
  ionicData: IonicChartData[];
}

// Sensor ideal configurations
const SENSOR_CONFIG = {
  hydrogen: { ideal: 1000, type: "higher-is-better" as const, weight: 0.15 },
  pH_anode: {
    ideal: 7,
    tolerance: 5,
    type: "range-based" as const,
    weight: 0.1,
  },
  pH_cathode: {
    ideal: 7,
    tolerance: 5,
    type: "range-based" as const,
    weight: 0.1,
  },
  PumpSpeed_anode: {
    ideal: 400,
    tolerance: 200,
    type: "range-based" as const,
    weight: 0.06,
  },
  PumpSpeed_cathode: {
    ideal: 400,
    tolerance: 200,
    type: "range-based" as const,
    weight: 0.06,
  },
  voltage: {
    ideal: 3.5,
    tolerance: 0.5,
    type: "range-based" as const,
    weight: 0.1,
  },
  temperature_anode: {
    ideal: 40,
    tolerance: 20,
    type: "range-based" as const,
    weight: 0.08,
  },
  temperature_cathode: {
    ideal: 40,
    tolerance: 20,
    type: "range-based" as const,
    weight: 0.08,
  },
  humidity: {
    ideal: 70,
    tolerance: 30,
    type: "range-based" as const,
    weight: 0.07,
  },
  ionic_anode: {
    ideal: 100,
    tolerance: 50,
    type: "range-based" as const,
    weight: 0.1,
  },
  ionic_cathode: {
    ideal: 100,
    tolerance: 50,
    type: "range-based" as const,
    weight: 0.1,
  },
};

export default function SensorPerformance({
  isDarkMode = false,
  hydrogenData = [],
  phData = [],
  PumpSpeedData = [],
  voltageData = [],
  temperatureData = [],
  humidityData = [],
  ionicData = [],
}: SensorPerformanceProps) {
  // Get latest values
  const latestHydrogen = hydrogenData?.[hydrogenData.length - 1]?.value ?? 0;
  const latestPH = phData?.[phData.length - 1] ?? {
    ph_Anode: 0,
    ph_Cathode: 0,
  };
  const latestPumpSpeed = PumpSpeedData?.[PumpSpeedData.length - 1] ?? {
    PumpSpeed_Anode: 0,
    PumpSpeed_Cathode: 0,
  };
  const latestVoltage = voltageData?.[voltageData.length - 1]?.value ?? 0;
  const latestTemperature = temperatureData?.[temperatureData.length - 1] ?? {
    temperature_Anode: 0,
    temperature_Cathode: 0,
  };
  const latestHumidity = humidityData?.[humidityData.length - 1]?.value ?? 0;
  const latestIonic = ionicData?.[ionicData.length - 1] ?? {
    Ionic_Anode: 0,
    Ionic_Cathode: 0,
  };

  // Calculate Visibility based on sensor type
  const calculateVisibility = (
    current: number,
    config: {
      ideal: number;
      tolerance?: number;
      type: "range-based" | "higher-is-better" | "lower-is-better";
    }
  ): number => {
    if (current === 0) return 0;

    if (config.type === "higher-is-better") {
      return Math.min((current / config.ideal) * 100, 100);
    }

    if (config.type === "lower-is-better") {
      return Math.min((config.ideal / current) * 100, 100);
    }

    // Range-based (default)
    if (!config.tolerance) return 0;
    const deviation = Math.abs(current - config.ideal);
    const visibility = Math.max(0, 100 - (deviation / config.tolerance) * 100);
    return Math.min(visibility, 100);
  };

  // Calculate trend
  const calculateTrend = (
    data:
      | ChartDataPoint[]
      | PHChartData[]
      | IonicChartData[]
      | TemperatureChartData[]
      | PumpSpeedChartData[]
  ): number => {
    if (!data || data.length < 6) return 0;

    const getValue = (
      d:
        | ChartDataPoint
        | PHChartData
        | IonicChartData
        | TemperatureChartData
        | PumpSpeedChartData
    ): number => {
      if ("value" in d && typeof d.value === "number") return d.value;
      if ("ph_Anode" in d && typeof d.ph_Anode === "number") return d.ph_Anode;
      if ("Ionic_Anode" in d && typeof d.Ionic_Anode === "number")
        return d.Ionic_Anode;
      if ("temperature_Anode" in d && typeof d.temperature_Anode === "number")
        return d.temperature_Anode;
      if ("PumpSpeed_Anode" in d && typeof d.PumpSpeed_Anode === "number")
        return d.PumpSpeed_Anode;
      return 0;
    };

    const recent5 = data.slice(-5);
    const previous5 = data.slice(-10, -5);

    const recentAvg =
      recent5.reduce((sum, d) => sum + getValue(d), 0) / recent5.length;
    const previousAvg =
      previous5.reduce((sum, d) => sum + getValue(d), 0) / previous5.length;

    return previousAvg === 0
      ? 0
      : ((recentAvg - previousAvg) / previousAvg) * 100;
  };

  // Get status color and text
  const getStatus = (visibility: number) => {
    if (visibility >= 90)
      return {
        color: "green",
        text: "ดีเยี่ยม",
        gradient: "from-green-500 to-emerald-600",
      };
    if (visibility >= 70)
      return {
        color: "yellow",
        text: "ปานกลาง",
        gradient: "from-yellow-500 to-amber-600",
      };
    if (visibility >= 50)
      return {
        color: "orange",
        text: "ต้องปรับปรุง",
        gradient: "from-orange-500 to-orange-600",
      };
    return { color: "red", text: "แย่", gradient: "from-red-500 to-red-600" };
  };

  // Calculate individual sensor ratios first
  const sensorRatios = [
    {
      weight: SENSOR_CONFIG.hydrogen.weight,
      ratio: latestHydrogen / SENSOR_CONFIG.hydrogen.ideal,
    },
    {
      weight: SENSOR_CONFIG.pH_anode.weight,
      ratio: latestPH.ph_Anode / SENSOR_CONFIG.pH_anode.ideal,
    },
    {
      weight: SENSOR_CONFIG.pH_cathode.weight,
      ratio: latestPH.ph_Cathode / SENSOR_CONFIG.pH_cathode.ideal,
    },
    {
      weight: SENSOR_CONFIG.PumpSpeed_anode.weight,
      ratio:
        latestPumpSpeed.PumpSpeed_Anode / SENSOR_CONFIG.PumpSpeed_anode.ideal,
    },
    {
      weight: SENSOR_CONFIG.PumpSpeed_cathode.weight,
      ratio:
        latestPumpSpeed.PumpSpeed_Cathode /
        SENSOR_CONFIG.PumpSpeed_cathode.ideal,
    },
    {
      weight: SENSOR_CONFIG.voltage.weight,
      ratio: latestVoltage / SENSOR_CONFIG.voltage.ideal,
    },
    {
      weight: SENSOR_CONFIG.temperature_anode.weight,
      ratio:
        latestTemperature.temperature_Anode /
        SENSOR_CONFIG.temperature_anode.ideal,
    },
    {
      weight: SENSOR_CONFIG.temperature_cathode.weight,
      ratio:
        latestTemperature.temperature_Cathode /
        SENSOR_CONFIG.temperature_cathode.ideal,
    },
    {
      weight: SENSOR_CONFIG.humidity.weight,
      ratio: latestHumidity / SENSOR_CONFIG.humidity.ideal,
    },
    {
      weight: SENSOR_CONFIG.ionic_anode.weight,
      ratio: latestIonic.Ionic_Anode / SENSOR_CONFIG.ionic_anode.ideal,
    },
    {
      weight: SENSOR_CONFIG.ionic_cathode.weight,
      ratio: latestIonic.Ionic_Cathode / SENSOR_CONFIG.ionic_cathode.ideal,
    },
  ];

  // Calculate Overall System Performance
  const overallPerformance = Math.min(
    sensorRatios.reduce(
      (sum, sensor) => sum + sensor.weight * sensor.ratio,
      0
    ) * 100,
    100
  );
  const overallStatus = getStatus(overallPerformance);

  const sensors = [
    {
      name: "Hydrogen",
      icon: <DiAtom className="w-6 h-6" />,
      iconBg: "from-cyan-500 to-cyan-600",
      current: latestHydrogen,
      ideal: SENSOR_CONFIG.hydrogen.ideal,
      unit: "cm³",
      visibility: calculateVisibility(latestHydrogen, SENSOR_CONFIG.hydrogen),
      trend: calculateTrend(hydrogenData),
      type: "ยิ่งสูงยิ่งดี",
      weight: SENSOR_CONFIG.hydrogen.weight,
    },
    {
      name: "pH Anode",
      icon: <IoFlask className="w-6 h-6" />,
      iconBg: "from-blue-500 to-blue-600",
      current: latestPH.ph_Anode,
      ideal: SENSOR_CONFIG.pH_anode.ideal,
      tolerance: SENSOR_CONFIG.pH_anode.tolerance,
      unit: "pH",
      visibility: calculateVisibility(
        latestPH.ph_Anode,
        SENSOR_CONFIG.pH_anode
      ),
      trend: calculateTrend(phData),
      type: "ค่ากลาง 7±5",
      weight: SENSOR_CONFIG.pH_anode.weight,
    },
    {
      name: "pH Cathode",
      icon: <IoFlask className="w-6 h-6" />,
      iconBg: "from-violet-500 to-violet-600",
      current: latestPH.ph_Cathode,
      ideal: SENSOR_CONFIG.pH_cathode.ideal,
      tolerance: SENSOR_CONFIG.pH_cathode.tolerance,
      unit: "pH",
      visibility: calculateVisibility(
        latestPH.ph_Cathode,
        SENSOR_CONFIG.pH_cathode
      ),
      trend: calculateTrend(phData),
      type: "ค่ากลาง 7±5",
      weight: SENSOR_CONFIG.pH_cathode.weight,
    },
    {
      name: "Pump Speed Anode",
      icon: <MdOutlineShutterSpeed className="w-6 h-6" />,
      iconBg: "from-emerald-500 to-emerald-600",
      current: latestPumpSpeed.PumpSpeed_Anode,
      ideal: SENSOR_CONFIG.PumpSpeed_anode.ideal,
      tolerance: SENSOR_CONFIG.PumpSpeed_anode.tolerance,
      unit: "RPM",
      visibility: calculateVisibility(
        latestPumpSpeed.PumpSpeed_Anode,
        SENSOR_CONFIG.PumpSpeed_anode
      ),
      trend: calculateTrend(PumpSpeedData),
      type: "เหมาะสม 400±200 RPM",
      weight: SENSOR_CONFIG.PumpSpeed_anode.weight,
    },
    {
      name: "Pump Speed Cathode",
      icon: <MdOutlineShutterSpeed className="w-6 h-6" />,
      iconBg: "from-teal-500 to-teal-600",
      current: latestPumpSpeed.PumpSpeed_Cathode,
      ideal: SENSOR_CONFIG.PumpSpeed_cathode.ideal,
      tolerance: SENSOR_CONFIG.PumpSpeed_cathode.tolerance,
      unit: "RPM",
      visibility: calculateVisibility(
        latestPumpSpeed.PumpSpeed_Cathode,
        SENSOR_CONFIG.PumpSpeed_cathode
      ),
      trend: calculateTrend(PumpSpeedData),
      type: "เหมาะสม 400±200 RPM",
      weight: SENSOR_CONFIG.PumpSpeed_cathode.weight,
    },
    {
      name: "Voltage",
      icon: <IoBatteryHalfOutline className="w-6 h-6" />,
      iconBg: "from-lime-500 to-lime-600",
      current: latestVoltage,
      ideal: SENSOR_CONFIG.voltage.ideal,
      tolerance: SENSOR_CONFIG.voltage.tolerance,
      unit: "V",
      visibility: calculateVisibility(latestVoltage, SENSOR_CONFIG.voltage),
      trend: calculateTrend(voltageData),
      type: "เหมาะสม 3.5±0.5",
      weight: SENSOR_CONFIG.voltage.weight,
    },
    {
      name: "Temperature Anode",
      icon: <TbTemperatureSun className="w-6 h-6" />,
      iconBg: "from-orange-500 to-orange-600",
      current: latestTemperature.temperature_Anode,
      ideal: SENSOR_CONFIG.temperature_anode.ideal,
      tolerance: SENSOR_CONFIG.temperature_anode.tolerance,
      unit: "°C",
      visibility: calculateVisibility(
        latestTemperature.temperature_Anode,
        SENSOR_CONFIG.temperature_anode
      ),
      trend: calculateTrend(temperatureData),
      type: "เหมาะสม 40±20 °C",
      weight: SENSOR_CONFIG.temperature_anode.weight,
    },
    {
      name: "Temperature Cathode",
      icon: <TbTemperatureSun className="w-6 h-6" />,
      iconBg: "from-red-500 to-red-600",
      current: latestTemperature.temperature_Cathode,
      ideal: SENSOR_CONFIG.temperature_cathode.ideal,
      tolerance: SENSOR_CONFIG.temperature_cathode.tolerance,
      unit: "°C",
      visibility: calculateVisibility(
        latestTemperature.temperature_Cathode,
        SENSOR_CONFIG.temperature_cathode
      ),
      trend: calculateTrend(temperatureData),
      type: "เหมาะสม 40±20 °C",
      weight: SENSOR_CONFIG.temperature_cathode.weight,
    },
    {
      name: "Humidity",
      icon: <WiHumidity className="w-6 h-6" />,
      iconBg: "from-purple-500 to-purple-600",
      current: latestHumidity,
      ideal: SENSOR_CONFIG.humidity.ideal,
      tolerance: SENSOR_CONFIG.humidity.tolerance,
      unit: "%",
      visibility: calculateVisibility(latestHumidity, SENSOR_CONFIG.humidity),
      trend: calculateTrend(humidityData),
      type: "เหมาะสม 70±30",
      weight: SENSOR_CONFIG.humidity.weight,
    },
    {
      name: "Ionic Anode",
      icon: <FaBattleNet className="w-6 h-6" />,
      iconBg: "from-pink-500 to-pink-600",
      current: latestIonic.Ionic_Anode,
      ideal: SENSOR_CONFIG.ionic_anode.ideal,
      tolerance: SENSOR_CONFIG.ionic_anode.tolerance,
      unit: "mS/cm",
      visibility: calculateVisibility(
        latestIonic.Ionic_Anode,
        SENSOR_CONFIG.ionic_anode
      ),
      trend: calculateTrend(ionicData),
      type: "100±50 mS/cm",
      weight: SENSOR_CONFIG.ionic_anode.weight,
    },
    {
      name: "Ionic Cathode",
      icon: <FaBattleNet className="w-6 h-6" />,
      iconBg: "from-rose-500 to-rose-600",
      current: latestIonic.Ionic_Cathode,
      ideal: SENSOR_CONFIG.ionic_cathode.ideal,
      tolerance: SENSOR_CONFIG.ionic_cathode.tolerance,
      unit: "mS/cm",
      visibility: calculateVisibility(
        latestIonic.Ionic_Cathode,
        SENSOR_CONFIG.ionic_cathode
      ),
      trend: calculateTrend(ionicData),
      type: "100±50 mS/cm",
      weight: SENSOR_CONFIG.ionic_cathode.weight,
    },
  ];

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl border transition-all ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-200 shadow-lg"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className={`text-xl sm:text-2xl font-bold mb-1 bg-gradient-to-r ${
              isDarkMode
                ? "from-cyan-400 via-blue-400 to-teal-400"
                : "from-blue-600 via-cyan-600 to-teal-600"
            } bg-clip-text text-transparent`}
          >
            Sensor Performance
          </h2>
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            สุขภาพและประสิทธิภาพของเซนเซอร์แบบเรียลไทม์
          </p>
        </div>
      </div>

      {/* Overall System Performance Card */}
      <div
        className={`mb-6 p-6 rounded-2xl border-2 transition-all ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600"
            : "bg-gradient-to-br from-white to-slate-50 border-slate-300 shadow-xl"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3
              className={`text-2xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Overall System Performance
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              ประสิทธิภาพรวมของระบบจากเซนเซอร์ทั้งหมด
            </p>

            {/* Performance Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  System Health
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {overallPerformance.toFixed(1)}%
                  </span>
                  <span
                    className={`text-base font-bold px-3 py-1 rounded-lg ${
                      overallStatus.color === "green"
                        ? "bg-green-500 text-white"
                        : overallStatus.color === "yellow"
                        ? "bg-yellow-500 text-white"
                        : overallStatus.color === "orange"
                        ? "bg-orange-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {overallStatus.text}
                  </span>
                </div>
              </div>
              <div
                className={`h-4 rounded-full overflow-hidden ${
                  isDarkMode ? "bg-slate-600" : "bg-slate-200"
                }`}
              >
                <div
                  className={`h-full bg-gradient-to-r ${overallStatus.gradient} transition-all duration-1000 ease-out`}
                  style={{ width: `${overallPerformance}%` }}
                />
              </div>
            </div>

            {/* Weighted Contributions */}
            <div
              className={`grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 p-4 rounded-lg ${
                isDarkMode ? "bg-slate-800/50" : "bg-slate-100"
              }`}
            >
              {sensors.map((sensor, idx) => {
                const ratio = sensor.current / sensor.ideal;
                const contribution = (sensor.weight * ratio * 100).toFixed(1);
                return (
                  <div key={idx} className="text-center">
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {sensor.name}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {contribution}%
                    </div>
                    <div
                      className={`text-xs ${
                        isDarkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      (W: {(sensor.weight * 100).toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
        {sensors.map((sensor, index) => {
          const status = getStatus(sensor.visibility);
          const trendColor =
            sensor.trend > 0
              ? "text-green-500"
              : sensor.trend < 0
              ? "text-red-500"
              : "text-gray-500";
          const trendIcon =
            sensor.trend > 0 ? "↗" : sensor.trend < 0 ? "↘" : "→";

          return (
            <div
              key={index}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg bg-gradient-to-br ${sensor.iconBg} text-white shadow-md`}
                  >
                    {sensor.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {sensor.name}
                    </h3>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}
                    >
                      <span>{trendIcon}</span>
                      <span>
                        {sensor.trend > 0 ? "+" : ""}
                        {sensor.trend.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Value */}
              <div
                className={`mb-3 p-3 rounded-lg ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    ค่าปัจจุบัน:
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {sensor.current.toFixed(sensor.unit === "RPM" ? 0 : 0)}
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {sensor.unit}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    ค่าเหมาะสม:
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {sensor.type}
                  </span>
                </div>
              </div>

              {/* Visibility Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Visibility
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {sensor.visibility.toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        status.color === "green"
                          ? "bg-green-500 text-white"
                          : status.color === "yellow"
                          ? "bg-yellow-500 text-white"
                          : status.color === "orange"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                <div
                  className={`h-3 rounded-full overflow-hidden ${
                    isDarkMode ? "bg-slate-700" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`h-full bg-gradient-to-r ${status.gradient} transition-all duration-1000 ease-out rounded-full shadow-md`}
                    style={{ width: `${sensor.visibility}%` }}
                  />
                </div>
              </div>

              {/* Performance Score */}
              <div
                className={`pt-3 border-t ${
                  isDarkMode ? "border-slate-700" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Performance Score
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        sensor.visibility >= 90
                          ? "bg-green-500 animate-pulse"
                          : sensor.visibility >= 70
                          ? "bg-yellow-500"
                          : sensor.visibility >= 50
                          ? "bg-orange-500"
                          : "bg-red-500 animate-pulse"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-bold ${
                        sensor.visibility >= 90
                          ? "text-green-500"
                          : sensor.visibility >= 70
                          ? "text-yellow-500"
                          : sensor.visibility >= 50
                          ? "text-orange-500"
                          : "text-red-500"
                      }`}
                    >
                      {sensor.visibility >= 90
                        ? "A+"
                        : sensor.visibility >= 70
                        ? "B"
                        : sensor.visibility >= 50
                        ? "C"
                        : "D"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
