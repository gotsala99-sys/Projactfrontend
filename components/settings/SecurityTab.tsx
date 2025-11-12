// components/settings/SecurityTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  History,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3120/api";

interface SecurityTabProps {
  isDarkMode: boolean;
}

export default function SecurityTab({ isDarkMode }: SecurityTabProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogoutAllDevices = async () => {
    if (!confirm("คุณต้องการออกจากระบบทุกอุปกรณ์ใช่หรือไม่?")) return;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: "success", text: "ออกจากระบบทุกอุปกรณ์สำเร็จ!" });

        setTimeout(() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }, 1500);
      } else {
        setMessage({ type: "error", text: "ไม่สามารถออกจากระบบได้" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์" });
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-xl p-6 md:p-8 border ${
        isDarkMode
          ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
          : "bg-white border-gray-200"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-8 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        ความปลอดภัย
      </h2>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : "bg-red-500/10 border-red-500/50 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          )}
          <span className="flex-grow">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Two-Factor Authentication */}
        <div
          className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
            isDarkMode
              ? "bg-gray-700/30 border-gray-600 hover:border-blue-500/50"
              : "bg-gray-50 border-gray-200 hover:border-blue-400/50"
          }`}
        >
          <div className="flex items-start">
            <Shield
              className={`w-6 h-6 mr-4 mt-1 flex-shrink-0 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <div>
              <h3
                className={`font-semibold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                การยืนยันตัวตนสองชั้น (2FA)
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                เพิ่มความปลอดภัยด้วยการยืนยันตัวตนแบบสองขั้นตอน
              </p>
            </div>
          </div>
          <button
            className={`px-5 py-2.5 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ml-4 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/50"
                : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-400/30"
            }`}
          >
            เปิดใช้งาน
          </button>
        </div>

        {/* Login History */}
        <div
          className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
            isDarkMode
              ? "bg-gray-700/30 border-gray-600 hover:border-gray-500"
              : "bg-gray-50 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start">
            <History
              className={`w-6 h-6 mr-4 mt-1 flex-shrink-0 ${
                isDarkMode ? "text-purple-400" : "text-purple-500"
              }`}
            />
            <div>
              <h3
                className={`font-semibold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                ประวัติการเข้าใช้งาน
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ตรวจสอบกิจกรรมและอุปกรณ์ที่เข้าใช้งานล่าสุด
              </p>
            </div>
          </div>
          <button
            className={`px-5 py-2.5 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ml-4 ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white hover:shadow-gray-400/30"
            }`}
          >
            ดูรายละเอียด
          </button>
        </div>

        {/* Logout All Devices */}
        <div
          className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
            isDarkMode
              ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
              : "bg-red-50 border-red-200 hover:border-red-400/50"
          }`}
        >
          <div className="flex items-start">
            <LogOut
              className={`w-6 h-6 mr-4 mt-1 flex-shrink-0 ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            />
            <div>
              <h3
                className={`font-semibold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                ออกจากระบบทุกอุปกรณ์
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ออกจากระบบในทุกอุปกรณ์ที่เข้าใช้งานอยู่
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutAllDevices}
            className={`px-5 py-2.5 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ml-4 ${
              isDarkMode
                ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/50"
                : "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-400/30"
            }`}
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Security Tips */}
        <div
          className={`mt-8 p-5 rounded-xl border ${
            isDarkMode
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-start">
            <AlertCircle
              className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <div>
              <h4
                className={`font-semibold mb-2 ${
                  isDarkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                เคล็ดลับความปลอดภัย
              </h4>
              <ul
                className={`text-sm space-y-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li className="flex items-start">
                  <span
                    className={`mr-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    •
                  </span>
                  <span>ใช้รหัสผ่านที่แข็งแกร่งและไม่ซ้ำกับบริการอื่น</span>
                </li>
                <li className="flex items-start">
                  <span
                    className={`mr-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    •
                  </span>
                  <span>เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน</span>
                </li>
                <li className="flex items-start">
                  <span
                    className={`mr-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    •
                  </span>
                  <span>
                    เปิดใช้งานการยืนยันตัวตนสองชั้นเพื่อความปลอดภัยสูงสุด
                  </span>
                </li>
                <li className="flex items-start">
                  <span
                    className={`mr-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  >
                    •
                  </span>
                  <span>ตรวจสอบประวัติการเข้าใช้งานเป็นประจำ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
