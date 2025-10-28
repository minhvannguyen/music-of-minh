"use client";
import {
  Home,
  Compass,
  User,
  PlusSquare,
  MoreHorizontal,
  Album,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/contexts/themeContext";
import AuthSection from "./auth/AuthSection";
import NotificationPopup from "@/components/notificationPopup";

const menuItems = [
  { label: "Đề xuất", icon: <Home size={25} />, href: "/" },
  { label: "Khám phá", icon: <Compass size={25} />, href: "/explore" },
  { label: "Tải lên", icon: <PlusSquare size={25} />, href: "/upload" },
  { label: "Thư viện", icon: <Album size={25} />, href: "/library" },
  { label: "Thông báo", icon: <Bell size={25} />, isNotification: true },
  { label: "Hồ sơ", icon: <User size={25} />, href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // 🎯 Mock notifications
  const [notifications, setNotifications] = useState([
    {
      username: "Mai Anh",
      message: "đã thích bài hát của bạn 🎵",
      time: "2 phút trước",
      isRead: false,
    },
    {
      username: "Hoàng Dũng",
      message: "đã bình luận: 'Hay quá 😍'",
      time: "10 phút trước",
      isRead: true,
    },
    {
      username: "Admin",
      message: "đã thêm tính năng mới cho bạn!",
      time: "1 giờ trước",
      isRead: false,
    },
  ]);

  // 🧮 Tính số lượng chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenNotifications = () => {
    setShowNotificationPopup(true);
  };

  // ✅ Khi đóng popup -> đánh dấu tất cả đã đọc
  const handleCloseNotification = () => {
    setShowNotificationPopup(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <aside className="w-60 h-screen bg-background text-foreground mt-5 px-4">
        {/* Logo */}
        <div className="flex items-center text-xl font-bold mb-4">
          <Image
            src={theme === "dark" ? "/logo-white.png" : "/logo-dark.png"}
            alt="Logo"
            width={132}
            height={132}
          />
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-muted px-10 py-2 text-sm focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Menu */}
        <nav>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.isNotification) {
              return (
                <NotificationPopup
                  key={item.label}
                  onClose={handleCloseNotification}
                  notifications={notifications}
                >
                  <button className="relative flex items-center gap-4 px-6 py-3 rounded-lg transition font-bold w-full text-left hover:bg-muted group">
                    <div className="relative">
                      {item.icon}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                    <ChevronRight
                      className="text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:rotate-90"
                      size={16}
                    />
                  </button>
                </NotificationPopup>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href || ""}
                className={`flex items-center gap-4 px-6 py-3 rounded-lg transition font-bold ${
                  isActive ? "text-yellow-500" : "hover:bg-muted"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Đăng nhập */}
        <div className="px-4 py-5">
          <AuthSection />
        </div>

        {/* Footer */}
        <div className="px-6 py-2 text-sm text-muted-foreground space-y-1">
          <p>Công ty</p>
          <p>Chương trình</p>
          <p>Điều khoản và chính sách</p>
          <p>© 2025 Music of Minh</p>
        </div>
      </aside>
    </>
  );
}
