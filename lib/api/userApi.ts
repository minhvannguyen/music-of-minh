import axios from "axios";

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

export const userAPI = {
  // Cập nhật thông tin user
  updateUser: async (
    userId: number,
    data: {
      username: string;
      bio?: string;
      avatar?: File | null;
    }
  ) => {
    const formData = new FormData();
    formData.append("Username", data.username);

    if (data.bio !== undefined) {
      formData.append("Bio", data.bio || "");
    }

    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    const response = await api.put(`/users/UpdateUser/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // api tìm kiếm người dùng
  searchUsers: async (keyword: string, page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/users/SearchUsersByName`, {
      params: {
        keyword,
        page,
        pageSize,
      },
    });
    return response.data;
  },

  // Lấy thông tin user theo ID
  getUserById: async (userId: number) => {
    const response = await api.get(`/users/GetUser/${userId}`);
    return response.data;
  },
};