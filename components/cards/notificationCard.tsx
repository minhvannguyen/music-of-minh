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
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition cursor-pointer relative",
        !isRead && "bg-yellow-50 dark:bg-zinc-800/40"
      )}
    >
      {/* Dấu chấm thông báo chưa đọc */}
      {!isRead && (
        <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      )}

      {/* Avatar (giả lập chữ cái đầu tên) */}
      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full font-bold text-foreground">
        {username.charAt(0).toUpperCase()}
      </div>

      {/* Nội dung */}
      <div className="flex-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{username}</span> {message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
