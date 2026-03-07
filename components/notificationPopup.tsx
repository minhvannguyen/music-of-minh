"use client";

import NotificationCard from "@/components/cards/notificationCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { notificationAPI } from "@/lib/api/notificationApi";
import { useNotification } from "@/contexts/notificationContext";

export interface NotificationItem {
  id: number;
  actorUserId: number;
  actorAvatar?: string;
  actorUsername: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export default function NotificationPopup({
  onClose,
  notifications,
  children,
}: {
  onClose: () => void;
  notifications: NotificationItem[];
  children: React.ReactNode;
}) {
  const { markAllAsRead, removeNotification } = useNotification();

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error("Mark all read failed", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[360px] max-h-96 overflow-y-auto"
        sideOffset={8}
        side="right"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="text-sm font-semibold">Thông báo</h2>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-500 hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Danh sách */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="px-1">
                <NotificationCard
                  id={item.id}
                  avatarUrl={item.actorAvatar}
                  username={item.actorUsername}
                  message={item.message}
                  time={
                    item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Vừa xong"
                  }
                  isRead={item.isRead ?? false}
                  onDeleted={(id) => removeNotification(id)}
                />
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}