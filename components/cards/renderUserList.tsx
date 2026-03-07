"use client";

import Image from "next/image";
import { UserPlus } from "lucide-react";
import { User } from "@/types/user";
import { useFollow } from "@/hooks/useFollow";
import { useRouter } from "next/navigation";

interface RenderUserListProps {
  user: User;
}

export default function RenderUserList({
  user,
}: RenderUserListProps) {

  const router = useRouter();

  // 🔥 dùng đúng user.id
  const { toggleFollow, isFollowing } = useFollow(user.id);

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  return (
    <div onClick={() => router.push(`/profile/${user.id}`)} className="flex items-center gap-4 p-8 mr-12 ml-12 hover:bg-muted/50 rounded-lg transition-colors">
      
      {/* Avatar */}
      <Image
        src={buildFullUrl(user.avatarUrl || "/default-avatar.png")}
        alt={user.username || "User Avatar"}
        width={80}
        height={80}
        className="rounded-full object-cover"
      />

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {user.username}
        </h3>

        {user.bio && (
          <p className="text-muted-foreground text-sm mb-1">
            {user.bio}
          </p>
        )}

        <p className="text-muted-foreground text-xs">
          {user.role}
        </p>
      </div>

      {/* Follow button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isFollowing
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-yellow-500 text-black hover:bg-yellow-400"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}