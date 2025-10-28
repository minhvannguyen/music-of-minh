"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "./loginForm";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/themeContext";

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

        <LoginForm onSuccess={onClose} onSwitchToForgot={onSwitchToForgot} />

        <div className="relative my-4 flex items-center">
          <span className="flex-1 border-t border-gray-300" />
          <span className="px-2 text-xs uppercase text-gray-500">Hoặc</span>
          <span className="flex-1 border-t border-gray-300" />
        </div>

        <Button
          variant="outline"
          className={`w-full ${
            theme === "dark"
              ? "border-gray-700 hover:bg-gray-800 text-gray-200"
              : "border-gray-300 hover:bg-gray-100 text-gray-800"
          }`}
        >
          Đăng nhập bằng Google
        </Button>

        <p
          className={`text-center text-sm mt-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Đăng ký
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
