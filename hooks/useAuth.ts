// hooks/useAuth.ts
"use client";

import { useState } from "react";
import { api } from "@/lib/api";

// Define error type for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Thêm các API functions cho đăng ký và quên mật khẩu
export const authAPI = {
  // Gửi email đăng ký và nhận OTP
  register: async (email: string) => {
    const response = await api.post("/auth/SentOtpRegister", email);
    return response.data;
  },

  // Xác nhận OTP và hoàn tất đăng ký
  confirmRegistration: async (code: string, userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post(`/Verification/ConfirmOtpRegister?Code=${code}`, userData);
    return response.data;
  },

  // Gửi OTP cho quên mật khẩu
  sendForgotPasswordOtp: async (email: string) => {
    const response = await api.post("/auth/SentOtpForgotPass", email);
    return response.data;
  },

  // Xác nhận OTP cho quên mật khẩu
  confirmForgotPasswordOtp: async (email: string, code: string) => {
    const response = await api.post(`/Verification/ConfirmOtpForgotPass?Email=${encodeURIComponent(email)}&Code=${code}`);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (email: string, oldPassword: string, newPassword: string) => {
    const response = await api.post("/auth/ChangePassword", {
      email,
      oldPassword,
      newPassword
    });
    return response.data;
  }
};

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/Login", { email, password });

      const data = res.data;
      
      // Set cookies via API route
      await fetch('/api/auth/set-cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          username: data.username,
          email: data.email,
          role: data.role,
        }),
      });

      // notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      return { success: true, data };
    } catch (err: unknown) {
      console.error("Login error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Đăng nhập thất bại";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string) => {
    try {
      setLoading(true);
      const response = await authAPI.register(email);
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Register error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Email đăng ký đã được sử dụng!";
      return { 
        success: false, 
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const confirmRegistration = async (code: string, userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const response = await authAPI.confirmRegistration(code, userData);
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Confirm registration error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Xác nhận đăng ký thất bại";
      return { 
        success: false, 
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const sendForgotPasswordOtp = async (email: string) => {
    try {
      setLoading(true);
      const response = await authAPI.sendForgotPasswordOtp(email);
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Send forgot password OTP error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Gửi mã OTP thất bại";
      return { 
        success: false, 
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const confirmForgotPasswordOtp = async (email: string, code: string) => {
    try {
      setLoading(true);
      const response = await authAPI.confirmForgotPasswordOtp(email, code);
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Confirm forgot password OTP error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Xác nhận mã OTP thất bại";
      return { 
        success: false, 
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword(email, oldPassword, newPassword);
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Change password error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Đổi mật khẩu thất bại";
      return { 
        success: false, 
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear cookies via API route
      await fetch('/api/auth/clear-cookies', {
        method: 'POST',
      });

      // notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { 
    login, 
    logout, 
    register, 
    confirmRegistration, 
    sendForgotPasswordOtp,
    confirmForgotPasswordOtp,
    changePassword,
    loading 
  };
}
