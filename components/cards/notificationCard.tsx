"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { notificationAPI } from "@/lib/api/notificationApi";

export default function NotificationCard({
  id,
  avatarUrl,
  username,
  message,
  time,
  isRead,
  onDeleted,
}: {
  id: number;
  avatarUrl?: string;
  username: string;
  message: string;
  time: string;
  isRead: boolean;
  onDeleted?: (id: number) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setIsDeleting(true);
      await notificationAPI.deleteNotification(id);

      onDeleted?.(id);
    } catch (err) {
      console.error("Delete notification failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition cursor-pointer relative group",
        !isRead && "bg-yellow-50 dark:bg-zinc-800/40"
      )}
    >
      {/* Chấm đỏ chưa đọc */}
      {!isRead && (
        <span className="absolute top-6 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      )}

      {/* Avatar */}
      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full font-bold text-xs text-foreground">
        {avatarUrl ? (
          <img
            src={buildFullUrl(avatarUrl)}
            alt={username}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span>{username.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0 mr-6">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{username}</span> {message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>

      {/* Icon xoá */}
      {isRead && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
      )}
    </div>
  );
}