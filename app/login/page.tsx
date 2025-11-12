"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL = "/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (token) {
        console.log("✅ Already authenticated, redirecting...");
        window.location.href = "/dashboard";
      }
    };

    checkAuth();
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage(null);

    if (!validateEmail(loginEmail)) {
      setMessage({ type: "error", text: "รูปแบบอีเมลไม่ถูกต้อง" });
      setIsLoading(false);
      return;
    }

    if (!loginPassword) {
      setMessage({ type: "error", text: "กรุณากรอกรหัสผ่าน" });
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Starting login process...");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      const data = await response.json();
      console.log("✅ Login successful:", data);

      // Store in cookies (same as your original code)
      if (data.token) {
        document.cookie = `authToken=${data.token}; path=/; max-age=${
          rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        }; SameSite=Lax`;
      }

      if (data.user) {
        document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=${
          rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        }; SameSite=Lax`;
      }

      if (data.refreshToken) {
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${
          30 * 24 * 60 * 60
        }; SameSite=Lax`;
      }

      // Also store in localStorage for compatibility
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      setMessage({ type: "success", text: "เข้าสู่ระบบสำเร็จ!" });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "เข้าสู่ระบบไม่สำเร็จ";

      if (error instanceof Error) {
        if (
          error.message.includes("Unauthorized") ||
          error.message.includes("401")
        ) {
          errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        } else if (error.message.includes("fetch")) {
          errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์";
        } else {
          errorMessage = error.message;
        }
      }

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage(null);

    if (!registerName.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อ-นามสกุล" });
      setIsLoading(false);
      return;
    }

    if (!validateEmail(registerEmail)) {
      setMessage({ type: "error", text: "รูปแบบอีเมลไม่ถูกต้อง" });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(registerPassword)) {
      setMessage({
        type: "error",
        text: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขหรืออักขระพิเศษ",
      });
      setIsLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      setIsLoading(false);
      return;
    }

    try {
      console.log("📝 Starting registration process...");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ลงทะเบียนไม่สำเร็จ");
      }

      const data = await response.json();
      console.log("✅ Registration successful:", data);

      setMessage({
        type: "success",
        text: "ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...",
      });

      // Auto login after registration
      setTimeout(() => {
        setLoginEmail(registerEmail);
        setLoginPassword(registerPassword);
        setIsLogin(true);
        setMessage(null);
        setTimeout(handleLogin, 500);
      }, 1500);
    } catch (error) {
      console.error("❌ Registration error:", error);

      let errorMessage = "ลงทะเบียนไม่สำเร็จ";

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage = "อีเมลนี้มีผู้ใช้งานแล้ว";
        } else if (error.message.includes("fetch")) {
          errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์";
        } else {
          errorMessage = error.message;
        }
      }

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !isLoading) {
      action();
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-60 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Welcome Section */}
        <div className="text-white space-y-6 px-8 hidden lg:block animate-fade-in">
          <div className="space-y-4">
            <div className="inline-block">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold leading-tight">
              ยินดีต้อนรับ
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                สู่ระบบของเรา
              </span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              จัดการข้อมูลและเข้าถึงฟีเจอร์ต่างๆ ได้อย่างสะดวกสบาย ปลอดภัย
              และรวดเร็ว
            </p>
          </div>

          <div className="space-y-4 pt-8">
            {[
              "ระบบรักษาความปลอดภัยสูง",
              "เข้าถึงได้ทุกที่ทุกเวลา",
              "อินเทอร์เฟซที่ใช้งานง่าย",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 animate-slide-right"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-blue-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h2>
              <p className="text-blue-100">
                {isLogin
                  ? "ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบ"
                  : "สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน"}
              </p>
            </div>

            {/* Message Alert */}
            {message && (
              <div className="mx-8 mt-6">
                <div
                  className={`p-4 rounded-xl flex items-center animate-slide-down ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="p-8">
              {isLogin ? (
                // Login Form
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="example@email.com"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="••••••••"
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        จดจำฉันไว้
                      </span>
                    </label>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      ลืมรหัสผ่าน?
                    </button>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        เข้าสู่ระบบ
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Register Form
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="กรอกชื่อ-นามสกุล"
                        disabled={isLoading}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="example@email.com"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="••••••••"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      อย่างน้อย 8 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ยืนยันรหัสผ่าน
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
                        placeholder="••••••••"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        กำลังสมัครสมาชิก...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        สมัครสมาชิก
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Switch Mode */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
                  <button
                    type="button"
                    onClick={switchMode}
                    disabled={isLoading}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center group disabled:opacity-50"
                  >
                    {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Welcome Text */}
          <div className="lg:hidden text-center mt-8 text-white space-y-2">
            <p className="text-sm text-blue-100">
              ระบบรักษาความปลอดภัยสูง | เข้าถึงได้ทุกที่ทุกเวลา
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
