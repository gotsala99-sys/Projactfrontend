// components/settings/ProfileTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3120/api";

interface ProfileTabProps {
  isDarkMode: boolean;
}

export default function ProfileTab({ isDarkMode }: ProfileTabProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(
    "/image/profile/Ellipse 1.svg"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setName(userData.name || "");
        setEmail(userData.email || "");
        if (userData.avatar) setProfileImage(userData.avatar);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อ-นามสกุล" });
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "รูปแบบอีเมลไม่ถูกต้อง" });
      setIsLoading(false);
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "อัพเดทโปรไฟล์สำเร็จ!" });

        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.name = name;
            user.email = email;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }
      } else {
        setMessage({ type: "error", text: data.message || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "ขนาดไฟล์ต้องไม่เกิน 5MB" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "กรุณาเลือกไฟล์รูปภาพ" });
      return;
    }

    try {
      setIsLoading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("authToken")
              : null;
          if (!token) throw new Error("No authentication token found");

          // Send to backend
          const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar: base64Image }),
          });

          if (response.ok) {
            setProfileImage(base64Image);
            setMessage({ type: "success", text: "อัปโหลดรูปโปรไฟล์สำเร็จ!" });

            // Update localStorage
            if (typeof window !== "undefined") {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const user = JSON.parse(storedUser);
                user.avatar = base64Image;
                localStorage.setItem("user", JSON.stringify(user));
              }
            }
          } else {
            const data = await response.json();
            setMessage({
              type: "error",
              text: data.message || "ไม่สามารถอัปโหลดรูปได้",
            });
          }
        } catch (error) {
          console.error("Upload error:", error);
          setMessage({
            type: "error",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image processing error:", error);
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการประมวลผลรูปภาพ" });
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDarkMode ? "text-blue-400" : "text-blue-500"
            }`}
          />
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

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
        ข้อมูลส่วนตัว
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

      {/* Profile Image */}
      <div className="mb-8 text-center">
        <div className="relative inline-block group">
          <div
            className={`w-32 h-32 rounded-full overflow-hidden p-1 shadow-2xl ${
              isDarkMode
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/50"
                : "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-blue-400/30"
            }`}
          >
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImage}
                alt="Profile"
                className={`w-full h-full rounded-full object-cover ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              />
            ) : (
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <User
                  className={`w-16 h-16 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </div>
            )}
          </div>
          <label
            className={`absolute bottom-0 right-0 p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:scale-110 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50"
                : "bg-blue-500 hover:bg-blue-600 hover:shadow-blue-400/30"
            }`}
          >
            <Camera className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="image upload input"
            />
          </label>
        </div>
        <p
          className={`text-sm mt-3 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          คลิกเพื่อแก้ไขรูปโปรไฟล์
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ชื่อ-นามสกุล
          </label>
          <div className="relative">
            <User
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isLoading}
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            อีเมล
          </label>
          <div className="relative">
            <Mail
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isLoading}
              placeholder="example@email.com"
            />
          </div>
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={isLoading}
          className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:scale-[1.02] ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/50"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:shadow-blue-400/30"
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              บันทึกการเปลี่ยนแปลง
            </>
          )}
        </button>
      </div>
    </div>
  );
}
