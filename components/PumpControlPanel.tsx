import React from "react";
import {
  Power,
  RotateCw,
  RotateCcw,
  Gauge,
  Play,
  Pause,
  Activity,
} from "lucide-react";
import type { PumpSpeedChartData } from "@/types/sensor";

interface PumpState {
  isOn: boolean;
  direction: "clockwise" | "counterclockwise";
  rpm: number;
}

interface PumpStatus {
  anode: PumpState;
  cathode: PumpState;
}

// ✅ Props Definition ที่ถูกต้อง
interface Props {
  isDarkMode: boolean;
  pumpStatus: PumpStatus; // ✅ Object แทน string
  pumpSpeedData?: PumpSpeedChartData[];
  isConnected: boolean;
  controlPump: (
    pump: "anode" | "cathode",
    isOn: boolean,
    direction?: "clockwise" | "counterclockwise",
    rpm?: number
  ) => Promise<void>;
}

const PumpControlPanel: React.FC<Props> = ({
  isDarkMode,
  pumpStatus,
  pumpSpeedData,
  isConnected,
  controlPump,
}) => {
  // ✅ ลบ local state ทิ้งหมด - ใช้จาก props แทน
  const anodeState = pumpStatus.anode;
  const cathodeState = pumpStatus.cathode;

  // ✅ Anode Controls - ส่งคำสั่งแล้วรอ backend update
  const toggleAnode = async () => {

    const targetRpm = !anodeState.isOn && anodeState.rpm === 0 ? 400 : anodeState.rpm;

    await controlPump(
      "anode",
      !anodeState.isOn,
      anodeState.direction,
      targetRpm
    );
  };

  const setAnodeDirection = async (
    direction: "clockwise" | "counterclockwise"
  ) => {
    await controlPump("anode", anodeState.isOn, direction, anodeState.rpm);
  };

  const setAnodeRPM = async (rpm: number) => {
    await controlPump("anode", anodeState.isOn, anodeState.direction, rpm);
  };

  // ✅ Cathode Controls - ส่งคำสั่งแล้วรอ backend update
  const toggleCathode = async () => {
    
    const targetRpm = !cathodeState.isOn && cathodeState.rpm === 0 ? 400 : cathodeState.rpm;

    await controlPump(
      "cathode",
      !cathodeState.isOn,
      cathodeState.direction,
      targetRpm
    );
  };

  const setCathodeDirection = async (
    direction: "clockwise" | "counterclockwise"
  ) => {
    await controlPump(
      "cathode",
      cathodeState.isOn,
      direction,
      cathodeState.rpm
    );
  };

  const setCathodeRPM = async (rpm: number) => {
    await controlPump(
      "cathode",
      cathodeState.isOn,
      cathodeState.direction,
      rpm
    );
  };

  // ✅ Global Controls
  const turnOnBoth = async () => {
    await Promise.all([
      controlPump("anode", true, anodeState.direction, anodeState.rpm),
      controlPump("cathode", true, cathodeState.direction, cathodeState.rpm),
    ]);
  };

  const turnOffBoth = async () => {
    await Promise.all([
      controlPump("anode", false, anodeState.direction, anodeState.rpm),
      controlPump("cathode", false, cathodeState.direction, cathodeState.rpm),
    ]);
  };

  const syncDirection = async () => {
    await controlPump(
      "cathode",
      cathodeState.isOn,
      anodeState.direction, // ✅ ใช้ direction จาก anode
      cathodeState.rpm
    );
  };

  const syncSpeed = async () => {
    await controlPump(
      "cathode",
      cathodeState.isOn,
      cathodeState.direction,
      anodeState.rpm // ✅ ใช้ rpm จาก anode
    );
  };

  // ✅ Render Single Pump Control
  const renderPumpControl = (
    title: string,
    state: PumpState,
    onToggle: () => void,
    onDirectionChange: (dir: "clockwise" | "counterclockwise") => void,
    onRPMChange: (rpm: number) => void,
    color: string
  ) => (
    <div
      className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
        isDarkMode
          ? `bg-gray-800/50 hover:border-${color}-500/60`
          : `bg-white hover:border-${color}-400`
      }`}
      style={{
        borderColor: isDarkMode
          ? state.isOn
            ? color === "cyan"
              ? "rgba(6, 182, 212, 0.5)"
              : "rgba(34, 197, 94, 0.5)"
            : "rgba(75, 85, 99, 0.3)"
          : state.isOn
          ? color === "cyan"
            ? "rgba(6, 182, 212, 0.3)"
            : "rgba(34, 197, 94, 0.3)"
          : "rgba(209, 213, 219, 1)",
        boxShadow: state.isOn
          ? `0 0 30px ${
              color === "cyan"
                ? "rgba(6, 182, 212, 0.3)"
                : "rgba(34, 197, 94, 0.3)"
            }`
          : "none",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-2xl font-bold tracking-wide ${
            isDarkMode
              ? color === "cyan"
                ? "text-cyan-400"
                : "text-green-400"
              : color === "cyan"
              ? "text-cyan-600"
              : "text-green-600"
          }`}
        >
          {title}
        </h3>
        <button
          onClick={onToggle}
          className={`p-3 rounded-full transition-all duration-300 ${
            state.isOn
              ? color === "cyan"
                ? "bg-cyan-500 hover:bg-cyan-600"
                : "bg-green-500 hover:bg-green-600"
              : isDarkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          } text-white shadow-lg`}
          aria-label="Toggle pump"
        >
          <Power className="w-6 h-6" />
        </button>
      </div>

      {/* Direction Controls */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-3 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Direction
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onDirectionChange("clockwise")}
            className={`p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              state.direction === "clockwise"
                ? color === "cyan"
                  ? "bg-cyan-500 text-white"
                  : "bg-green-500 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } shadow-lg`}
          >
            <RotateCw className="w-5 h-5" />
            <span>Clockwise</span>
          </button>
          <button
            onClick={() => onDirectionChange("counterclockwise")}
            className={`p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              state.direction === "counterclockwise"
                ? color === "cyan"
                  ? "bg-cyan-500 text-white"
                  : "bg-green-500 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } shadow-lg`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Counter CW</span>
          </button>
        </div>
      </div>

      {/* RPM Control */}
      <div className="space-y-4">
        <label
          className={`block text-sm font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Speed (RPM)
        </label>

        {/* Current RPM Display */}
        <div
          className={`text-center p-4 rounded-xl ${
            isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Gauge
              className={`w-5 h-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <span
              className={`text-3xl font-bold ${
                isDarkMode
                  ? color === "cyan"
                    ? "text-cyan-400"
                    : "text-green-400"
                  : color === "cyan"
                  ? "text-cyan-600"
                  : "text-green-600"
              }`}
            >
              {state.rpm}
            </span>
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              RPM
            </span>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={state.rpm}
          onChange={(e) => onRPMChange(Number(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${
              color === "cyan" ? "#06b6d4" : "#22c55e"
            } 0%, ${color === "cyan" ? "#06b6d4" : "#22c55e"} ${
              (state.rpm / 5000) * 100
            }%, ${isDarkMode ? "#374151" : "#e5e7eb"} ${
              (state.rpm / 5000) * 100
            }%, ${isDarkMode ? "#374151" : "#e5e7eb"} 100%)`,
          }}
          aria-label="Set RPM"
        />

        {/* Number Input */}
        <input
          type="number"
          min="0"
          max="5000"
          step="50"
          value={state.rpm}
          onChange={(e) => onRPMChange(Number(e.target.value))}
          className={`w-full px-4 py-3 rounded-xl font-medium text-center border-2 ${
            isDarkMode
              ? "bg-gray-700 text-white border-gray-600 focus:ring-cyan-500"
              : "bg-white text-gray-900 border-gray-300 focus:ring-cyan-500"
          } focus:outline-none focus:ring-2`}
          aria-label="Set RPM directly"
        />
      </div>

      {/* Status Indicator */}
      <div className="mt-6 flex items-center justify-between">
        <span
          className={`text-sm font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Status:
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              state.isOn
                ? color === "cyan"
                  ? "bg-cyan-500 animate-pulse"
                  : "bg-green-500 animate-pulse"
                : "bg-gray-500"
            }`}
          />
          <span
            className={`font-semibold ${
              state.isOn
                ? isDarkMode
                  ? color === "cyan"
                    ? "text-cyan-400"
                    : "text-green-400"
                  : color === "cyan"
                  ? "text-cyan-600"
                  : "text-green-600"
                : isDarkMode
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {state.isOn ? "RUNNING" : "STOPPED"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Pump Control Panel
        </h2>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span
            className={`font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Real-time Speed Monitor */}
      {pumpSpeedData && pumpSpeedData.length > 0 && (
        <div
          className={`rounded-xl p-4 border ${
            isDarkMode
              ? "bg-gray-800/50 border-blue-500/30"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span
              className={`font-semibold ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Real-time Speed Monitor
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Anode:
              </span>
              <span
                className={`ml-2 font-bold ${
                  isDarkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
              >
                {pumpSpeedData[pumpSpeedData.length - 1].PumpSpeed_Anode} RPM
              </span>
            </div>
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Cathode:
              </span>
              <span
                className={`ml-2 font-bold ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                {pumpSpeedData[pumpSpeedData.length - 1].PumpSpeed_Cathode} RPM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Pump Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPumpControl(
          "ANODE CONTROL",
          anodeState,
          toggleAnode,
          setAnodeDirection,
          setAnodeRPM,
          "cyan"
        )}
        {renderPumpControl(
          "CATHODE CONTROL",
          cathodeState,
          toggleCathode,
          setCathodeDirection,
          setCathodeRPM,
          "green"
        )}
      </div>

      {/* Global Controls */}
      <div
        className={`rounded-2xl p-6 border-2 ${
          isDarkMode
            ? "bg-gray-800/50 border-purple-500/30"
            : "bg-white border-purple-300"
        }`}
      >
        <h3
          className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? "text-purple-400" : "text-purple-600"
          }`}
        >
          GLOBAL CONTROL
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={turnOnBoth}
            className="p-4 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-5 h-5" />
            <span>Turn ON Both</span>
          </button>
          <button
            onClick={turnOffBoth}
            className="p-4 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Pause className="w-5 h-5" />
            <span>Turn OFF Both</span>
          </button>
          <button
            onClick={syncDirection}
            className="p-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCw className="w-5 h-5" />
            <span>Sync Direction</span>
          </button>
          <button
            onClick={syncSpeed}
            className="p-4 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Gauge className="w-5 h-5" />
            <span>Sync Speed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PumpControlPanel;
