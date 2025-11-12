// app/api/auth/verify/route.ts - COMPLETE FIX
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3120";

interface VerifyTokenRequest {
  token: string;
}

interface VerifyResponse {
  valid: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [API Route] Verify token called");

    // ✅ อ่าน body ครั้งเดียว พร้อม error handling
    let body: VerifyTokenRequest;

    try {
      const text = await request.text();

      if (!text || text.trim() === "") {
        console.error("❌ [API Route] Empty request body");
        return NextResponse.json({ valid: false }, { status: 400 });
      }

      body = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ [API Route] JSON parse error:", parseError);
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    if (!body || !body.token) {
      console.error("❌ [API Route] No token in request");
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const backendUrl = `${BACKEND_API_URL}/api/auth/verify`;

    console.log("📡 [API Route] Forwarding to:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.log(
        "⚠️ [API Route] Token invalid (status:",
        response.status,
        ")"
      );
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    const data: VerifyResponse = await response.json();

    console.log("✅ [API Route] Token verified:", data.valid);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [API Route] Verify error:", error);
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}
