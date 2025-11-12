// ===== types/sensor.ts (Complete Type Definitions) =====

// ✅ ข้อมูลเซ็นเซอร์หลัก — ใช้รับ/ส่งข้อมูลจาก MQTT
export interface SensorData {
  ph_Anode?: number;
  ph_Cathode?: number;
  temperature_Anode?: number;
  temperature_Cathode?: number;
  Ionic_Anode?: number;
  Ionic_Cathode?: number;
  Humidity?: number;
  hydrogen?: number;
  PumpSpeed_Anode?: number;
  PumpSpeed_Cathode?: number;
  Voltage?: number;
}

// ✅ จุดข้อมูลที่สมบูรณ์ (ใช้สำหรับ history และ display)
export interface SensorDataPoint {
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

// ✅ จุดข้อมูลสำหรับกราฟทั่วไป (ใช้กับค่าเดี่ยว เช่น humidity, voltage)
export interface ChartDataPoint {
  time: string;
  value: number;
}

// ✅ กราฟค่า pH (Cathode/Anode)
export interface PHChartData {
  ph_Anode: number;
  ph_Cathode: number;
  time: string;
}

// ✅ กราฟค่า Temperature (Cathode/Anode)
export interface TemperatureChartData {
  temperature_Anode: number;
  temperature_Cathode: number;
  time: string;
  timestamp?: number; // ✅ เพิ่มบรรทัดนี้
}

// ✅ กราฟค่า Ionic Conductivity (Cathode/Anode)
export interface IonicChartData {
  Ionic_Anode: number;
  Ionic_Cathode: number;
  time: string;
}

//PumpSpeed Chart Data
export interface PumpSpeedChartData {
  PumpSpeed_Anode: number;
  PumpSpeed_Cathode: number;
  time: string;
}
// ✅ กราฟค่า Hydrogen, PumpSpeed, Voltage, Humidity (ค่าเดี่ยว)
export interface SingleValueChartData {
  time: string;
  value: number;
}

// ✅ Date Range Query (สำหรับ API)
export interface DateRangeQuery {
  start: string;
  end: string;
}