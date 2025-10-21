// components/ui/Sidebar.tsx
"use client";
import { Home, Compass, User, PlusSquare, MoreHorizontal, LogIn, Search, X, Album } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";  
import Image from "next/image";
import { useState } from "react";
import ThemeToggle from "@/components/themeToggle";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { label: "Đề xuất", icon: <Home size={25} />, href: "/" },
  { label: "Khám phá", icon: <Compass size={25} />, href: "/explore" },
  { label: "Đã follow", icon: <User size={25} />, href: "/following" },
  { label: "Tải lên", icon: <PlusSquare size={25} />, href: "/upload" },
  { label: "Playlists", icon: <Album size={25} />, href: "/playlist" },
  { label: "Hồ sơ", icon: <User size={25} />, href: "/profile" },
  { label: "Thêm", icon: <MoreHorizontal size={25} />, href: "/more", isSpecial: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [showMorePopup, setShowMorePopup] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleMoreClick = (e: React.MouseEvent, item: { isSpecial?: boolean }) => {
    if (item.isSpecial) {
      e.preventDefault();
      setShowMorePopup(true);
    }
  };

  const closePopup = () => {
    setShowMorePopup(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Thêm Enter key support (optional)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <aside className="w-60 h-screen bg-background text-foreground mt-5 px-4">
        {/* Logo */}
        <div>
          <div className="flex items-center text-xl font-bold">
              <Image src={theme === "dark" ? "/logo-white.png" : "/logo-dark.png"} 
                     alt="Logo" width={132} height={132}/>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
          <form onSubmit={handleSearch}>
          <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress} // Optional
              className="w-full rounded-full bg-muted px-10 py-2 text-sm focus:outline-none"
            />
          </div>
          </form>
          </div>
          {/* Menu */}
          <nav>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.label}>
                  {item.isSpecial ? (
                    <button
                      onClick={(e) => handleMoreClick(e, item)}
                      className={`flex items-center gap-4 px-6 py-3 rounded-lg transition font-bold w-full text-left
                        ${isActive ? "text-yellow-500" : "hover:bg-muted"}
                      `}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-4 px-6 py-3 rounded-lg transition font-bold 
                        ${isActive ? "text-yellow-500" : "hover:bg-muted"}
                      `}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Đăng nhập */}
        <div className="px-4 py-5">
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 font-bold text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <LogIn size={18} /> Đăng nhập
          </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-2 text-sm text-muted-foreground space-y-1">
            <p>Công ty</p>
            <p>Chương trình</p>
            <p>Điều khoản và chính sách</p>
            <p>© 2025 Music of Minh</p>
          </div>
        
      </aside>

      {/* More Popup */}
      {showMorePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-96 max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Tùy chọn bổ sung</h2>
              <button
                onClick={closePopup}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Chủ đề</span>
                <ThemeToggle />
              </div>

              {/* Additional Options */}
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition">
                  <span className="text-foreground">Cài đặt</span>
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition">
                  <span className="text-foreground">Trợ giúp</span>
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition">
                  <span className="text-foreground">Phản hồi</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={closePopup}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}