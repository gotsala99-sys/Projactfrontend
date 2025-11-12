// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
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

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    console.log("📝 [API Route] Register called:", body.email);

    // Validate input
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and name are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!body.email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendUrl = `${BACKEND_API_URL}/api/auth/register`;

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

      let errorMessage = "Registration failed";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default message if can't parse
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: response.status }
      );
    }

    const data: RegisterResponse = await response.json();

    console.log("✅ [API Route] Registration successful:", data.user.email);
    console.log("📦 [API Route] Response structure:", {
      hasUser: !!data.user,
      hasToken: !!data.token,
      hasRefreshToken: !!data.refreshToken,
    });

    // Return response directly (same structure as login)
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("❌ [API Route] Register error:", error);

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