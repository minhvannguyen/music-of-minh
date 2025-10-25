"use client";

import { useState } from "react";
import LoginModal from "@/components/auth/loginModal";
import RegisterModal from "@/components/auth/registerModal";
import ForgotPasswordModal from "@/components/auth/forgotPasswordModal";
import VerifyEmailModal from "@/components/auth/verifyEmailModal";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import ChangePasswordModal from "./changePasswordModal";

export default function AuthSection() {
  const [activeModal, setActiveModal] = useState<
    "login" | "register" | "forgot" | "verify" | "change-password" | null
  >(null);
  const [verifyEmail, setVerifyEmail] = useState<string>("");

  return (
    <>
      <div>
        <button
          onClick={() => setActiveModal("login")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 font-bold text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <LogIn size={18} /> Đăng nhập
        </button>
      </div>

      <LoginModal
        open={activeModal === "login"}
        onClose={() => setActiveModal(null)}
        onSwitchToRegister={() => setActiveModal("register")}
        onSwitchToForgot={() => setActiveModal("forgot")}
      />

      <RegisterModal
        open={activeModal === "register"}
        onClose={() => setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal("login")}
      />

      <ForgotPasswordModal
        open={activeModal === "forgot"}
        onClose={() => setActiveModal(null)}
        onOpenVerify={(email) => {
          setVerifyEmail(email);
          setActiveModal("verify");
        }}
        onSwitchToLogin={() => setActiveModal("login")}
      />

      <VerifyEmailModal
        open={activeModal === "verify"}
        onClose={() => setActiveModal(null)}
        email={verifyEmail}
        onVerified={() => {
          // Ví dụ: mở form đổi mật khẩu (một modal khác) hoặc quay về login
          setActiveModal("login");
        }}
        onSwitchToForgot={() => setActiveModal("forgot")}
      />

      <ChangePasswordModal
        open={activeModal === "change-password"}
        onClose={() => setActiveModal(null)}
        email={verifyEmail}
        onSuccess={() => setActiveModal("login")}
      />
    </>
  );
}
