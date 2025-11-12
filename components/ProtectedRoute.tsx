"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // ✅ รอให้ auth loading เสร็จก่อน
    if (isLoading) return;

    // ✅ ถ้าไม่ authenticated ให้ redirect ไป login
    if (!isAuthenticated) {
      console.log("⚠️ Not authenticated, redirecting to login...");
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  // ✅ แสดง loading ขณะตรวจสอบ auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400"></div>
          <p className="mt-6 text-gray-300 text-lg font-medium">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  // ✅ ถ้ายังไม่ authenticated แสดง loading (กำลัง redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400"></div>
          <p className="mt-6 text-gray-300 text-lg font-medium">
            กำลังเปลี่ยนหน้า...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Authenticated - แสดง content
  return <>{children}</>;
}
