"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AuthUser } from "@/types/user";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { startTokenRefresh, stopTokenRefresh } = useTokenRefresh();

  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/auth/me`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      // Nếu bị redirect về trang login → coi như chưa đăng nhập
      if (res.redirected || res.url.includes("/api/auth/login")) {
        setUser(null);
        stopTokenRefresh();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Một số server trả 204/empty → tránh parse JSON rỗng
      const text = await res.text();
      if (!text) {
        setUser(null);
        stopTokenRefresh();
        return;
      }

      const json = JSON.parse(text);
      const payload = json?.user ?? json?.data;
      
      if (json?.success && payload) {
        setUser({
          id: payload.id ?? undefined,
          username: payload.username ?? null,
          email: (payload.email ?? "").trim() || null,
          role: payload.role ?? null,
          avatarUrl: payload.avatarUrl || null,
          bio: payload.bio || null,
        });
        startTokenRefresh();
      } else {
        setUser(null);
        stopTokenRefresh();
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUser(null);
      stopTokenRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [startTokenRefresh, stopTokenRefresh]);

  useEffect(() => {
    // Fetch user info khi component mount
    fetchUserInfo();

    // Lắng nghe event auth-changed để refresh user info
    const onAuthChanged = () => {
      fetchUserInfo();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-changed", onAuthChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-changed", onAuthChanged);
      }
      stopTokenRefresh();
    };
  }, [fetchUserInfo, stopTokenRefresh]);

  const isLoggedIn = Boolean(user?.username && user?.email);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isLoggedIn, 
        refreshUser: fetchUserInfo 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
