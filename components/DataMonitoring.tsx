// components/DataMonitoring.tsx - Dual Mode: Real-time & Historical
"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { MdCalendarToday } from "react-icons/md";
import { IoFlask } from "react-icons/io5";
import { TbTemperatureSun } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import { FaBattleNet } from "react-icons/fa6";
import { DiAtom } from "react-icons/di";
import { IoBatteryHalfOutline } from "react-icons/io5";
import { MdOutlineShutterSpeed } from "react-icons/md";

// Types
interface SensorHistoryPoint {
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
}

interface SensorDataPoint {
  ph_Anode: number;
  ph_Cathode: number;
  temperature_Anode: number;
  temperature_Cathode: number;
  Ionic_Anode: number;
  Ionic_Cathode: number;
  Humidity: number;
  hydrogen: number;
  Voltage: number;
  PumpSpeed_Anode: number;
  PumpSpeed_Cathode: number;
  time: string;
  timestamp: number;
}

interface MetricConfig {
  title: string;
  value: number | undefined;
  unit: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  dataKey: keyof SensorHistoryPoint;
  min: number;
  max: number;
}

interface DataMonitoringProps {
  isDarkMode: boolean;
  sensorData: SensorDataPoint | null;
  historicalData: SensorHistoryPoint[];
  realtimeData?: SensorHistoryPoint[];
  isLoading?: boolean;
  viewMode: "realtime" | "historical";
  onDateRangeChange?: (start: string, end: string, interval: number) => void;
}

