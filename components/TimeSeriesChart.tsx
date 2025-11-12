"use client";

import { useState, useEffect } from "react";
import { ChartVariable, CHART_VARIABLES } from "@/types/chartTypes";

// ✅ Export type เพื่อใช้ใน page.tsx
export interface SensorDataPoint {
  // pH data
  ph_Anode: number;
  ph_Cathode: number;
  // Temperature data
  temperature_Anode: number;
  temperature_Cathode: number;
  // Ionic data
  Ionic_Anode: number;
  Ionic_Cathode: number;
  // Single value data
  Humidity: number;
  hydrogen: number;
  Voltage: number;
  // Time & Timestamp
  time: string;
  timestamp?: number;
}

interface TimeSeriesChartProps {
  isDarkMode: boolean;
  allData: SensorDataPoint[];
  selectedVariable: ChartVariable;
}

export default function TimeSeriesChart({
  isDarkMode,
  allData,
  selectedVariable,
}: TimeSeriesChartProps) {
  const [chartData, setChartData] = useState<SensorDataPoint[]>([]);
  const [latestCathode, setLatestCathode] = useState<number | null>(null);
  const [latestAnode, setLatestAnode] = useState<number | null>(null);

  // ✨ เพิ่ม state สำหรับอนิเมชั่น
  const [animatedCathodePath, setAnimatedCathodePath] = useState<string>("");
  const [animatedAnodePath, setAnimatedAnodePath] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  const varConfig = CHART_VARIABLES[selectedVariable];

  // ✅ เอาข้อมูล 100 จุดล่าสุด
  useEffect(() => {
    if (allData && allData.length > 0) {
      // เอาข้อมูล 100 จุดล่าสุดเท่านั้น
      const last100Points = allData.slice(-50);

      setChartData(last100Points);

      const latest = last100Points[last100Points.length - 1];
      if (latest) {
        const cathodeValue =
          latest[varConfig.cathode.key as keyof SensorDataPoint];
        const anodeValue = latest[varConfig.anode.key as keyof SensorDataPoint];

        setLatestCathode(
          typeof cathodeValue === "number" ? cathodeValue : null
        );
        setLatestAnode(typeof anodeValue === "number" ? anodeValue : null);
      }
    } else {
      setChartData([]);
      setLatestCathode(null);
      setLatestAnode(null);
    }
  }, [allData, selectedVariable, varConfig]);

  // ✨ เพิ่ม useEffect สำหรับอนิเมชั่นเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (chartData.length > 0) {
      setIsAnimating(true);

      // ใช้ setTimeout เพื่อให้อนิเมชั่นทำงาน (คลี้ย GenericSensorChart)
      const timer = setTimeout(() => {
        setAnimatedCathodePath(createSmoothPath(varConfig.cathode.key));
        setAnimatedAnodePath(createSmoothPath(varConfig.anode.key));
        setIsAnimating(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [chartData, varConfig]);

  // Scale value to chart coordinates (0-100%)
  const scaleY = (value: number) => {
    const range = varConfig.maxValue - varConfig.minValue;
    const normalized = (value - varConfig.minValue) / range;
    return 100 - normalized * 100;
  };

  // Create smooth curve path
  const createSmoothPath = (dataKey: string) => {
    if (chartData.length === 0) return "";

    const points = chartData.map((d, i) => {
      const value = d[dataKey as keyof SensorDataPoint];
      return {
        x: (i / Math.max(chartData.length - 1, 1)) * 100,
        y: scaleY(typeof value === "number" ? value : 0),
      };
    });

    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];

      const cpX = curr.x + (next.x - curr.x) * 0.5;
      const cpY1 = curr.y;
      const cpY2 = next.y;

      path += ` C ${cpX},${cpY1} ${cpX},${cpY2} ${next.x},${next.y}`;
    }

    return path;
  };

  // Create area path for gradient fill
  const createAreaPath = (dataKey: string) => {
    const linePath = createSmoothPath(dataKey);
    if (!linePath || chartData.length === 0) return "";

    const lastX =
      ((chartData.length - 1) / Math.max(chartData.length - 1, 1)) * 100;
    return `${linePath} L ${lastX},100 L 0,100 Z`;
  };

  // Generate Y-axis labels (10 ค่า)
  const getYAxisLabels = () => {
    const labels = [];
    const numLabels = 10;
    const step = (varConfig.maxValue - varConfig.minValue) / numLabels;

    for (let i = 0; i <= numLabels; i++) {
      const value = varConfig.maxValue - step * i;
      labels.push(value.toFixed(1));
    }
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  // Get time labels for x-axis
  const getTimeLabels = () => {
    if (chartData.length === 0) return [];

    const step = Math.max(1, Math.floor(chartData.length / 10));
    const labels = [];

    for (let i = 0; i < chartData.length; i += step) {
      labels.push({
        position: (i / Math.max(chartData.length - 1, 1)) * 100,
        label: chartData[i].time || "",
      });
    }

    // เพิ่ม label สุดท้ายเสมอ
    const lastIndex = chartData.length - 1;
    const lastPosition = 100;

    if (labels.length === 0 || labels[labels.length - 1].position < 95) {
      labels.push({
        position: lastPosition,
        label: chartData[lastIndex].time || "",
      });
    }

    return labels;
  };

  // คำนวดค่ากึ่งกลาง
  const midValue = (varConfig.maxValue + varConfig.minValue) / 2;
  const midPosition =
    ((midValue - varConfig.minValue) /
      (varConfig.maxValue - varConfig.minValue)) *
    100;

  const anodeColor = varConfig.anode.color;
  const cathodeColor = varConfig.cathode.color;
  const isSingleValue = varConfig.single === true;

  return (
    <div
      className={`p-4 sm:p-5 md:p-6 lg:p-7 pb-6 rounded-2xl shadow-xl transition-all h-full flex flex-col border ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-300 shadow-lg"
      }`}
    >
      {/* Title */}
      <div className="mb-4 sm:mb-5">
        <h3
          className={`text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r bg-clip-text text-transparent ${
            isDarkMode
              ? "from-cyan-400 via-blue-400 to-teal-400"
              : "from-blue-600 via-cyan-600 to-teal-600"
          }`}
        >
          {varConfig.label}
          <span className="text-sm ml-2 opacity-70">(Last 100 Points)</span>
        </h3>
      </div>

      {/* Chart Container */}
      <div className="relative pl-8 sm:pl-10 md:pl-12 flex-1 flex flex-col">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 bottom-16 flex flex-col justify-between text-xs sm:text-sm font-semibold">
          {yAxisLabels.map((label, i) => (
            <span
              key={i}
              className={`${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              } leading-none transition-all duration-500`}
              style={{
                transform:
                  i === yAxisLabels.length - 1
                    ? "translateY(-300%)"
                    : i === 9
                    ? "translateY(-275%)"
                    : i === 8
                    ? "translateY(-250%)"
                    : i === 7
                    ? "translateY(-225%)"
                    : i === 6
                    ? "translateY(-200%)"
                    : i === 5
                    ? "translateY(-175%)"
                    : i === 4
                    ? "translateY(-160%)"
                    : i === 3
                    ? "translateY(-125%)"
                    : i === 2
                    ? "translateY(-100%)"
                    : i === 1
                    ? "translateY(-100%)"
                    : i === 0
                    ? "translateY(-50%)"
                    : "translateY(0)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Chart Area */}
        <div
          className={`relative flex-1 min-h-[16rem] sm:min-h-[18rem] md:min-h-[20rem] lg:min-h-[24rem] border-l-2 border-b-2 rounded-bl-xl transition-all duration-500 ${
            isDarkMode ? "border-slate-600" : "border-slate-300"
          }`}
        >
          {/* Grid Lines - 10 เส้น */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
              const position = (i / 10) * 100;
              return (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-b transition-all duration-500 ${
                    isDarkMode ? "border-slate-700/30" : "border-slate-300"
                  }`}
                  style={{ bottom: `${position}%` }}
                />
              );
            })}

            {/* เส้นกึ่งกลางสีแดง - ทุกกราฟ */}
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 border-dashed opacity-60 transition-all duration-500"
              style={{
                bottom: `${midPosition}%`,
              }}
            />
          </div>

          {/* SVG Chart */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Cathode Gradient */}
              <linearGradient
                id={`cathodeGradient-${selectedVariable}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={`${cathodeColor}4D`}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={`${cathodeColor}05`}
                  stopOpacity="0.02"
                />
              </linearGradient>

              {/* Anode Gradient */}
              <linearGradient
                id={`anodeGradient-${selectedVariable}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={`${anodeColor}4D`}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={`${anodeColor}05`}
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>

            {/* Cathode (only for dual-value variables) */}
            {!isSingleValue && (
              <>
                <path
                  d={createAreaPath(varConfig.cathode.key)}
                  fill={`url(#cathodeGradient-${selectedVariable})`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    opacity: isAnimating ? 0 : 1,
                  }}
                />
                <path
                  d={
                    animatedCathodePath ||
                    createSmoothPath(varConfig.cathode.key)
                  }
                  fill="none"
                  stroke={cathodeColor}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 3px ${cathodeColor}80)`,
                    opacity: isAnimating ? 0.5 : 1,
                  }}
                />
              </>
            )}

            {/* Anode */}
            <path
              d={createAreaPath(varConfig.anode.key)}
              fill={`url(#anodeGradient-${selectedVariable})`}
              className="transition-all duration-1000 ease-out"
              style={{
                opacity: isAnimating ? 0 : 1,
              }}
            />
            <path
              d={animatedAnodePath || createSmoothPath(varConfig.anode.key)}
              fill="none"
              stroke={anodeColor}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 3px ${anodeColor}80)`,
                opacity: isAnimating ? 0.5 : 1,
              }}
            />
          </svg>

          {/* Latest Values Display */}
          {((isSingleValue && latestAnode !== null) ||
            (!isSingleValue &&
              latestCathode !== null &&
              latestAnode !== null)) && (
            <div
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 px-3 py-2 rounded-xl backdrop-blur-sm shadow-xl border transition-all duration-500 ${
                isDarkMode
                  ? "bg-slate-800/90 border-slate-700/50"
                  : "bg-white/90 border-slate-200"
              }`}
            >
              {!isSingleValue && latestCathode !== null && (
                <div
                  className="text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-500"
                  style={{ color: cathodeColor }}
                >
                  {varConfig.cathode.label}: {latestCathode.toFixed(1)}{" "}
                  {varConfig.unit}
                </div>
              )}
              {latestAnode !== null && (
                <div
                  className="text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-500"
                  style={{ color: anodeColor }}
                >
                  {varConfig.anode.label}: {latestAnode.toFixed(1)}{" "}
                  {varConfig.unit}
                </div>
              )}
            </div>
          )}

          {/* No Data Message */}
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                className={`text-sm font-medium transition-all duration-500 ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Waiting for data...
              </p>
            </div>
          )}
        </div>

        {/* X-axis Time Labels */}
        <div className="relative h-10 mt-2">
          {getTimeLabels().map((label, i) => (
            <span
              key={i}
              className={`absolute text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all duration-500 ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
              style={{
                left: `${label.position}%`,
                transform:
                  i === getTimeLabels().length - 1
                    ? "translateX(-100%) translateX(0.25rem)"
                    : i === 0
                    ? "translateX(-0.25rem)"
                    : "translateX(-50%)",
              }}
            >
              {label.label}
            </span>
          ))}
        </div>

        {/* X-axis Label */}
        <div className="flex items-center justify-center mt-2">
          <span
            className={`text-sm sm:text-base font-semibold transition-all duration-500 ${
              isDarkMode ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Time (Last 50 Data Points)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
          {!isSingleValue && (
            <div className="flex items-center gap-2 transition-all duration-500">
              <div
                className="w-4 h-1.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: cathodeColor,
                  boxShadow: `0 0 8px ${cathodeColor}99`,
                }}
              />
              <span
                className="text-xs sm:text-sm font-semibold transition-all duration-500"
                style={{ color: cathodeColor }}
              >
                {varConfig.cathode.label}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 transition-all duration-500">
            <div
              className="w-4 h-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: anodeColor,
                boxShadow: `0 0 8px ${anodeColor}99`,
              }}
            />
            <span
              className="text-xs sm:text-sm font-semibold transition-all duration-500"
              style={{ color: anodeColor }}
            >
              {varConfig.anode.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
