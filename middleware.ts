import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/control-panel") ||
    request.nextUrl.pathname.startsWith("/data") ||
    request.nextUrl.pathname.startsWith("/alerts") ||
    request.nextUrl.pathname.startsWith("/maintenance") ||
    request.nextUrl.pathname.startsWith("/storage") ||
    request.nextUrl.pathname.startsWith("/settings");

  // ถ้าไม่มี token และพยายามเข้า protected route -> redirect ไป login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ถ้ามี token และอยู่หน้า login -> redirect ไป dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/control-panel/:path*",
    "/data/:path*",
    "/alerts/:path*",
    "/maintenance/:path*",
    "/storage/:path*",
    "/settings/:path*",
    "/login",
  ],
};
