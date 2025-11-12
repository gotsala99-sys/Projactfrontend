// contexts/AuthContext.tsx - USE COOKIES
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "@/lib/api";
import type { User, LoginCredentials, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Helper functions สำหรับ cookies
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift()!);
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // ✅ ใช้ cookies แทน localStorage
        const savedToken = getCookie("authToken");
        const savedUserStr = getCookie("user");

        console.log("🔍 Init Auth:", {
          hasToken: !!savedToken,
          hasUser: !!savedUserStr,
        });

        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);

          if (isMounted) {
            setToken(savedToken);
            setUser(parsedUser);
            console.log("✅ Auth restored from cookies:", parsedUser.email);
          }
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        if (isMounted) {
          deleteCookie("authToken");
          deleteCookie("user");
          deleteCookie("refreshToken");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("✅ Auth initialization complete");
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log("🔐 Login attempt:", credentials.email);
      const response = await apiService.login(credentials);

      if (!response.user || !response.token) {
        throw new Error("Invalid response from server");
      }

      // ✅ บันทึกใน cookies
      setCookie("authToken", response.token);
      setCookie("user", JSON.stringify(response.user));
      if (response.refreshToken) {
        setCookie("refreshToken", response.refreshToken);
      }

      // ✅ อัพเดท state
      setUser(response.user);
      setToken(response.token);

      console.log("✅ Login successful:", response.user.email);
    } catch (error) {
      console.error("❌ Login error:", error);
      setUser(null);
      setToken(null);
      deleteCookie("authToken");
      deleteCookie("user");
      deleteCookie("refreshToken");
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out");
    setUser(null);
    setToken(null);
    deleteCookie("authToken");
    deleteCookie("user");
    deleteCookie("refreshToken");
    apiService.logout().catch(console.error);
  };

  const refreshToken = async () => {
    try {
      const savedRefreshToken = getCookie("refreshToken");
      if (!savedRefreshToken) throw new Error("No refresh token");

      const response = await apiService.refreshToken(savedRefreshToken);

      setUser(response.user);
      setToken(response.token);
      setCookie("authToken", response.token);
      setCookie("user", JSON.stringify(response.user));
      if (response.refreshToken) {
        setCookie("refreshToken", response.refreshToken);
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
