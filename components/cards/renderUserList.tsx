"use client";

import Image from "next/image";
import { UserPlus } from "lucide-react";
import { User } from "@/types/user";

interface RenderUserListProps {
  user: User;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export default function RenderUserList({
  user,
}: RenderUserListProps) {
  return (
    <div
      key={user.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <Image
        src={user.avatar || ""}
        alt={user.name || ""}
        width={108}
        height={108}
        className="rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {user.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-1">{user.userName}</p>
        <p className="text-muted-foreground text-xs">
          {formatNumber(user.followers || 0)} followers
        </p>
      </div>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          user.isFollowing
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-yellow-500 text-black hover:bg-yellow-400"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        {user.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
