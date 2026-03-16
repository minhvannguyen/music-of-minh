import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor để xử lý token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // BỎ QUA refresh nếu client set header 'x-skip-refresh: 1'
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest?.headers?.["x-skip-refresh"] !== "1"
    ) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Gọi thẳng backend bằng axios client (có withCredentials)
        await api.post("/auth/RefreshToken");

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Logout cũng gọi backend thật
        try {
          await api.post("/auth/Logout");
        } catch {}

        window.dispatchEvent(new Event("auth-changed"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const notificationAPI = {
  // api đánh dấu đã đọc tất cả thông báo
  markAllAsRead: async () => {
    try {
      await api.put("/notification/MarkAllAsRead", null, {
        headers: {
          accept: "text/plain",
        },
      });
    } catch (error) {
      console.error("Mark all read failed", error);
      throw error;
    }
  },

  // api lấy thông báo của user
  getNotifications: async () => {
    try {
      const response = await api.get("/notification/GetNotifications");
      return response.data.data; // Trả về dữ liệu thông báo
    } catch (error) {
      console.error("Get notifications failed", error);
      throw error;
    }
  },

  //api xoá thông báo
  deleteNotification: async (notificationId: number) => {
    try {
      await api.delete(`/notification/DeleteNotification/${notificationId}`);
    } catch (error) {
      console.error("Delete notification failed", error);
      throw error;
    }
  },
};
