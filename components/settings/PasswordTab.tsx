// components/settings/PasswordTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3120/api";

interface PasswordTabProps {
  isDarkMode: boolean;
}

export default function PasswordTab({ isDarkMode }: PasswordTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    return {
      isValid:
        hasUpperCase &&
        hasLowerCase &&
        hasNumberOrSpecial &&
        password.length >= 8,
      requirements: {
        hasUpperCase,
        hasLowerCase,
        hasNumberOrSpecial,
        minLength: password.length >= 8,
      },
    };
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ไม่ตรงกัน" });
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงตามเงื่อนไข" });
      setIsLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({
        type: "error",
        text: "รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม",
      });
      setIsLoading(false);
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จ!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์" });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

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
        เปลี่ยนรหัสผ่าน
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

      <div className="space-y-6">
        {/* Current Password */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            รหัสผ่านปัจจุบัน
          </label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isLoading}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
            <button
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            รหัสผ่านใหม่
          </label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isLoading}
              placeholder="กรอกรหัสผ่านใหม่"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ยืนยันรหัสผ่านใหม่
          </label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isLoading}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        {newPassword && (
          <div
            className={`rounded-xl p-5 space-y-3 border ${
              isDarkMode
                ? "bg-gray-700/30 border-gray-600"
                : "bg-blue-50/50 border-blue-200"
            }`}
          >
            <p
              className={`text-sm font-semibold mb-3 flex items-center ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              เงื่อนไขรหัสผ่าน:
            </p>
            <div className="space-y-2">
              {[
                { key: "minLength", label: "ความยาวอย่างน้อย 8 ตัวอักษร" },
                { key: "hasUpperCase", label: "มีตัวพิมพ์ใหญ่ (A-Z)" },
                { key: "hasLowerCase", label: "มีตัวพิมพ์เล็ก (a-z)" },
                {
                  key: "hasNumberOrSpecial",
                  label: "มีตัวเลข (0-9) หรืออักขระพิเศษ (@#$%&*)",
                },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center text-sm transition-colors ${
                    passwordValidation.requirements[
                      key as keyof typeof passwordValidation.requirements
                    ]
                      ? "text-green-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-3 font-bold text-lg">
                    {passwordValidation.requirements[
                      key as keyof typeof passwordValidation.requirements
                    ]
                      ? "✓"
                      : "○"}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handlePasswordChange}
          disabled={
            isLoading ||
            !passwordValidation.isValid ||
            !currentPassword ||
            !confirmPassword
          }
          className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:scale-[1.02] ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/50"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:shadow-blue-400/30"
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              กำลังเปลี่ยนรหัสผ่าน...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              เปลี่ยนรหัสผ่าน
            </>
          )}
        </button>
      </div>
    </div>
  );
}
