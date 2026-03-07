import axios from "axios";
import {
  LikeToggleRequest,
  IsLikedResponse,
  GetLikesCountResponse,
} from "@/types/like";

export const api = axios.create({
  baseURL: "https://localhost:7114/api",
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
  }
);

export const likeAPI = {
  // Toggle Like
  toggleLike: async (data: LikeToggleRequest): Promise<IsLikedResponse> => {
    const response = await api.post("/likes/toggle", data);
    return response.data;
  },

  // Check if user liked something
  isLiked: async (
    userId: number,
    targetType: string,
    targetId: number
  ): Promise<IsLikedResponse> => {
    const response = await api.get("/likes/is-liked", {
      params: {
        userId,
        targetType,
        targetId,
      },
    });

    return response.data;
  },
  // Get likes count for a target
  getLikesCount: async (
    targetType: string,
    targetId: number
  ): Promise<GetLikesCountResponse> => {
    const response = await api.get("/Likes/count", {
      params: {
        targetType,
        targetId,
      },
    });
    return response.data;
  },
};
