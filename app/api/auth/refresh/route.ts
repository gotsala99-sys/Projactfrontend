// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface RefreshTokenRequest {
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface RefreshResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshTokenRequest = await request.json();

    console.log("🔄 [API Route] Refresh token called");

    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token required",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/auth/refresh`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("❌ [API Route] Refresh failed:", response.status);
      return NextResponse.json(
        {
          success: false,
          message: "Token refresh failed",
        },
        { status: response.status }
      );
    }

    const data: RefreshResponse = await response.json();

    console.log("✅ [API Route] Token refreshed");

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Refresh error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
