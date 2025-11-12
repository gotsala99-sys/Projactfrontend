// app/api/users/me/password/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface PasswordChangeResponse {
  message: string;
}

// PATCH /api/users/me/password
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("🔐 [API Route] Change password called");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ChangePasswordRequest = await request.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password required",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/users/me/password`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const errorText = await response.text();
      throw new Error(errorText || `Backend error: ${response.status}`);
    }

    const data: PasswordChangeResponse = await response.json();
    console.log("✅ [API Route] Password changed successfully");

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
