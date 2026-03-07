"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { startNotificationConnection } from "@/lib/signalr/notificationConnection";
import { useAuthContext } from "./authContext";
import { notificationAPI } from "@/lib/api/notificationApi";

export interface Notification {
  id: number;
  actorUserId: number;
  actorUsername: string;
  actorAvatar?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface Props {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      // load notification từ DB
      const list = await notificationAPI.getNotifications();

      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.isRead).length);

      const conn = await startNotificationConnection(user.id || 0);

      conn.on("ReceiveNotification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    };

    init();
  }, [user]);

  // ✅ đánh dấu đã đọc
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      })),
    );
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
};
