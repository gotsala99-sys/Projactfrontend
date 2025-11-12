"use client";
import React from "react";

interface PumpStatus {
  anode: { isOn: boolean; direction: string; rpm: number };
  cathode: { isOn: boolean; direction: string; rpm: number };
}

// ✅ SIMPLIFIED: รับแค่ isOn state และ toggle function
interface StatusPanelProps {
  isDarkMode: boolean;
  pumpStatus?: PumpStatus;
  controlPump: (
    pump: "anode" | "cathode",
    isOn: boolean,
    direction?: "clockwise" | "counterclockwise",
    rpm?: number
  ) => Promise<void>;
  phData: { ph_Cathode: number; ph_Anode: number; time: string }[];
}

export default function StatusPanel({
  isDarkMode,
  pumpStatus,
  controlPump,
  phData,
}: StatusPanelProps) {
  const [showMessage, setShowMessage] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // ✅ อ่านค่า state จาก pumpStatus (real-time sync)
  const isAnodeOn = pumpStatus?.anode.isOn ?? false;
  const isCathodeOn = pumpStatus?.cathode.isOn ?? false;

  // ✅ UPDATED: ส่ง RPM = 0 เมื่อปิด, ส่ง RPM ตามที่ตั้งไว้เมื่อเปิด
  const handlePumpControl = async (
    pump: "anode" | "cathode",
    turnOn: boolean
  ) => {
    setMessage(`${pump.toUpperCase()} ${turnOn ? "ON" : "OFF"}`);
    setShowMessage(true);

    const currentPumpState =
      pump === "anode" ? pumpStatus?.anode : pumpStatus?.cathode;

    // ✅ ถ้าปิดปั้ม -> RPM = 0, ถ้าเปิด -> ใช้ค่า RPM ที่ตั้งไว้ (default 400)
    const rpm = turnOn ? (currentPumpState?.rpm || 400) : 0;

    await controlPump(
      pump,
      turnOn,
      (currentPumpState?.direction as "clockwise" | "counterclockwise") ||
        "clockwise",
      rpm
    );

    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const getMonthPHData = () => {
    if (!phData || phData.length === 0) return [];
    const monthData = phData.slice(-30);
    return monthData
      .filter(
        (d) =>
          d &&
          typeof d.ph_Anode === "number" &&
          typeof d.ph_Cathode === "number" &&
          !isNaN(d.ph_Anode) &&
          !isNaN(d.ph_Cathode) &&
          isFinite(d.ph_Anode) &&
          isFinite(d.ph_Cathode)
      )
      .map((d) => {
        const avg = (d.ph_Anode + d.ph_Cathode) / 2;
        return isNaN(avg) || !isFinite(avg) ? 7 : avg;
      });
  };

  const getDayPHData = () => {
    if (!phData || phData.length === 0) return [];
    const dayData = phData.slice(-24);
    return dayData
      .filter(
        (d) =>
          d &&
          typeof d.ph_Anode === "number" &&
          typeof d.ph_Cathode === "number" &&
          !isNaN(d.ph_Anode) &&
          !isNaN(d.ph_Cathode) &&
          isFinite(d.ph_Anode) &&
          isFinite(d.ph_Cathode)
      )
      .map((d) => {
        const avg = (d.ph_Anode + d.ph_Cathode) / 2;
        return isNaN(avg) || !isFinite(avg) ? 7 : avg;
      });
  };

  const createSVGPath = (dataArray: number[]) => {
    if (!dataArray || dataArray.length === 0) return "";
    const safeData = dataArray.filter(
      (d) => typeof d === "number" && !isNaN(d) && isFinite(d)
    );
    if (safeData.length === 0) return "";

    const points = safeData.map((ph, i) => {
      const x = safeData.length === 1 ? 50 : (i / (safeData.length - 1)) * 100;
      const y = 40 - (ph / 14) * 30;
      return { x, y };
    });

    const linePath = points
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)},${p.y.toFixed(2)}`
      )
      .join(" ");

    return linePath;
  };

  const createAreaPath = (dataArray: number[]) => {
    const linePath = createSVGPath(dataArray);
    if (!linePath) return "";
    const safeData = dataArray.filter(
      (d) => typeof d === "number" && !isNaN(d) && isFinite(d)
    );
    if (safeData.length === 0) return "";
    const lastX = safeData.length === 1 ? 50 : 100;
    return `${linePath} L ${lastX},40 L 0,40 Z`;
  };

  const monthPH = getMonthPHData();
  const dayPH = getDayPHData();

  return (
    <div
      className={`p-4 sm:p-5 md:p-6 lg:p-7 rounded-2xl shadow-xl h-full flex flex-col border transition-all ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-300 shadow-lg"
      }`}
    >
      <h3
        className={`text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 md:mb-5 pb-2 border-b ${
          isDarkMode
            ? "text-white border-slate-700/50"
            : "text-slate-800 border-slate-200"
        }`}
      >
        Status
      </h3>

      <div className="relative flex flex-col items-center justify-center gap-4 mb-5 sm:mb-6">
        {/* ✅ Toast Message */}
        {showMessage && (
          <div
            className={`absolute -top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-xl font-bold text-sm transition-all duration-300 z-50 ${
              message.includes("ON")
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
            }`}
          >
            {message}
          </div>
        )}

        {/* ✅ Anode Pump Control - Real-time State */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Anode Pump
            </h4>
            <div className="flex items-center gap-2">
              {/* ✅ Real-time status indicator */}
              {isAnodeOn && (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
              )}
              <span
                className={`text-xs font-semibold ${
                  isAnodeOn
                    ? "text-cyan-400"
                    : isDarkMode
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                {isAnodeOn ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className={`relative flex items-center justify-between p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                isAnodeOn
                  ? "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/50"
                  : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/50"
              }`}
            >
              {/* ✅ แสดง RPM และ Direction (แต่ไม่ควบคุมจากที่นี่) */}
              <div className="flex flex-col text-white">
                <span className="text-xs opacity-90">RPM</span>
                <span className="text-lg font-bold">
                  {pumpStatus?.anode.rpm ?? 0}
                </span>
                <span className="text-xs opacity-90 uppercase">
                  {pumpStatus?.anode.direction === "clockwise" ? "CW" : "CCW"}
                </span>
              </div>

              {/* ✅ Toggle Button - เฉพาะ ON/OFF */}
              <button
                onClick={() => handlePumpControl("anode", !isAnodeOn)}
                className={`w-12 h-12 rounded-full bg-white cursor-pointer transition-all duration-200 active:scale-90 hover:scale-105 ${
                  isAnodeOn
                    ? "shadow-[inset_0_0_0_4px_#06b6d4]"
                    : "shadow-[inset_0_0_0_4px_#9ca3af]"
                }`}
                aria-label={
                  isAnodeOn ? "Turn OFF Anode Pump" : "Turn ON Anode Pump"
                }
                type="button"
              >
                <span className="sr-only">
                  {isAnodeOn
                    ? "Anode pump is running"
                    : "Anode pump is stopped"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Cathode Pump Control - Real-time State */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`text-sm font-bold ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Cathode Pump
            </h4>
            <div className="flex items-center gap-2">
              {/* ✅ Real-time status indicator */}
              {isCathodeOn && (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
              )}
              <span
                className={`text-xs font-semibold ${
                  isCathodeOn
                    ? "text-emerald-400"
                    : isDarkMode
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                {isCathodeOn ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className={`relative flex items-center justify-between p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                isCathodeOn
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/50"
                  : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/50"
              }`}
            >
              {/* ✅ แสดง RPM และ Direction (แต่ไม่ควบคุมจากที่นี่) */}
              <div className="flex flex-col text-white">
                <span className="text-xs opacity-90">RPM</span>
                <span className="text-lg font-bold">
                  {pumpStatus?.cathode.rpm ?? 0}
                </span>
                <span className="text-xs opacity-90 uppercase">
                  {pumpStatus?.cathode.direction === "clockwise" ? "CW" : "CCW"}
                </span>
              </div>

              {/* ✅ Toggle Button - เฉพาะ ON/OFF */}
              <button
                onClick={() => handlePumpControl("cathode", !isCathodeOn)}
                className={`w-12 h-12 rounded-full bg-white cursor-pointer transition-all duration-200 active:scale-90 hover:scale-105 ${
                  isCathodeOn
                    ? "shadow-[inset_0_0_0_4px_#10b981]"
                    : "shadow-[inset_0_0_0_4px_#9ca3af]"
                }`}
                aria-label={
                  isCathodeOn ? "Turn OFF Cathode Pump" : "Turn ON Cathode Pump"
                }
                type="button"
              >
                <span className="sr-only">
                  {isCathodeOn
                    ? "Cathode pump is running"
                    : "Cathode pump is stopped"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* pH Charts - ไม่เปลี่ยนแปลง */}
      <div className="mb-4 sm:mb-5 flex-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h4
            className={`text-xs sm:text-sm font-bold ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            pH to month
          </h4>
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
              isDarkMode
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                : "bg-blue-100 text-blue-600 border-blue-200"
            }`}
          >
            30d
          </span>
        </div>

        <div
          className={`relative h-24 sm:h-28 md:h-32 rounded-xl p-2.5 sm:p-3 border transition-all ${
            isDarkMode
              ? "bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/20"
              : "bg-gradient-to-b from-blue-50 to-transparent border-blue-200"
          }`}
        >
          <svg
            viewBox="0 0 100 40"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="monthGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            {monthPH.length > 0 ? (
              <>
                <path d={createAreaPath(monthPH)} fill="url(#monthGradient)" />
                <path
                  d={createSVGPath(monthPH)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(59, 130, 246, 0.6))",
                  }}
                />
              </>
            ) : (
              <text
                x="50"
                y="20"
                textAnchor="middle"
                className={isDarkMode ? "fill-slate-500" : "fill-slate-400"}
                fontSize="4"
              >
                No data
              </text>
            )}
          </svg>
          <div
            className={`absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 px-2 py-1 rounded-lg text-white text-xs font-bold shadow-lg ${
              isDarkMode ? "bg-blue-500" : "bg-blue-600"
            }`}
          >
            Month
          </div>
        </div>

        <div className="flex justify-between text-xs mt-1.5 sm:mt-2 px-1">
          {["0", "2.8", "5.6", "8.4", "11.2", "14.0"].map((val, i) => (
            <span
              key={i}
              className={`font-medium ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {val}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h4
            className={`text-xs sm:text-sm font-bold ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            pH to Day
          </h4>
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
              isDarkMode
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                : "bg-cyan-100 text-cyan-600 border-cyan-200"
            }`}
          >
            24h
          </span>
        </div>

        <div
          className={`relative h-24 sm:h-28 md:h-32 rounded-xl p-2.5 sm:p-3 border transition-all ${
            isDarkMode
              ? "bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/20"
              : "bg-gradient-to-b from-cyan-50 to-transparent border-cyan-200"
          }`}
        >
          <svg
            viewBox="0 0 100 40"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="dayGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            {dayPH.length > 0 ? (
              <>
                <path d={createAreaPath(dayPH)} fill="url(#dayGradient)" />
                <path
                  d={createSVGPath(dayPH)}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(6, 182, 212, 0.6))",
                  }}
                />
              </>
            ) : (
              <text
                x="50"
                y="20"
                textAnchor="middle"
                className={isDarkMode ? "fill-slate-500" : "fill-slate-400"}
                fontSize="4"
              >
                No data
              </text>
            )}
          </svg>
          <div
            className={`absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 px-2 py-1 rounded-lg text-white text-xs font-bold shadow-lg ${
              isDarkMode ? "bg-cyan-500" : "bg-cyan-600"
            }`}
          >
            Day
          </div>
        </div>

        <div className="flex justify-between text-xs mt-1.5 sm:mt-2 px-1">
          {["0", "2.8", "5.6", "8.4", "11.2", "14.0"].map((val, i) => (
            <span
              key={i}
              className={`font-medium ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