// Memoized Components
const MetricCard = memo(
  ({
    title,
    value,
    unit,
    icon: Icon,
    color,
    isDarkMode,
  }: {
    title: string;
    value: number | undefined;
    unit: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    color: string;
    isDarkMode: boolean;
  }) => (
    <div
      className={`rounded-xl shadow-lg p-4 border-l-4 transition-all ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-200"
      }`}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-xs sm:text-sm font-medium ${
              isDarkMode ? "text-slate-400" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold mt-1 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {value !== null && value !== undefined ? value.toFixed(2) : "-"}
            <span
              className={`text-xs sm:text-sm ml-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              {unit}
            </span>
          </p>
        </div>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" style={{ color }} />
      </div>
    </div>
  )
);

MetricCard.displayName = "MetricCard";

// ✅ Real-time Chart Component (1 Hour Window)
const RealtimeChart = memo(
  ({
    title,
    dataPoints,
    dataKey,
    color,
    unit,
    isDarkMode,
    minValue = 0,
    maxValue = 100,
  }: {
    title: string;
    dataPoints: SensorHistoryPoint[];
    dataKey: keyof SensorHistoryPoint;
    color: string;
    unit: string;
    isDarkMode: boolean;
    minValue?: number;
    maxValue?: number;
  }) => {
    // Filter last 1 hour only
    const chartData = useMemo(() => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000; // 1 hour = 3600 seconds
      return dataPoints.filter((d) => d.timestamp >= oneHourAgo);
    }, [dataPoints]);

    const latestValue = useMemo(() => {
      if (chartData.length === 0) return null;
      const latest = chartData[chartData.length - 1];
      const value = latest?.[dataKey];
      return value !== null && value !== undefined ? (value as number) : null;
    }, [chartData, dataKey]);

    const scaleY = useCallback(
      (value: number): number => {
        const range = maxValue - minValue;
        return 100 - ((value - minValue) / range) * 100;
      },
      [maxValue, minValue]
    );

    const pathData = useMemo(() => {
      if (chartData.length === 0) return { linePath: "", areaPath: "" };

      const validPoints = chartData
        .map((d, i) => {
          const value = d[dataKey] as number | null;
          if (value === null || value === undefined) return null;
          return {
            x: (i / Math.max(chartData.length - 1, 1)) * 100,
            y: scaleY(value),
          };
        })
        .filter((p) => p !== null) as Array<{ x: number; y: number }>;

      if (validPoints.length === 0) {
        return { linePath: "", areaPath: "" };
      }

      if (validPoints.length === 1) {
        const linePath = `M ${validPoints[0].x},${validPoints[0].y}`;
        return { linePath, areaPath: "" };
      }

      let linePath = `M ${validPoints[0].x},${validPoints[0].y}`;
      for (let i = 0; i < validPoints.length - 1; i++) {
        const curr = validPoints[i];
        const next = validPoints[i + 1];
        const cpX = curr.x + (next.x - curr.x) * 0.5;
        const cpY1 = curr.y;
        const cpY2 = next.y;
        linePath += ` C ${cpX},${cpY1} ${cpX},${cpY2} ${next.x},${next.y}`;
      }

      const lastX = validPoints[validPoints.length - 1].x;
      const areaPath = `${linePath} L ${lastX},100 L ${validPoints[0].x},100 Z`;

      return { linePath, areaPath };
    }, [chartData, dataKey, scaleY]);

    const yAxisLabels = useMemo(() => {
      return Array.from({ length: 6 }, (_, i) => {
        const value = maxValue - (i * (maxValue - minValue)) / 5;
        return value.toFixed(1);
      });
    }, [maxValue, minValue]);

    const timeLabels = useMemo(() => {
      if (chartData.length === 0) return [];

      const maxLabels = 4;
      const step = Math.max(1, Math.floor(chartData.length / (maxLabels - 1)));
      const labels = [];

      for (let i = 0; i < chartData.length; i += step) {
        if (labels.length < maxLabels - 1) {
          labels.push({
            position: (i / Math.max(chartData.length - 1, 1)) * 100,
            label: chartData[i].time,
          });
        }
      }

      if (chartData.length > 0) {
        const lastLabel = chartData[chartData.length - 1].time;
        if (
          labels.length === 0 ||
          labels[labels.length - 1].label !== lastLabel
        ) {
          labels.push({
            position: 100,
            label: lastLabel,
          });
        }
      }

      return labels;
    }, [chartData]);

    return (
      <div
        className={`p-4 sm:p-5 rounded-xl shadow-lg transition-all border ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-base sm:text-lg font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <div
            className={`text-xs flex items-center gap-2 ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time (1h)</span>
          </div>
        </div>

        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-0 top-0 bottom-16 flex flex-col justify-between text-xs font-semibold">
            {yAxisLabels.map((label, i) => (
              <span
                key={i}
                className={isDarkMode ? "text-slate-400" : "text-slate-600"}
              >
                {label}
              </span>
            ))}
          </div>

          <div
            className={`relative h-48 sm:h-56 border-l-2 border-b-2 rounded-bl-xl ${
              isDarkMode ? "border-slate-600" : "border-slate-300"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-b ${
                    isDarkMode ? "border-slate-700/40" : "border-slate-200"
                  }`}
                  style={{ bottom: `${i * 20}%` }}
                />
              ))}
            </div>

            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={`gradient-realtime-${String(dataKey)}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={`${color}4D`} />
                  <stop offset="100%" stopColor={`${color}05`} />
                </linearGradient>
              </defs>

              {pathData.areaPath && (
                <path
                  d={pathData.areaPath}
                  fill={`url(#gradient-realtime-${String(dataKey)})`}
                  className="transition-all duration-300"
                />
              )}

              {pathData.linePath && (
                <path
                  d={pathData.linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                  style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
                />
              )}
            </svg>

            {latestValue !== null && (
              <div
                className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg border text-xs sm:text-sm font-bold ${
                  isDarkMode
                    ? "bg-slate-800/90 border-slate-700/50"
                    : "bg-white/90 border-slate-200"
                }`}
                style={{ color }}
              >
                {latestValue.toFixed(2)} {unit}
              </div>
            )}

            {chartData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Waiting for data...
                </p>
              </div>
            )}
          </div>

          <div className="relative h-10 mt-2">
            <div className="flex justify-between items-center w-full">
              {timeLabels.map((label, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium whitespace-nowrap ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {label.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RealtimeChart.displayName = "RealtimeChart";

// ✅ Historical Chart Component (Date Range with Intervals)
const HistoricalChart = memo(
  ({
    title,
    dataPoints,
    dataKey,
    color,
    unit,
    isDarkMode,
    minValue = 0,
    maxValue = 100,
  }: {
    title: string;
    dataPoints: SensorHistoryPoint[];
    dataKey: keyof SensorHistoryPoint;
    color: string;
    unit: string;
    isDarkMode: boolean;
    minValue?: number;
    maxValue?: number;
  }) => {
    const latestValue = useMemo(() => {
      if (dataPoints.length === 0) return null;
      const latest = dataPoints[dataPoints.length - 1];
      const value = latest?.[dataKey];
      return value !== null && value !== undefined ? (value as number) : null;
    }, [dataPoints, dataKey]);

    const scaleY = useCallback(
      (value: number): number => {
        const range = maxValue - minValue;
        return 100 - ((value - minValue) / range) * 100;
      },
      [maxValue, minValue]
    );

    const pathData = useMemo(() => {
      if (dataPoints.length === 0) return { linePath: "", areaPath: "" };

      const validPoints = dataPoints
        .map((d, i) => {
          const value = d[dataKey] as number | null;
          if (value === null || value === undefined) return null;
          return {
            x: (i / Math.max(dataPoints.length - 1, 1)) * 100,
            y: scaleY(value),
          };
        })
        .filter((p) => p !== null) as Array<{ x: number; y: number }>;

      if (validPoints.length === 0) {
        return { linePath: "", areaPath: "" };
      }

      if (validPoints.length === 1) {
        const linePath = `M ${validPoints[0].x},${validPoints[0].y}`;
        return { linePath, areaPath: "" };
      }

      let linePath = `M ${validPoints[0].x},${validPoints[0].y}`;
      for (let i = 0; i < validPoints.length - 1; i++) {
        const curr = validPoints[i];
        const next = validPoints[i + 1];
        const cpX = curr.x + (next.x - curr.x) * 0.5;
        const cpY1 = curr.y;
        const cpY2 = next.y;
        linePath += ` C ${cpX},${cpY1} ${cpX},${cpY2} ${next.x},${next.y}`;
      }

      const lastX = validPoints[validPoints.length - 1].x;
      const areaPath = `${linePath} L ${lastX},100 L ${validPoints[0].x},100 Z`;

      return { linePath, areaPath };
    }, [dataPoints, dataKey, scaleY]);

    const yAxisLabels = useMemo(() => {
      return Array.from({ length: 6 }, (_, i) => {
        const value = maxValue - (i * (maxValue - minValue)) / 5;
        return value.toFixed(1);
      });
    }, [maxValue, minValue]);

    const timeLabels = useMemo(() => {
      if (dataPoints.length === 0) return [];

      const maxLabels = 4;
      const step = Math.max(1, Math.floor(dataPoints.length / (maxLabels - 1)));
      const labels = [];

      for (let i = 0; i < dataPoints.length; i += step) {
        if (labels.length < maxLabels - 1) {
          labels.push({
            position: (i / Math.max(dataPoints.length - 1, 1)) * 100,
            label: dataPoints[i].time,
          });
        }
      }

      if (dataPoints.length > 0) {
        const lastLabel = dataPoints[dataPoints.length - 1].time;
        if (
          labels.length === 0 ||
          labels[labels.length - 1].label !== lastLabel
        ) {
          labels.push({
            position: 100,
            label: lastLabel,
          });
        }
      }

      return labels;
    }, [dataPoints]);

    const dataStats = useMemo(() => {
      const validCount = dataPoints.filter(
        (p) => p[dataKey] !== null && p[dataKey] !== undefined
      ).length;
      const nullCount = dataPoints.length - validCount;
      return { validCount, nullCount, total: dataPoints.length };
    }, [dataPoints, dataKey]);

    return (
      <div
        className={`p-4 sm:p-5 rounded-xl shadow-lg transition-all border ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-base sm:text-lg font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          {dataStats.total > 0 && (
            <div
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              <span className="font-semibold">{dataStats.validCount}</span> /{" "}
              {dataStats.total} จุด
              {dataStats.nullCount > 0 && (
                <span className="ml-1 text-yellow-500">
                  ({dataStats.nullCount} ว่าง)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-0 top-0 bottom-16 flex flex-col justify-between text-xs font-semibold">
            {yAxisLabels.map((label, i) => (
              <span
                key={i}
                className={isDarkMode ? "text-slate-400" : "text-slate-600"}
              >
                {label}
              </span>
            ))}
          </div>

          <div
            className={`relative h-48 sm:h-56 border-l-2 border-b-2 rounded-bl-xl ${
              isDarkMode ? "border-slate-600" : "border-slate-300"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-b ${
                    isDarkMode ? "border-slate-700/40" : "border-slate-200"
                  }`}
                  style={{ bottom: `${i * 20}%` }}
                />
              ))}
            </div>

            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={`gradient-historical-${String(dataKey)}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={`${color}4D`} />
                  <stop offset="100%" stopColor={`${color}05`} />
                </linearGradient>
              </defs>

              {pathData.areaPath && (
                <path
                  d={pathData.areaPath}
                  fill={`url(#gradient-historical-${String(dataKey)})`}
                  className="transition-all duration-300"
                />
              )}

              {pathData.linePath && (
                <path
                  d={pathData.linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                  style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
                />
              )}
            </svg>

            {latestValue !== null && (
              <div
                className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg border text-xs sm:text-sm font-bold ${
                  isDarkMode
                    ? "bg-slate-800/90 border-slate-700/50"
                    : "bg-white/90 border-slate-200"
                }`}
                style={{ color }}
              >
                {latestValue.toFixed(2)} {unit}
              </div>
            )}

            {dataPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  เลือกช่วงวันที่เพื่อดูข้อมูล
                </p>
              </div>
            )}

            {dataPoints.length > 0 && dataStats.validCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-yellow-500" : "text-yellow-600"
                  }`}
                >
                  ไม่มีข้อมูลในช่วงเวลานี้
                </p>
              </div>
            )}
          </div>

          <div className="relative h-10 mt-2">
            <div className="flex justify-between items-center w-full">
              {timeLabels.map((label, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium whitespace-nowrap ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {label.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HistoricalChart.displayName = "HistoricalChart";

const QuickSelectButton = memo(
  ({
    label,
    onClick,
    isDarkMode,
    isActive,
  }: {
    label: string;
    onClick: () => void;
    isDarkMode: boolean;
    isActive?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        isActive
          ? isDarkMode
            ? "bg-cyan-600 text-white border-cyan-500"
            : "bg-blue-600 text-white border-blue-500"
          : isDarkMode
          ? "bg-slate-700 hover:bg-slate-600 text-cyan-400 border border-slate-600"
          : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
      }`}
    >
      {label}
    </button>
  )
);

QuickSelectButton.displayName = "QuickSelectButton";

export default function DataMonitoring({
  isDarkMode,
  sensorData,
  historicalData,
  realtimeData = [],
  isLoading,
  viewMode,
  onDateRangeChange,
}: DataMonitoringProps) {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [timeRange, setTimeRange] = useState({
    startTime: "00:00",
    endTime: "23:59",
  });

  const [interval, setInterval] = useState<number>(1);
  const [activePreset, setActivePreset] = useState<string>("24h");

  // Only trigger date range change in historical mode
  useEffect(() => {
    if (viewMode === "historical") {
      const timer = setTimeout(() => {
        if (onDateRangeChange) {
          const startDateTime = `${dateRange.start}T${timeRange.startTime}:00`;
          const endDateTime = `${dateRange.end}T${timeRange.endTime}:59`;
          onDateRangeChange(startDateTime, endDateTime, interval);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [dateRange, timeRange, interval, onDateRangeChange, viewMode]);

  const metrics: MetricConfig[] = useMemo(
    () => [
      {
        title: "pH Anode",
        value: sensorData?.ph_Anode,
        unit: "pH",
        icon: IoFlask,
        color: "#ec4899",
        dataKey: "ph_Anode",
        min: 0,
        max: 14,
      },
      {
        title: "pH Cathode",
        value: sensorData?.ph_Cathode,
        unit: "pH",
        icon: IoFlask,
        color: "#3b82f6",
        dataKey: "ph_Cathode",
        min: 0,
        max: 14,
      },
      {
        title: "อุณหภูมิ Anode",
        value: sensorData?.temperature_Anode,
        unit: "°C",
        icon: TbTemperatureSun,
        color: "#f59e0b",
        dataKey: "temperature_Anode",
        min: 0,
        max: 80,
      },
      {
        title: "อุณหภูมิ Cathode",
        value: sensorData?.temperature_Cathode,
        unit: "°C",
        icon: TbTemperatureSun,
        color: "#ef4444",
        dataKey: "temperature_Cathode",
        min: 0,
        max: 80,
      },
      {
        title: "ไอออน Anode",
        value: sensorData?.Ionic_Anode,
        unit: "mS/cm",
        icon: FaBattleNet,
        color: "#8b5cf6",
        dataKey: "Ionic_Anode",
        min: 0,
        max: 300,
      },
      {
        title: "ไอออน Cathode",
        value: sensorData?.Ionic_Cathode,
        unit: "mS/cm",
        icon: FaBattleNet,
        color: "#a855f7",
        dataKey: "Ionic_Cathode",
        min: 0,
        max: 300,
      },
      {
        title: "ความชื้น",
        value: sensorData?.Humidity,
        unit: "%",
        icon: WiHumidity,
        color: "#10b981",
        dataKey: "Humidity",
        min: 0,
        max: 100,
      },
      {
        title: "ไฮโดรเจน",
        value: sensorData?.hydrogen,
        unit: "cm³",
        icon: DiAtom,
        color: "#14b8a6",
        dataKey: "hydrogen",
        min: 0,
        max: 1000,
      },
      {
        title: "Pump Speed Anode",
        value: sensorData?.PumpSpeed_Anode,
        unit: "RPM",
        icon: MdOutlineShutterSpeed,
        color: "#10b981",
        dataKey: "PumpSpeed_Anode",
        min: 0,
        max: 1000,
      },
      {
        title: "Pump Speed Cathode",
        value: sensorData?.PumpSpeed_Cathode,
        unit: "RPM",
        icon: MdOutlineShutterSpeed,
        color: "#eab308",
        dataKey: "PumpSpeed_Cathode",
        min: 0,
        max: 1000,
      },
      {
        title: "แรงดัน",
        value: sensorData?.Voltage,
        unit: "V",
        icon: IoBatteryHalfOutline,
        color: "#f43f5e",
        dataKey: "Voltage",
        min: 0,
        max: 5,
      },
    ],
    [sensorData]
  );

  const quickSelectHandlers = useMemo(
    () => ({
      oneHour: () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        setDateRange({
          start: oneHourAgo.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        });
        setTimeRange({
          startTime: oneHourAgo.toTimeString().slice(0, 5),
          endTime: now.toTimeString().slice(0, 5),
        });
        setInterval(1);
        setActivePreset("1h");
      },
      sixHours: () => {
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        setDateRange({
          start: sixHoursAgo.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        });
        setTimeRange({
          startTime: sixHoursAgo.toTimeString().slice(0, 5),
          endTime: now.toTimeString().slice(0, 5),
        });
        setInterval(5);
        setActivePreset("6h");
      },
      twelveHours: () => {
        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        setDateRange({
          start: twelveHoursAgo.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        });
        setTimeRange({
          startTime: twelveHoursAgo.toTimeString().slice(0, 5),
          endTime: now.toTimeString().slice(0, 5),
        });
        setInterval(10);
        setActivePreset("12h");
      },
      oneDay: () => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        setDateRange({
          start: oneDayAgo.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        });
        setTimeRange({ startTime: "00:00", endTime: "23:59" });
        setInterval(15);
        setActivePreset("24h");
      },
      sevenDays: () => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        setDateRange({
          start: sevenDaysAgo.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        });
        setTimeRange({ startTime: "00:00", endTime: "23:59" });
        setInterval(60);
        setActivePreset("7d");
      },
    }),
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
            isDarkMode
              ? "from-cyan-400 via-blue-400 to-teal-400"
              : "from-blue-600 via-cyan-600 to-teal-600"
          }`}
        >
          {viewMode === "realtime"
            ? "ระบบติดตามข้อมูลเซ็นเซอร์แบบเรียลไทม์"
            : "ระบบติดตามข้อมูลเซ็นเซอร์ย้อนหลัง"}
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
          {viewMode === "realtime"
            ? "แสดงข้อมูลแบบเรียลไทม์ (1 ชั่วโมงล่าสุด)"
            : "แสดงข้อมูลย้อนหลังตามช่วงเวลาที่เลือก"}
        </p>
      </div>

      {/* ✅ Date Range Selector - Only show in Historical mode */}
      {viewMode === "historical" && (
        <div
          className={`rounded-xl shadow-lg p-4 ${
            isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
          }`}
        >
          <div className="flex items-start gap-4 flex-wrap">
            <MdCalendarToday
              className={`w-5 h-5 mt-2 ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="start-date"
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                วันที่เริ่มต้น:
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange({ ...dateRange, start: e.target.value });
                  setActivePreset("");
                }}
                className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
              />
              <input
                id="start-time"
                type="time"
                value={timeRange.startTime}
                onChange={(e) => {
                  setTimeRange({ ...timeRange, startTime: e.target.value });
                  setActivePreset("");
                }}
                className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
                aria-label="Start Time"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="end-date"
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                วันที่สิ้นสุด:
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange({ ...dateRange, end: e.target.value });
                  setActivePreset("");
                }}
                className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
              />
              <input
                id="end-time"
                type="time"
                value={timeRange.endTime}
                onChange={(e) => {
                  setTimeRange({ ...timeRange, endTime: e.target.value });
                  setActivePreset("");
                }}
                className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
                aria-label="End Time"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="interval"
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                ช่วงเวลา (นาที):
              </label>
              <input
                id="interval"
                type="number"
                min="1"
                max="1440"
                value={interval}
                onChange={(e) => {
                  setInterval(parseInt(e.target.value) || 1);
                  setActivePreset("");
                }}
                className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
              />
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-500" : "text-gray-500"
                }`}
              >
                ทุก {interval} นาที
              </p>
            </div>

            <div className="flex flex-col gap-2 ml-auto">
              <label
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                ช่วงเวลาด่วน:
              </label>
              <div className="flex gap-2 flex-wrap">
                <QuickSelectButton
                  label="1 ชม."
                  onClick={quickSelectHandlers.oneHour}
                  isDarkMode={isDarkMode}
                  isActive={activePreset === "1h"}
                />
                <QuickSelectButton
                  label="6 ชม."
                  onClick={quickSelectHandlers.sixHours}
                  isDarkMode={isDarkMode}
                  isActive={activePreset === "6h"}
                />
                <QuickSelectButton
                  label="12 ชม."
                  onClick={quickSelectHandlers.twelveHours}
                  isDarkMode={isDarkMode}
                  isActive={activePreset === "12h"}
                />
                <QuickSelectButton
                  label="24 ชม."
                  onClick={quickSelectHandlers.oneDay}
                  isDarkMode={isDarkMode}
                  isActive={activePreset === "24h"}
                />
                <QuickSelectButton
                  label="7 วัน"
                  onClick={quickSelectHandlers.sevenDays}
                  isDarkMode={isDarkMode}
                  isActive={activePreset === "7d"}
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mt-3 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-cyan-400" : "text-blue-600"
                }`}
              >
                🔄 กำลังดึงข้อมูลย้อนหลัง...
              </p>
            </div>
          )}

          {!isLoading && historicalData.length > 0 && (
            <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
              <p className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
                ✅ พบข้อมูล {historicalData.length.toLocaleString()} จุด
              </p>
              <p className={isDarkMode ? "text-slate-500" : "text-gray-500"}>
                | ช่วงเวลา: ทุก {interval} นาที
              </p>
              {historicalData.length > 0 && (
                <p className={isDarkMode ? "text-slate-500" : "text-gray-500"}>
                  | ตั้งแต่ {historicalData[0].time} ถึง{" "}
                  {historicalData[historicalData.length - 1].time}
                </p>
              )}
            </div>
          )}

          {!isLoading && historicalData.length === 0 && (
            <p
              className={`mt-2 text-sm ${
                isDarkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              ⚠️ ไม่พบข้อมูลในช่วงเวลาที่เลือก
            </p>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.dataKey}
            {...metric}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Charts - Conditional rendering based on view mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {viewMode === "realtime"
          ? // ✅ Real-time Charts (1 hour window)
            metrics.map((metric) => (
              <RealtimeChart
                key={metric.dataKey}
                title={metric.title}
                dataPoints={realtimeData}
                dataKey={metric.dataKey}
                color={metric.color}
                unit={metric.unit}
                isDarkMode={isDarkMode}
                minValue={metric.min}
                maxValue={metric.max}
              />
            ))
          : // ✅ Historical Charts (date range)
            metrics.map((metric) => (
              <HistoricalChart
                key={metric.dataKey}
                title={metric.title}
                dataPoints={historicalData}
                dataKey={metric.dataKey}
                color={metric.color}
                unit={metric.unit}
                isDarkMode={isDarkMode}
                minValue={metric.min}
                maxValue={metric.max}
              />
            ))}
      </div>
    </div>
  );
}
