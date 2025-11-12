// app/api/sensor/history/route.ts - COMPLETE FIX
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface SensorDataPoint {
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

interface BackendResponse {
  success: boolean;
  count: number;
  dataPoints?: number;
  gaps?: number;
  range?: {
    start: string;
    end: string;
    intervalMinutes: number;
    duration: string;
  };
  data: SensorDataPoint[];
}

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ✅ GET /api/sensor/history (with or without date range)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const interval = searchParams.get("interval") || "1";

    // ✅ Get auth token from cookies
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      console.error("❌ No auth token found");
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Please login first",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    console.log("🔑 Auth token found:", token.substring(0, 20) + "...");

    let backendUrl: string;
    let needsDateRange = false;

    // ✅ Determine which endpoint to call
    if (start && end) {
      // Has date range - use /range endpoint
      needsDateRange = true;

      // Validate dates
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date format. Use ISO 8601 format",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      if (startDate > endDate) {
        return NextResponse.json(
          {
            success: false,
            message: "Start date must be before end date",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      backendUrl = `${BACKEND_API_URL}/api/sensor/history/range?start=${start}&end=${end}&interval=${interval}`;
    } else {
      // No date range - get recent history
      // ✅ FIX: Use /api prefix for NestJS backend
      backendUrl = `${BACKEND_API_URL}/api/sensor/history`;
    }

    console.log("📡 Fetching from:", backendUrl);

    // ✅ Forward request to backend with auth header
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    console.log("📡 Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText);

      // ✅ Handle auth errors
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication failed. Please login again.",
          },
          { status: 401, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Backend error: ${response.status}`,
          details: errorText,
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data: BackendResponse = await response.json();

    console.log(`✅ Retrieved ${data.count || data.data?.length || 0} records`);

    // ✅ Return data (without metadata if not date range query)
    if (needsDateRange && start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const rangeMs = endDate.getTime() - startDate.getTime();
      const rangeHours = rangeMs / (1000 * 60 * 60);
      const intervalNum = parseInt(interval, 10);
      const estimatedPoints = Math.ceil(rangeMs / (intervalNum * 60 * 1000));

      return NextResponse.json(
        {
          ...data,
          metadata: {
            requestTime: new Date().toISOString(),
            rangeHours: rangeHours.toFixed(2),
            estimatedPoints,
            actualPoints: data.count || data.data?.length || 0,
          },
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // ✅ For recent history, return simple array
    return NextResponse.json(data.data || data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ API Error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout",
          },
          { status: 408, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ POST for complex queries
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { start, end, interval = 1, metrics = [] } = body;

    if (!start || !end) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: start and end",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/sensor/history/range?start=${start}&end=${end}&interval=${interval}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const responseData: BackendResponse = await response.json();

    // Filter by metrics if specified
    if (Array.isArray(metrics) && metrics.length > 0 && responseData.data) {
      const filteredData = responseData.data.map((point) => {
        const filtered: Partial<SensorDataPoint> & {
          time: string;
          timestamp: number;
        } = {
          time: point.time,
          timestamp: point.timestamp,
        };

        metrics.forEach((metric: string) => {
          if (metric in point) {
            const key = metric as keyof SensorDataPoint;
            filtered[key] = point[key] as never;
          }
        });

        return filtered;
      });

      return NextResponse.json(
        {
          ...responseData,
          data: filteredData,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ POST API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
