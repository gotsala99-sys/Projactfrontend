"use client";

import { useRef } from "react";
import { DiAtom } from "react-icons/di";
import { IoFlask } from "react-icons/io5";
import { MdOutlineShutterSpeed } from "react-icons/md";
import { IoBatteryHalfOutline } from "react-icons/io5";
import { TbTemperatureSun } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import { FaBattleNet } from "react-icons/fa6";
import type {
  PHChartData,
  TemperatureChartData,
  IonicChartData,
  ChartDataPoint,
} from "@/types/sensor";

interface PumpSpeedChartData {
  PumpSpeed_Anode: number;
  PumpSpeed_Cathode: number;
  time: string;
}

interface OverviewCardsProps {
  isDarkMode: boolean;
  hydrogenData: ChartDataPoint[];
  phData: PHChartData[];
  PumpSpeedData: PumpSpeedChartData[];
  voltageData: ChartDataPoint[];
  temperatureData: TemperatureChartData[];
  humidityData: ChartDataPoint[];
  ionicData: IonicChartData[];
}

export default function OverviewCards({
  isDarkMode,
  hydrogenData,
  phData,
  PumpSpeedData,
  voltageData,
  temperatureData,
  humidityData,
  ionicData,
}: OverviewCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Get latest values from real-time data
  const latestHydrogen = hydrogenData?.[hydrogenData.length - 1]?.value ?? 0;
  const latestPH = phData?.[phData.length - 1] ?? {
    ph_Anode: 0,
    ph_Cathode: 0,
  };
  // ✅ แก้ไข: ดึงค่า PumpSpeed จาก array อย่างถูกต้อง
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

  const cards = [
    {
      icon: (
        <DiAtom className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: `${latestHydrogen.toFixed(0)} cm³`,
      label: "Hydrogen Volume",
      gradient: "from-cyan-400 to-cyan-600",
      bgGlow: isDarkMode ? "bg-cyan-500/10" : "bg-cyan-100/80",
      textColor: isDarkMode ? "text-cyan-300" : "text-cyan-700",
    },
    {
      icon: (
        <IoFlask className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Anode:
            </span>
            <span className="font-bold">
              {(latestPH?.ph_Anode ?? 0).toFixed(1)} pH
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-violet-400" : "text-violet-600"
              }`}
            >
              Cathode:
            </span>
            <span className="font-bold">
              {(latestPH?.ph_Cathode ?? 0).toFixed(1)} pH
            </span>
          </div>
        </div>
      ),
      label: "pH Levels",
      gradient: "from-blue-400 to-violet-600",
      bgGlow: isDarkMode ? "bg-blue-500/10" : "bg-blue-100/80",
      textColor: isDarkMode ? "text-blue-300" : "text-blue-700",
    },
    {
      icon: (
        <MdOutlineShutterSpeed className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-green-400" : "text-green-600"
              }`}
            >
              Anode:
            </span>
            <span className="font-bold">
              {/* ✅ แก้ไข: เปลี่ยนจาก pH เป็น RPM หรือหน่วยที่เหมาะสม */}
              {(latestPumpSpeed?.PumpSpeed_Anode ?? 0).toFixed(1)} RPM
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              Cathode:
            </span>
            <span className="font-bold">
              {/* ✅ แก้ไข: เปลี่ยนจาก pH เป็น RPM หรือหน่วยที่เหมาะสม */}
              {(latestPumpSpeed?.PumpSpeed_Cathode ?? 0).toFixed(1)} RPM
            </span>
          </div>
        </div>
      ),
      label: "Pump Speed",
      gradient: "from-emerald-400 to-emerald-600",
      bgGlow: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-100/80",
      textColor: isDarkMode ? "text-emerald-300" : "text-emerald-700",
    },
    {
      icon: (
        <IoBatteryHalfOutline className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: `${latestVoltage.toFixed(2)} V`,
      label: "Voltage",
      gradient: "from-lime-400 to-lime-600",
      bgGlow: isDarkMode ? "bg-lime-500/10" : "bg-lime-100/80",
      textColor: isDarkMode ? "text-lime-300" : "text-lime-700",
    },
    {
      icon: (
        <TbTemperatureSun className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-orange-400" : "text-orange-600"
              }`}
            >
              Anode:
            </span>
            <span className="font-bold">
              {(latestTemperature?.temperature_Anode ?? 0).toFixed(1)} °C
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              Cathode:
            </span>
            <span className="font-bold">
              {(latestTemperature?.temperature_Cathode ?? 0).toFixed(1)} °C
            </span>
          </div>
        </div>
      ),
      label: "Temperature",
      gradient: "from-orange-400 to-red-600",
      bgGlow: isDarkMode ? "bg-orange-500/10" : "bg-orange-100/80",
      textColor: isDarkMode ? "text-orange-300" : "text-orange-700",
    },
    {
      icon: (
        <WiHumidity className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: `${latestHumidity.toFixed(0)}%`,
      label: "Humidity",
      gradient: "from-purple-400 to-purple-600",
      bgGlow: isDarkMode ? "bg-purple-500/10" : "bg-purple-100/80",
      textColor: isDarkMode ? "text-purple-300" : "text-purple-700",
    },
    {
      icon: (
        <FaBattleNet className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12" />
      ),
      value: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-pink-400" : "text-pink-600"
              }`}
            >
              Anode:
            </span>
            <span className="font-bold">
              {(latestIonic?.Ionic_Anode ?? 0).toFixed(1)} mS/cm
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-rose-400" : "text-rose-600"
              }`}
            >
              Cathode:
            </span>
            <span className="font-bold">
              {(latestIonic?.Ionic_Cathode ?? 0).toFixed(1)} mS/cm
            </span>
          </div>
        </div>
      ),
      label: "Ionic Concentration",
      gradient: "from-pink-400 to-rose-600",
      bgGlow: isDarkMode ? "bg-pink-500/10" : "bg-pink-100/80",
      textColor: isDarkMode ? "text-pink-300" : "text-pink-700",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        className={`hidden md:flex absolute left-1 lg:left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 lg:p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 items-center justify-center backdrop-blur-sm ${
          isDarkMode
            ? "bg-slate-800/90 text-cyan-400 hover:bg-slate-700 border border-slate-700"
            : "bg-white/90 text-blue-600 hover:bg-blue-50 border border-blue-200"
        }`}
        aria-label="Scroll left"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-1 sm:px-2 md:px-4 py-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group/card ${
              isDarkMode
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 hover:border-slate-600"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-md"
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon with gradient background - Fixed size for all cards */}
              <div
                className={`relative p-3 sm:p-3.5 md:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-xl flex-shrink-0 transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-3`}
              >
                {card.icon}
                <div
                  className={`absolute inset-0 rounded-xl lg:rounded-2xl opacity-0 group-hover/card:opacity-30 transition-opacity duration-300 ${card.bgGlow} blur-md`}
                ></div>
              </div>

              {/* Content - Right side, aligned to top */}
              <div className="flex flex-col flex-1 min-w-0">
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 transition-colors leading-tight ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </div>
                <p
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${card.textColor}`}
                >
                  {card.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className={`hidden md:flex absolute right-1 lg:right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 lg:p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 items-center justify-center backdrop-blur-sm ${
          isDarkMode
            ? "bg-slate-800/90 text-cyan-400 hover:bg-slate-700 border border-slate-700"
            : "bg-white/90 text-blue-600 hover:bg-blue-50 border border-blue-200"
        }`}
        aria-label="Scroll right"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
