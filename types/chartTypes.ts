// types/chartTypes.ts

export type ChartVariable = "pH" | "temperature" | "ionic" | "hydrogen" | "voltage" | "humidity";

export interface ChartVariableConfig {
  id: ChartVariable;
  label: string;
  unit: string;
  anode: {
    key: string;
    label: string;
    color: string;
  };
  cathode: {
    key: string;
    label: string;
    color: string;
  };
  minValue: number;
  maxValue: number;
  single?: boolean; // ค่าเดี่ยว (ไม่มี anode/cathode แยก)
}

export const CHART_VARIABLES: Record<ChartVariable, ChartVariableConfig> = {
  pH: {
    id: "pH",
    label: "Potential of Hydrogen",
    unit: "pH",
    anode: {
      key: "ph_Anode",
      label: "Anode",
      color: "#ec4899", // pink-500
    },
    cathode: {
      key: "ph_Cathode",
      label: "Cathode",
      color: "#3b82f6", // blue-500
    },
    minValue: 0,
    maxValue: 14,
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    unit: "°C",
    anode: {
      key: "temperature_Anode",
      label: "Anode",
      color: "#f97316", // orange-500
    },
    cathode: {
      key: "temperature_Cathode",
      label: "Cathode",
      color: "#06b6d4", // cyan-500
    },
    minValue: 0,
    maxValue: 100,
  },
  ionic: {
    id: "ionic",
    label: "Ionic Conductivity",
    unit: "mS/cm",
    anode: {
      key: "Ionic_Anode",
      label: "Anode",
      color: "#8b5cf6", // violet-500
    },
    cathode: {
      key: "Ionic_Cathode",
      label: "Cathode",
      color: "#10b981", // emerald-500
    },
    minValue: 0,
    maxValue: 100,
  },
  hydrogen: {
    id: "hydrogen",
    label: "Hydrogen Production",
    unit: "mL/min",
    single: true,
    anode: {
      key: "hydrogen",
      label: "Production",
      color: "#ef4444", // red-500
    },
    cathode: {
      key: "hydrogen",
      label: "Production",
      color: "#14b8a6", // teal-500 (not used for single value)
    },
    minValue: 0,
    maxValue: 1000,
  },
  voltage: {
    id: "voltage",
    label: "Voltage",
    unit: "V",
    single: true,
    anode: {
      key: "Voltage",
      label: "Voltage",
      color: "#eab308", // yellow-500
    },
    cathode: {
      key: "Voltage",
      label: "Voltage",
      color: "#6366f1", // indigo-500 (not used)
    },
    minValue: 0,
    maxValue: 5,
  },
  humidity: {
    id: "humidity",
    label: "Humidity",
    unit: "%",
    single: true,
    anode: {
      key: "Humidity",
      label: "Humidity",
      color: "#0ea5e9", // sky-500
    },
    cathode: {
      key: "Humidity",
      label: "Humidity",
      color: "#f43f5e", // rose-500 (not used)
    },
    minValue: 0,
    maxValue: 100,
  },
};