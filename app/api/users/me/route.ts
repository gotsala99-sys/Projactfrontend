// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// GET /api/users/me
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("👤 [API Route] Get user called");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/users/me`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    const data: User = await response.json();
    console.log("✅ [API Route] User retrieved:", data.email);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Get user error:", error);
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

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("👤 [API Route] Update profile called");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateProfileRequest = await request.json();

    if (!body.name && !body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one field required",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/users/me`;

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

    const data: User = await response.json();
    console.log("✅ [API Route] Profile updated:", data.email);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Update profile error:", error);
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
