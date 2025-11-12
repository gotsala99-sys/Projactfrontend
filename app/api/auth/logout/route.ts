// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("🚪 [API Route] Logout called");

    if (!token) {
      console.log("⚠️ [API Route] No token provided");
      return NextResponse.json(
        {
          success: true,
          message: "Logged out (no token)",
        },
        { status: 200 }
      );
    }

    // Forward to backend
    const backendUrl = `${BACKEND_API_URL}/api/auth/logout`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn("⚠️ [API Route] Backend logout failed:", response.status);
    }

    console.log("✅ [API Route] Logout successful");

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ [API Route] Logout error:", error);

    return NextResponse.json(
      {
        success: true,
        message: "Logged out locally",
      },
      { status: 200 }
    );
  }
}