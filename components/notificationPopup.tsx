"use client";

import { X } from "lucide-react";
import NotificationCard from "@/components/cards/notificationCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function NotificationPopup({
  onClose,
  notifications,
  children,
}: {
  onClose: () => void;
  notifications: {
    username: string;
    message: string;
    time: string;
    isRead: boolean;
  }[];
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 max-h-96 overflow-y-auto" 
        sideOffset={8} 
        side="right" 
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2">
          <h2 className="text-sm font-semibold">Thông báo</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition p-1"
          >
            {/* <X size={16} /> */}
          </button>
        </div>
        
        <DropdownMenuSeparator />

        {/* Danh sách thông báo */}
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((item, index) => (
              <div key={index} className="px-1">
                <NotificationCard {...item} />
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
