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

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/Login", { email, password });
    return response.data;
  },

  // Gửi email đăng ký và nhận OTP
  register: async (email: string) => {
    const response = await api.post("/auth/SentOtpRegister", email);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/Logout");
    return response.data;
  },

  // Xác nhận OTP và hoàn tất đăng ký
  confirmRegistration: async (
    code: string,
    userData: {
      username: string;
      email: string;
      password: string;
    }
  ) => {
    const response = await api.post(
      `/Verification/ConfirmOtpRegister?Code=${code}`,
      userData
    );
    return response.data;
  },

  // Gửi OTP cho quên mật khẩu
  sendForgotPasswordOtp: async (email: string) => {
    const response = await api.post("/auth/SentOtpForgotPass", email);
    return response.data;
  },

  // Xác nhận OTP cho quên mật khẩu
  confirmForgotPasswordOtp: async (email: string, code: string) => {
    const response = await api.post(
      `/Verification/ConfirmOtpForgotPass?Email=${encodeURIComponent(
        email
      )}&Code=${code}`
    );
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (
    email: string,
    oldPassword: string,
    newPassword: string,
    token?: string
  ) => {
    const response = await api.post(
      "/auth/ChangePassword",
      {
        email,
        oldPassword,
        newPassword,
      },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  // Đổi mật khẩu trường hợp quên mật khẩu
  changePasswordForgot: async (email: string, newPassword: string) => {
    const response = await api.post(
      `/auth/ChangePasswordForgot?email=${encodeURIComponent(
        email
      )}&newPass=${encodeURIComponent(newPassword)}`
    );
    return response.data;
  },
};