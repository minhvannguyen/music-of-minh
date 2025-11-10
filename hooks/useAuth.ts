// hooks/useAuth.ts
"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";

// Define error type for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      // notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      return { success: true, data: response };

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

  const logout = async () => {
    try {
      setLoading(true);
      const response = await authAPI.logout();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      return { success: true, data: response };
    } catch (err: unknown) {
      console.error("Logout error:", err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Đăng xuất thất bại";
      return { success: false, message };
    }finally {
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

  const changePasswordForgot = async (email: string, newPassword: string) => {
    try {
      setLoading(true);
      const response = await authAPI.changePasswordForgot(email, newPassword);
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

  return { 
    login, 
    logout, 
    register, 
    confirmRegistration, 
    sendForgotPasswordOtp,
    confirmForgotPasswordOtp,
    changePassword,
    changePasswordForgot,
    loading 
  };
}