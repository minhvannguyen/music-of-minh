"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "./loginForm";
import { useTheme } from "@/contexts/themeContext";
import { useGoogleIdentity } from "@/hooks/useGoogleIdentity";
import { toast } from "sonner";
import { useRef, useEffect, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Thêm khai báo type cho window.google
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement | null, options: {
            theme?: string;
            size?: string;
            width?: string;
          }) => void; // THÊM DÒNG NÀY
        };
      };
    };
  }
}

export default function LoginModal({
  open,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}) {
  const { theme } = useTheme();

  const ready = useGoogleIdentity();
  const googleInitedRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonReady, setButtonReady] = useState(false);
  const [isLoadingGoogleAuth, setIsLoadingGoogleAuth] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset khi modal đóng
  useEffect(() => {
    if (!open) {
      googleInitedRef.current = false;
      setButtonReady(false);
      setIsLoadingGoogleAuth(false);
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
    }
  }, [open]);

  // Initialize Google SDK
  useEffect(() => {
    if (!ready || !open || googleInitedRef.current) return;
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    const google = window.google;
    if (!google?.accounts?.id) {
      console.error("Google SDK not loaded");
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: { credential?: string }) => {
          console.log("Google callback triggered:", resp);
          const idToken = resp?.credential;
          if (!idToken) {
            console.error("No credential from Google");
            return;
          }
          
          // Bắt đầu loading
          setIsLoadingGoogleAuth(true);
          
          console.log("Sending IdToken to backend...");
          try {
            const { data } = await api.post("/auth/GoogleIdToken", { IdToken: idToken });
            console.log("Backend response:", data);
            
            if (data?.success) {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-changed"));
              }
              toast.success("Đăng nhập thành công!");
              setIsLoadingGoogleAuth(false);
              onClose();
            } else {
              console.error("Backend returned error:", data?.message);
              toast.error(data?.message || "Đăng nhập thất bại!");
              setIsLoadingGoogleAuth(false);
            }
          } catch (error: unknown) {
            console.error("Google sign in error:", error);
            if (axios.isAxiosError(error)) {
              const errorData = error.response?.data;
              
              console.error("Axios error details:", {
                status: error.response?.status,
                data: errorData,
                message: error.message
              });
              
              if (errorData && typeof errorData === 'object' && 'message' in errorData) {
                toast.error(errorData.message as string);
              } else {
                toast.error("Đăng nhập thất bại!");
              }
            } else {
              toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại!");
            }
            setIsLoadingGoogleAuth(false);
          }
        },
      });
      googleInitedRef.current = true;
    } catch (error) {
      console.error("Failed to initialize Google SDK:", error);
    }
  }, [ready, open, onClose]);

  // Render button riêng biệt
  useEffect(() => {
    if (!ready || !open || buttonReady) return;
    
    // Kiểm tra buttonRef có sẵn chưa
    if (!buttonRef.current) {
      renderTimeoutRef.current = setTimeout(() => {
        if (buttonRef.current && window.google?.accounts?.id && !buttonReady) {
          try {
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: theme === "dark" ? "filled_black" : "outline",
              size: "large",
              width: "100%",
            });
            setButtonReady(true);
            console.log("✅ Google button rendered successfully");
          } catch (renderError) {
            console.error("Failed to render Google button:", renderError);
            setButtonReady(false);
          }
        }
      }, 200);
      return;
    }

    // Nếu buttonRef đã sẵn sàng, render ngay
    const google = window.google;
    if (!google?.accounts?.id) {
      return;
    }

    try {
      google.accounts.id.renderButton(buttonRef.current, {
        theme: theme === "dark" ? "filled_black" : "outline",
        size: "large",
        width: "100%",
      });
      setButtonReady(true);
      console.log("✅ Google button rendered successfully");
    } catch (renderError) {
      console.error("Failed to render Google button:", renderError);
      setButtonReady(false);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
    };
  }, [ready, open, theme, buttonReady]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-md rounded-2xl shadow-xl ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Đăng nhập
          </DialogTitle>
        </DialogHeader>

        <LoginForm open={open} onSuccess={onClose} onSwitchToForgot={onSwitchToForgot} />

        <div className="relative my-4 flex items-center">
          <span className="flex-1 border-t border-gray-300" />
          <span className="px-2 text-xs uppercase text-gray-500">Hoặc</span>
          <span className="flex-1 border-t border-gray-300" />
        </div>

        {/* Container cho Google button */}
        <div className="w-full relative" style={{ minHeight: '40px', position: 'relative' }}>
          {/* Loading overlay khi đang xử lý authentication */}
          {isLoadingGoogleAuth && (
            <div className="absolute inset-0 bg-yellow-500/20 dark:bg-yellow-500/30 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 dark:text-yellow-400" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Đang đăng nhập...
                </span>
              </div>
            </div>
          )}
          
          {/* Loading states - chỉ render khi chưa có button */}
          {!buttonReady && !isLoadingGoogleAuth && (
            <div className="flex items-center justify-center py-2 text-sm text-gray-500">
              {!ready ? "Đang tải Google SDK..." : "Đang tải nút Google..."}
            </div>
          )}
          
          {/* Container cho Google SDK - luôn tồn tại nhưng ẩn khi đang loading */}
          <div 
            ref={buttonRef} 
            className={buttonReady && !isLoadingGoogleAuth ? "w-full" : "hidden"}
            style={{ 
              display: buttonReady && !isLoadingGoogleAuth ? 'block' : 'none',
              opacity: isLoadingGoogleAuth ? 0.5 : 1,
              pointerEvents: isLoadingGoogleAuth ? 'none' : 'auto'
            }}
          />
        </div>

        <p
          className={`text-center text-sm mt-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            disabled={isLoadingGoogleAuth}
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            } ${isLoadingGoogleAuth ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Đăng ký
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
