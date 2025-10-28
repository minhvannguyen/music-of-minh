"use client";

import { useEffect, useMemo, useState } from "react";
import LoginModal from "@/components/auth/loginModal";
import RegisterModal from "@/components/auth/registerModal";
import ForgotPasswordModal from "@/components/auth/forgotPasswordModal";
import VerifyEmailModal from "@/components/auth/verifyEmailModal";
import VerifyEmailRegister from "@/components/auth/verifyEmailRegister";
import {
  LogIn,
  LogOut,
  User2,
  Shield,
  CreditCard,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ChangePasswordModal from "./changePasswordModal";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/themeToggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

type UserInfo = {
  username?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

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

  const [user, setUser] = useState<UserInfo>({
    username: null,
    email: null,
    role: null,
    avatarUrl: null,
  });

  const [registerUserData, setRegisterUserData] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  const isLoggedIn = useMemo(() => {
    return user?.username && user?.email;
  }, [user?.username, user?.email]);

  const { logout } = useAuth();
  const { startTokenRefresh, stopTokenRefresh } = useTokenRefresh();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
          setUser({
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            avatarUrl: null, // You can add avatarUrl to cookies if needed
          });
          // Start token refresh when user is logged in
          startTokenRefresh();
        } else {
          setUser({
            username: null,
            email: null,
            role: null,
            avatarUrl: null,
          });
          // Stop token refresh when user is not logged in
          stopTokenRefresh();
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setUser({
          username: null,
          email: null,
          role: null,
          avatarUrl: null,
        });
        stopTokenRefresh();
      }
    };

    fetchUserInfo();

    const onAuthChanged = () => fetchUserInfo();
    
    if (typeof window !== "undefined") {
      window.addEventListener("auth-changed", onAuthChanged);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-changed", onAuthChanged);
      }
      stopTokenRefresh();
    };
  }, [startTokenRefresh, stopTokenRefresh]); // ✅ Bây giờ an toàn với useCallback

  const handleLogout = () => {
    logout();
    setActiveModal(null);
  };

  const Avatar = ({ size = 32 }: { size?: number }) => {
    const initials = user?.username?.charAt(0)?.toUpperCase() ?? "U";
    return user?.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className="rounded-10% object-cover"
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
                  <Avatar size={34} />
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
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar size={36} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {user?.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>
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
            {/* {user?.role && (
              <>
                <DropdownMenuLabel className="px-2 py-1.5 text-xs">
                  Vai trò: {user.role}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )} */}

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
