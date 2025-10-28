"use client";

import { cn } from "@/lib/utils";

export default function NotificationCard({
  username,
  message,
  time,
  isRead,
}: {
  username: string;
  message: string;
  time: string;
  isRead: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition cursor-pointer relative",
        !isRead && "bg-yellow-50 dark:bg-zinc-800/40"
      )}
    >
      {/* Dấu chấm thông báo chưa đọc */}
      {!isRead && (
        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      )}

      {/* Avatar */}
      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full font-bold text-xs text-foreground">
        {username.charAt(0).toUpperCase()}
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground">
          <span className="font-semibold">{username}</span> {message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}
