// app/api/users/me/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface UpdateAvatarRequest {
  avatar: string; // base64 encoded image
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// PATCH /api/users/me/avatar
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("🖼️ [API Route] Update avatar called");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateAvatarRequest = await request.json();

    if (!body.avatar) {
      return NextResponse.json(
        {
          success: false,
          message: "Avatar data required",
        },
        { status: 400 }
      );
    }

    // Validate base64 image format
    if (!body.avatar.startsWith("data:image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image format",
        },
        { status: 400 }
      );
    }

    // Check image size (limit to ~5MB in base64)
    if (body.avatar.length > 7000000) {
      return NextResponse.json(
        {
          success: false,
          message: "Image too large (max 5MB)",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/users/me/avatar`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 second timeout for large images
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      const errorText = await response.text();
      console.error("❌ [API Route] Backend error:", errorText);
      throw new Error(errorText || `Backend error: ${response.status}`);
    }

    const data: User = await response.json();
    console.log("✅ [API Route] Avatar updated successfully");

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Update avatar error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Request timeout - image may be too large",
        },
        { status: 408 }
      );
    }

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
