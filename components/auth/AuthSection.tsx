"use client";

import { useState } from "react";
import LoginModal from "@/components/auth/loginModal";
import RegisterModal from "@/components/auth/registerModal";
import ForgotPasswordModal from "@/components/auth/forgotPasswordModal";
import VerifyEmailModal from "@/components/auth/verifyEmailModal";
import VerifyEmailRegister from "@/components/auth/verifyEmailRegister";
import {
  LogIn,
  LogOut,
  Sparkles,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import ChangePasswordModal from "./changePasswordModal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/authContext";
import ThemeToggle from "@/components/themeToggle";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function AuthSection() {
  const [activeModal, setActiveModal] = useState<
    | "login"
    | "register"
    | "forgot"
    | "verify"
    | "verify-register"
    | "change-password"
    | null
  >(null);
  const [verifyEmail, setVerifyEmail] = useState<string>("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");

  const [registerUserData, setRegisterUserData] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  const { user, isLoggedIn, refreshUser } = useAuthContext();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setActiveModal(null);
    // Context sẽ tự động cập nhật khi nhận event "auth-changed"
  };

  const Avatar = ({ size = 36 }: { size?: number }) => {
    if (!user) return null;
    
    const initials = user.username?.charAt(0)?.toUpperCase() ?? "U";
    
    // Chuyển đổi relative path thành full URL
    const getAvatarUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
      
      // Nếu đã là full URL (http/https), giữ nguyên
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      
      // Nếu là relative path, thêm API base URL
      if (url.startsWith("/")) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        // Loại bỏ trailing slash từ apiBaseUrl nếu có
        const baseUrl = apiBaseUrl.replace(/\/$/, "");
        return `${baseUrl}${url}`;
      }
      
      return url;
    };
    
    const avatarUrl = getAvatarUrl(user.avatarUrl);
    
    return avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className="rounded-lg object-cover"
        onError={(e) => {
          // Nếu ảnh load lỗi, ẩn ảnh và hiển thị placeholder
          e.currentTarget.style.display = 'none';
        }}
      />
    ) : (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-yellow-500 text-white flex items-center justify-center text-sm font-bold"
      >
        {initials}
      </div>
    );
  };

  return (
    <>
      {!isLoggedIn ? (
        <div>
          <button
            onClick={() => setActiveModal("login")}
            className="w-full bg-yellow-500 hover:bg-yellow-600 font-bold text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Đăng nhập
          </button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-2 bg-muted hover:bg-muted transition group">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <Avatar size={36} />
                </div>
                <div className="min-w-0 text-left flex-1">
                  <div className="text-sm font-semibold truncate">
                    {user?.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
              <ChevronRight
                className="text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:rotate-90"
                size={16}
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64"
            sideOffset={8}
            side="right"
            align="end"
          >
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-3 px-2 py-2 w-full hover:bg-accent rounded-md transition-colors cursor-pointer"
            >
              <Avatar size={36} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {user?.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </button>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <button className="w-full font-medium flex items-center gap-3 ml-3">
                <Sparkles className="text-yellow-500" />
                <span>Nâng cấp Pro</span>
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <button className="w-full font-medium flex items-center gap-3 ml-3">
                <CreditCard />
                <span>Thanh toán</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Theme Toggle */}
            <div className="px-2 py-1.5">
              <ThemeToggle />
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-red-600"
              >
                <LogOut />
                <span>Đăng xuất</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
        onOpenVerify={(email, userData) => {
          setVerifyEmail(email);
          setRegisterUserData(userData);
          setActiveModal("verify-register");
        }}
      />
      
      {/* Modal xác thực OTP khi đăng ký */}
      {registerUserData && (
        <VerifyEmailRegister
          open={activeModal === "verify-register"}
          onClose={() => setActiveModal(null)}
          email={verifyEmail}
          userData={registerUserData}
          onVerified={() => {
            // OTP đúng → quay về màn đăng nhập
            setActiveModal("login");
            setVerifyEmail("");
            setRegisterUserData(null);
            refreshUser(); // Refresh user info sau khi verify thành công
          }}
          onSwitchToForgot={() => setActiveModal("register")}
        />
      )}

      <ForgotPasswordModal
        open={activeModal === "forgot"}
        onClose={() => setActiveModal(null)}
        onOpenVerify={(email) => {
          setForgotPasswordEmail(email);
          setActiveModal("verify");
        }}
        onSwitchToLogin={() => setActiveModal("login")}
      />

      <VerifyEmailModal
        open={activeModal === "verify"}
        onClose={() => setActiveModal(null)}
        email={forgotPasswordEmail}
        onVerified={() => {
          setActiveModal("change-password");
        }}
        onSwitchToForgot={() => setActiveModal("forgot")}
      />

      <ChangePasswordModal
        open={activeModal === "change-password"}
        onClose={() => setActiveModal(null)}
        email={forgotPasswordEmail}
        onSuccess={() => {
          setActiveModal("login");
          setForgotPasswordEmail("");
        }}
      />
    </>
  );
}
