// components/GenericSensorChart.tsx
"use client";

import { useEffect, useState } from "react";
import { ChartVariable, CHART_VARIABLES } from "@/types/chartTypes";
import { SensorDataPoint } from "@/components/TimeSeriesChart";

interface GenericSensorChartProps {
  isDarkMode: boolean;
  allData: SensorDataPoint[];
  selectedVariable: ChartVariable;
}

export default function GenericSensorChart({
  isDarkMode,
  allData,
  selectedVariable,
}: GenericSensorChartProps) {
  const [anodeProgress, setAnodeProgress] = useState(0);
  const [cathodeProgress, setCathodeProgress] = useState(0);

  const varConfig = CHART_VARIABLES[selectedVariable];
  const isSingleValue = varConfig.single === true;

  // ✅ Get latest values from data
  const latestData = allData[allData.length - 1];

  const anodeValue = latestData
    ? (latestData[varConfig.anode.key as keyof SensorDataPoint] as number) || 0
    : 0;

  const cathodeValue =
    !isSingleValue && latestData
      ? (latestData[
          varConfig.cathode.key as keyof SensorDataPoint
        ] as number) || 0
      : 0;

  // Calculate percentage for circle progress
  const calculateProgress = (value: number) => {
    const percentage =
      ((value - varConfig.minValue) /
        (varConfig.maxValue - varConfig.minValue)) *
      100;
    return Math.max(0, Math.min(100, percentage));
  };

  // Calculate stroke dashoffset (220 is full circle circumference)
  const calculateDashOffset = (percentage: number) => {
    const circumference = 220;
    return circumference - (circumference * percentage) / 100;
  };

  // Animate progress when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnodeProgress(calculateProgress(anodeValue));
      if (!isSingleValue) {
        setCathodeProgress(calculateProgress(cathodeValue));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [anodeValue, cathodeValue, varConfig, isSingleValue]);

  const anodeColor = varConfig.anode.color;
  const cathodeColor = varConfig.cathode.color;

  return (
    <div
      className={`p-4 sm:p-5 md:p-6 lg:p-7 rounded-2xl shadow-xl transition-all h-full flex flex-col border ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-300 shadow-lg"
      }`}
    >
      {/* Title */}
      <div className="mb-4 sm:mb-5">
        <h3
          className={`text-base sm:text-lg md:text-xl font-bold mb-5 sm:mb-6 md:mb-7 text-center bg-gradient-to-r ${
            isDarkMode
              ? "from-cyan-400 via-blue-400 to-teal-400"
              : "from-blue-600 via-cyan-600 to-teal-600"
          } bg-clip-text text-transparent`}
        >
          {varConfig.label} Monitoring
        </h3>
      </div>

      {/* Centered Container */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Charts - Horizontal or Single Layout */}
        <div
          className={`flex ${
            isSingleValue ? "justify-center" : "flex-col sm:flex-row"
          } items-center justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-16`}
        >
          {/* Anode/Single Value Chart */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
              <svg
                viewBox="0 0 100 100"
                className="transform -rotate-90 w-full h-full"
              >
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                  strokeWidth="20"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke={anodeColor}
                  strokeWidth="20"
                  strokeDasharray="220"
                  strokeDashoffset={calculateDashOffset(anodeProgress)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${anodeColor}60) drop-shadow(0 0 15px ${anodeColor}30)`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all"
                  style={{ color: anodeColor }}
                >
                  {anodeValue.toFixed(1)}
                </p>
                <p
                  className="text-xs mt-1 font-semibold opacity-80"
                  style={{ color: anodeColor }}
                >
                  {anodeProgress.toFixed(0)}%
                </p>
              </div>
            </div>
            <p
              className="mt-4 text-sm sm:text-base font-semibold"
              style={{ color: anodeColor }}
            >
              {varConfig.anode.label}
            </p>
          </div>

          {/* Cathode Chart (only if not single value) */}
          {!isSingleValue && (
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="transform -rotate-90 w-full h-full"
                >
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                    strokeWidth="20"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={cathodeColor}
                    strokeWidth="20"
                    strokeDasharray="220"
                    strokeDashoffset={calculateDashOffset(cathodeProgress)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 8px ${cathodeColor}60) drop-shadow(0 0 15px ${cathodeColor}30)`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p
                    className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all"
                    style={{ color: cathodeColor }}
                  >
                    {cathodeValue.toFixed(1)}
                  </p>
                  <p
                    className="text-xs mt-1 font-semibold opacity-80"
                    style={{ color: cathodeColor }}
                  >
                    {cathodeProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
              <p
                className="mt-4 text-sm sm:text-base font-semibold"
                style={{ color: cathodeColor }}
              >
                {varConfig.cathode.label}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-8">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-1.5 rounded-full"
              style={{
                backgroundColor: anodeColor,
                boxShadow: `0 0 8px ${anodeColor}99`,
              }}
            />
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ color: anodeColor }}
            >
              {varConfig.anode.label}
            </span>
          </div>

          {!isSingleValue && (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-1.5 rounded-full"
                style={{
                  backgroundColor: cathodeColor,
                  boxShadow: `0 0 8px ${cathodeColor}99`,
                }}
              />
              <span
                className="text-xs sm:text-sm font-semibold"
                style={{ color: cathodeColor }}
              >
                {varConfig.cathode.label}
              </span>
            </div>
          )}
        </div>

        {/* Scale Reference */}
        <div
          className={`mt-6 pt-4 border-t transition-colors w-full max-w-md ${
            isDarkMode ? "border-slate-700/50" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs px-4">
            <span
              className={`font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {varConfig.minValue}
            </span>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Range ({varConfig.unit})
            </span>
            <span
              className={`font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {varConfig.maxValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
