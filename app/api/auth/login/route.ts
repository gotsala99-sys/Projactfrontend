// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    console.log("🔐 [API Route] Login called:", body.email);

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendUrl = `${BACKEND_API_URL}/api/auth/login`;

    console.log("📡 [API Route] Forwarding to:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    console.log("📡 [API Route] Backend response:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API Route] Backend error:", errorText);

      return NextResponse.json(
        {
          success: false,
          message:
            response.status === 401
              ? "Invalid email or password"
              : "Login failed",
        },
        { status: response.status }
      );
    }

    const data: LoginResponse = await response.json();

    console.log("✅ [API Route] Login successful:", data.user.email);
    console.log("📦 [API Route] Response structure:", {
      hasUser: !!data.user,
      hasToken: !!data.token,
      hasRefreshToken: !!data.refreshToken,
    });

    // ✅ สำคัญมาก: ส่ง response ตรงๆ ไม่ต้อง wrap
    // Frontend จะได้ { user, token, refreshToken } ตรงๆ
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Login error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Request timeout",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
