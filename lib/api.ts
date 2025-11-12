import type { User, LoginCredentials, AuthResponse } from "@/types/auth";

const API_BASE_URL = "/api";

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // ✅ อ่าน token จาก cookies แทน localStorage
    const token =
      typeof window !== "undefined"
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1]
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    console.log("📡 API Request:", {
      url,
      method: options.method || "GET",
      hasToken: !!token,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("📡 Response:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn("⚠️ Unauthorized - clearing auth");
          if (typeof window !== "undefined") {
            // ✅ ลบ cookies
            document.cookie =
              "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          throw new Error("Unauthorized");
        }

        let errorData;
        try {
          errorData = await response.json();
          console.error("❌ API Error Response:", errorData);
        } catch {
          errorData = { message: `HTTP Error ${response.status}` };
        }

        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API Success Response:", data);

      return data;
    } catch (error) {
      console.error("❌ API Request Failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่"
        );
      }

      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("🔐 Calling login API with:", credentials.email);

    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    console.log("📦 Raw Response Structure:", response);
    console.log("👤 User:", response.user);
    console.log("🔑 Token:", response.token);
    console.log("🔄 RefreshToken:", response.refreshToken);

    return response;
  }

  async logout(): Promise<void> {
    console.log("🚪 Calling logout API...");
    return this.request<void>("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    console.log("🔄 Calling refresh token API...");
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<User> {
    console.log("👤 Calling get current user API...");
    return this.request<User>("/users/me", {
      method: "GET",
    });
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      console.log("🔍 Verifying token...");

      // ✅ ส่ง token ใน body
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      console.log("📡 Verify response status:", response.status);

      if (!response.ok) {
        console.log("❌ Token verification failed (HTTP error)");
        return false;
      }

      // ✅ ตรวจสอบว่ามี response body หรือไม่
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.log("❌ Invalid response content type");
        return false;
      }

      const data = await response.json();
      console.log("✅ Token verification result:", data);

      return data.valid === true;
    } catch (error) {
      console.log("❌ Token verification failed:", error);
      return false;
    }
  }

  async updateProfile(data: { name: string; email: string }): Promise<User> {
    console.log("👤 Updating profile...");
    return this.request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    console.log("🔐 Changing password...");
    return this.request<{ message: string }>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
