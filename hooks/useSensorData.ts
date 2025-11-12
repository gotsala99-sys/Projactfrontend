// hooks/useSensorData.ts - FIXED VERSION
import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type {
  PHChartData,
  TemperatureChartData,
  IonicChartData,
  ChartDataPoint,
  PumpSpeedChartData,
} from "@/types/sensor";
import type { Socket } from "socket.io-client";

// ✅ จำกัดจำนวนข้อมูลที่แสดงในกราฟ
const MAX_DATA_POINTS = 100; // ✅ เปลี่ยนจาก 1000 เป็น 100

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

interface SensorUpdatePayload {
  ph: { anode: number; cathode: number };
  temperature: { anode: number; cathode: number };
  ionic: { anode: number; cathode: number };
  humidity: number;
  hydrogen: number;
  voltage: number;
  time: string;
}

interface PumpState {
  isOn: boolean;
  direction: "clockwise" | "counterclockwise";
  rpm: number;
}

interface PumpStatus {
  anode: PumpState;
  cathode: PumpState;
}

interface PumpStatusUpdatePayload {
  pump: "anode" | "cathode";
  status: PumpState;
}

interface PumpSpeedRealtimePayload {
  PumpSpeed_Anode: number;
  PumpSpeed_Cathode: number;
  time: string;
  timestamp: number;
}

const isErrorWithName = (
  error: unknown
): error is { name: string; message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as { name: unknown }).name === "string"
  );
};

