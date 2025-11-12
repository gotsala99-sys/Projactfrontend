// middleware.ts - อยู่ใน root ของโปรเจค (เดียวกับ app/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ตรวจสอบ token จาก cookies (ถ้ามี)
  const token = request.cookies.get('authToken')?.value;
  
  // ✅ ถ้าอยู่ที่หน้า login และมี token แล้ว -> redirect ไป dashboard
  if (pathname === '/login' && token) {
    console.log('🔄 Middleware: User has token, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // ✅ ถ้าอยู่ที่ dashboard แต่ไม่มี token -> redirect ไป login
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('🔄 Middleware: No token, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// กำหนด path ที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
  ],
};