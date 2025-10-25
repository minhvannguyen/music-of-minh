"use client";

import { X } from "lucide-react";
import NotificationCard from "@/components/cards/notificationCard";

export default function NotificationPopup({
  onClose,
  notifications,
}: {
  onClose: () => void;
  notifications: {
    username: string;
    message: string;
    time: string;
    isRead: boolean;
  }[];
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-lg p-4 mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Thông báo</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Danh sách thông báo */}
        <div className="space-y-2">
          {notifications.map((item, index) => (
            <NotificationCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