export const useSensorData = () => {
  const [phData, setPhData] = useState<PHChartData[]>([]);
  const [temperatureData, setTemperatureData] = useState<
    TemperatureChartData[]
  >([]);
  const [ionicData, setIonicData] = useState<IonicChartData[]>([]);
  const [humidityData, setHumidityData] = useState<ChartDataPoint[]>([]);
  const [hydrogenData, setHydrogenData] = useState<ChartDataPoint[]>([]);
  const [voltageData, setVoltageData] = useState<ChartDataPoint[]>([]);
  const [PumpSpeedData, setPumpSpeedData] = useState<PumpSpeedChartData[]>([]);
  const [historicalData, setHistoricalData] = useState<SensorHistoryPoint[]>(
    []
  );

  const [pumpStatus, setPumpStatus] = useState<PumpStatus>({
    anode: { isOn: false, direction: "clockwise", rpm: 0 },
    cathode: { isOn: false, direction: "clockwise", rpm: 0 },
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const isInitialized = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchParams = useRef<string>("");

  /**
   * ✅ Load history by date range (via Next.js API route)
   */
  const loadHistoryByDateRange = useCallback(
    async (
      startDate: string,
      endDate: string,
      intervalMinutes: number = 1
    ): Promise<SensorHistoryPoint[]> => {
      const cacheKey = `${startDate}-${endDate}-${intervalMinutes}`;

      if (lastFetchParams.current === cacheKey && historicalData.length > 0) {
        console.log("⚡ Using cached historical data");
        return historicalData;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      if (isMounted.current) setIsHistoryLoading(true);

      try {
        const url = `/api/sensor/history?start=${startDate}&end=${endDate}&interval=${intervalMinutes}`;

        console.log("🚀 Fetching historical data:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          credentials: "include",
        });

        if (!response.ok) {
          console.warn(`⚠️ API returned status ${response.status}`);
          let errorMessage = `HTTP error ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error("❌ Error:", errorMessage);
          } catch {
            console.error("❌ Failed to parse error response");
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        let data: SensorHistoryPoint[];

        if (result.success && result.data) {
          data = result.data;
          console.log(
            `✅ Loaded ${result.count} historical records (interval: ${intervalMinutes}min)`
          );
        } else if (Array.isArray(result)) {
          data = result;
          console.log(`✅ Loaded ${data.length} historical records`);
        } else {
          console.warn("⚠️ Invalid response format");
          throw new Error("Invalid response format from server");
        }

        if (!Array.isArray(data)) {
          console.warn("⚠️ Data is not an array");
          throw new Error("Expected array of sensor data");
        }

        if (isMounted.current) {
          setHistoricalData(data);
          lastFetchParams.current = cacheKey;
          console.log(`📊 Historical data updated: ${data.length} points`);
        }

        return data;
      } catch (error: unknown) {
        if (isErrorWithName(error) && error.name === "AbortError") {
          console.log("ℹ️ Historical data request cancelled");
          return [];
        }

        console.error("❌ Error loading historical data:", error);

        if (isMounted.current) {
          setHistoricalData([]);
        }

        throw error;
      } finally {
        if (isMounted.current) setIsHistoryLoading(false);
      }
    },
    [historicalData]
  );

  /**
   * ✅ Load initial recent history (via Next.js API route)
   * 🔥 แก้ไข: จำกัดจำนวนข้อมูลที่โหลดครั้งแรก
   */
  const loadInitialHistory = useCallback(async () => {
    try {
      setIsLoading(true);

      console.log("🔄 Loading initial history...");

      const response = await fetch("/api/sensor/history", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        console.warn(`⚠️ API returned status ${response.status}`);

        if (response.status === 401) {
          console.log("⚠️ Not authenticated, skipping history load");
          return;
        }

        return;
      }

      const history: SensorHistoryPoint[] = await response.json();

      if (!Array.isArray(history)) {
        console.warn("⚠️ Invalid response format");
        return;
      }

      if (!isMounted.current) return;

      // ✅ จำกัดข้อมูลที่โหลดครั้งแรกเป็น MAX_DATA_POINTS จุด
      const limitedHistory = history.slice(-MAX_DATA_POINTS);

      // ✅ Initialize real-time data streams
      const phHistory: PHChartData[] = [];
      const tempHistory: TemperatureChartData[] = [];
      const ionicHistory: IonicChartData[] = [];
      const humidityHistory: ChartDataPoint[] = [];
      const hydrogenHistory: ChartDataPoint[] = [];
      const voltageHistory: ChartDataPoint[] = [];
      const pumpSpeedHistory: PumpSpeedChartData[] = [];

      limitedHistory.forEach((point) => {
        if (point.ph_Anode !== null && point.ph_Cathode !== null) {
          phHistory.push({
            ph_Anode: point.ph_Anode,
            ph_Cathode: point.ph_Cathode,
            time: point.time,
          });
        }

        if (
          point.temperature_Anode !== null &&
          point.temperature_Cathode !== null
        ) {
          tempHistory.push({
            temperature_Anode: point.temperature_Anode,
            temperature_Cathode: point.temperature_Cathode,
            time: point.time,
            timestamp: point.timestamp,
          });
        }

        if (point.Ionic_Anode !== null && point.Ionic_Cathode !== null) {
          ionicHistory.push({
            Ionic_Anode: point.Ionic_Anode,
            Ionic_Cathode: point.Ionic_Cathode,
            time: point.time,
          });
        }

        if (point.Humidity !== null) {
          humidityHistory.push({ time: point.time, value: point.Humidity });
        }

        if (point.hydrogen !== null) {
          hydrogenHistory.push({ time: point.time, value: point.hydrogen });
        }

        if (point.Voltage !== null) {
          voltageHistory.push({ time: point.time, value: point.Voltage });
        }

        if (
          point.PumpSpeed_Anode !== null &&
          point.PumpSpeed_Cathode !== null
        ) {
          pumpSpeedHistory.push({
            PumpSpeed_Anode: point.PumpSpeed_Anode,
            PumpSpeed_Cathode: point.PumpSpeed_Cathode,
            time: point.time,
          });
        }
      });

      setPhData(phHistory);
      setTemperatureData(tempHistory);
      setIonicData(ionicHistory);
      setHumidityData(humidityHistory);
      setHydrogenData(hydrogenHistory);
      setVoltageData(voltageHistory);
      setPumpSpeedData(pumpSpeedHistory);

      console.log(
        "✅ Initial history loaded:",
        limitedHistory.length,
        "points (limited to",
        MAX_DATA_POINTS,
        ")"
      );
    } catch (error) {
      console.error("❌ Error loading initial history:", error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  /**
   * ✅ Setup WebSocket listeners
   */
  const setupSocketListeners = useCallback((socket: Socket) => {
    console.log("🎧 Setting up socket listeners...");

    const handleConnect = () => {
      if (isMounted.current) {
        setIsConnected(true);
        console.log("✅ Socket connected");
        socket.emit("requestPumpStatus");
      }
    };

    const handleDisconnect = () => {
      if (isMounted.current) {
        setIsConnected(false);
        console.log("❌ Socket disconnected");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (isMounted.current) {
      setIsConnected(socket.connected);
      if (socket.connected) {
        socket.emit("requestPumpStatus");
      }
    }

    socket.on("sensorUpdate", (data: SensorUpdatePayload) => {
      if (!isMounted.current) return;

      const time = data.time || new Date().toLocaleTimeString();
      const timestamp = Date.now();

      // ✅ เพิ่มข้อมูลใหม่และจำกัดที่ MAX_DATA_POINTS
      setPhData((prev) => {
        const updated = [
          ...prev,
          {
            ph_Anode: data.ph.anode,
            ph_Cathode: data.ph.cathode,
            time,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });

      setTemperatureData((prev) => {
        const updated = [
          ...prev,
          {
            temperature_Anode: data.temperature.anode,
            temperature_Cathode: data.temperature.cathode,
            time,
            timestamp,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });

      setIonicData((prev) => {
        const updated = [
          ...prev,
          {
            Ionic_Anode: data.ionic.anode,
            Ionic_Cathode: data.ionic.cathode,
            time,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });

      setHumidityData((prev) => {
        const updated = [...prev, { time, value: data.humidity }];
        return updated.slice(-MAX_DATA_POINTS);
      });

      setHydrogenData((prev) => {
        const updated = [...prev, { time, value: data.hydrogen }];
        return updated.slice(-MAX_DATA_POINTS);
      });

      setVoltageData((prev) => {
        const updated = [...prev, { time, value: data.voltage }];
        return updated.slice(-MAX_DATA_POINTS);
      });
    });

    socket.on("pumpStatusUpdate", (data: PumpStatusUpdatePayload) => {
      if (!isMounted.current) return;

      setPumpStatus((prev) => ({
        ...prev,
        [data.pump]: data.status,
      }));

      setPumpSpeedData((prev) => {
        const time = new Date().toLocaleTimeString();
        const currentData = prev[prev.length - 1] || {
          PumpSpeed_Anode: 0,
          PumpSpeed_Cathode: 0,
          time,
        };

        const updated = [
          ...prev,
          {
            PumpSpeed_Anode:
              data.pump === "anode"
                ? data.status.rpm
                : currentData.PumpSpeed_Anode,
            PumpSpeed_Cathode:
              data.pump === "cathode"
                ? data.status.rpm
                : currentData.PumpSpeed_Cathode,
            time,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });
    });

    socket.on("pumpSpeedRealtime", (data: PumpSpeedRealtimePayload) => {
      if (!isMounted.current) return;

      setPumpSpeedData((prev) => {
        const updated = [
          ...prev,
          {
            PumpSpeed_Anode: data.PumpSpeed_Anode,
            PumpSpeed_Cathode: data.PumpSpeed_Cathode,
            time: data.time,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });
    });

    socket.on("pumpStatusSync", (data: PumpStatus) => {
      if (!isMounted.current) return;

      setPumpStatus(data);

      setPumpSpeedData((prev) => {
        const time = new Date().toLocaleTimeString();
        const updated = [
          ...prev,
          {
            PumpSpeed_Anode: data.anode.rpm,
            PumpSpeed_Cathode: data.cathode.rpm,
            time,
          },
        ];
        return updated.slice(-MAX_DATA_POINTS);
      });
    });

    socket.on(
      "pumpControlAck",
      (ack: { status: string; pump: string; data: unknown }) => {
        if (!isMounted.current) return;
        console.log("✅ Pump control acknowledged:", ack);
      }
    );

    socket.on("pumpControlError", (error: { error: string }) => {
      if (!isMounted.current) return;
      console.error("❌ Pump control error:", error);
    });

    socket.on(
      "emergencyStop",
      (data: { message: string; timestamp: string }) => {
        if (!isMounted.current) return;

        setPumpStatus({
          anode: { isOn: false, direction: "clockwise", rpm: 0 },
          cathode: { isOn: false, direction: "clockwise", rpm: 0 },
        });

        setPumpSpeedData((prev) => {
          const time = new Date().toLocaleTimeString();
          const updated = [
            ...prev,
            {
              PumpSpeed_Anode: 0,
              PumpSpeed_Cathode: 0,
              time,
            },
          ];
          return updated.slice(-MAX_DATA_POINTS);
        });
      }
    );

    return { handleConnect, handleDisconnect };
  }, []);

  /**
   * ✅ Initialize socket connection
   */
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;
    isMounted.current = true;

    let handlers: ReturnType<typeof setupSocketListeners> | null = null;

    const initializeSocket = async () => {
      try {
        await loadInitialHistory();
        const socket = await getSocket();
        socketRef.current = socket;
        handlers = setupSocketListeners(socket);
        console.log("✅ Socket initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize socket:", error);
        if (isMounted.current) setIsLoading(false);
      }
    };

    void initializeSocket();

    return () => {
      isMounted.current = false;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const socket = socketRef.current;
      if (!socket) return;

      if (handlers) {
        socket.off("connect", handlers.handleConnect);
        socket.off("disconnect", handlers.handleDisconnect);
      }

      socket.off("sensorUpdate");
      socket.off("pumpStatusUpdate");
      socket.off("pumpSpeedRealtime");
      socket.off("pumpStatusSync");
      socket.off("pumpControlAck");
      socket.off("pumpControlError");
      socket.off("emergencyStop");
    };
  }, [loadInitialHistory, setupSocketListeners]);

  /**
   * ✅ Pump control function
   */
  const controlPump = useCallback(
    async (
      pump: "anode" | "cathode",
      isOn: boolean,
      direction: "clockwise" | "counterclockwise" = "clockwise",
      rpm: number = 400
    ) => {
      try {
        const socket = socketRef.current || (await getSocket());

        const actualRpm = isOn ? rpm : 0;
        const command = { pump, isOn, direction, rpm: actualRpm };

        socket.emit("pumpControl", command);

        setPumpStatus((prev) => ({
          ...prev,
          [pump]: { isOn, direction, rpm: actualRpm },
        }));

        setPumpSpeedData((prev) => {
          const time = new Date().toLocaleTimeString();
          const currentData = prev[prev.length - 1] || {
            PumpSpeed_Anode: 0,
            PumpSpeed_Cathode: 0,
            time,
          };

          const updated = [
            ...prev,
            {
              PumpSpeed_Anode:
                pump === "anode" ? actualRpm : currentData.PumpSpeed_Anode,
              PumpSpeed_Cathode:
                pump === "cathode" ? actualRpm : currentData.PumpSpeed_Cathode,
              time,
            },
          ];
          return updated.slice(-MAX_DATA_POINTS);
        });
      } catch (error) {
        console.error("❌ Pump control failed:", error);
        throw error;
      }
    },
    []
  );

  return {
    phData,
    temperatureData,
    ionicData,
    humidityData,
    hydrogenData,
    voltageData,
    PumpSpeedData,
    historicalData,
    pumpStatus,
    isConnected,
    isLoading,
    isHistoryLoading,
    controlPump,
    loadHistoryByDateRange,
  };
};
