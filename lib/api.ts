// lib/api.ts
import axios from "axios";
import { CreateSongRequest, CreateSongResponse, GetSongsResponse, GetSongsByArtistResponse } from "@/types/song";
import { GetGenresResponse } from "@/types/genre";

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
    if (error.response?.status === 401 
        && !originalRequest._retry 
        && originalRequest?.headers?.['x-skip-refresh'] !== '1') {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Gọi thẳng backend bằng axios client (có withCredentials)
        await api.post('/auth/RefreshToken');

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Logout cũng gọi backend thật
        try { await api.post('/auth/Logout'); } catch {}

        window.dispatchEvent(new Event("auth-changed"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Thêm các API functions cho đăng ký và quên mật khẩu
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
  confirmRegistration: async (code: string, userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post(`/Verification/ConfirmOtpRegister?Code=${code}`, userData);
    return response.data;
  },

  // Gửi OTP cho quên mật khẩu
  sendForgotPasswordOtp: async (email: string) => {
    const response = await api.post("/auth/SentOtpForgotPass", email);
    return response.data;
  },

  // Xác nhận OTP cho quên mật khẩu
  confirmForgotPasswordOtp: async (email: string, code: string) => {
    const response = await api.post(`/Verification/ConfirmOtpForgotPass?Email=${encodeURIComponent(email)}&Code=${code}`);
    return response.data;
  },

    // Đổi mật khẩu
    changePassword: async (email: string, oldPassword: string, newPassword: string, token?: string) => {
      const response = await api.post(
        "/auth/ChangePassword",
        {
          email,
          oldPassword,
          newPassword
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      return response.data;
    },
  
      // Đổi mật khẩu trường hợp quên mật khẩu
      changePasswordForgot: async (email: string, newPassword: string) => {
        const response = await api.post(
          `/auth/ChangePasswordForgot?email=${encodeURIComponent(email)}&newPass=${encodeURIComponent(newPassword)}`,
        );
        return response.data;
      }
};

// User API functions
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
};

// Songs API functions
export const songsAPI = {
  createSong: async (data: CreateSongRequest): Promise<CreateSongResponse> => {
    const formData = new FormData();
    formData.append("Title", data.title);
    formData.append("ArtistId", data.artistId.toString());
    formData.append("Private", data.private.toString());
    formData.append("audioFile", data.audioFile);
    formData.append("coverImage", data.coverImage);
    
    // Append GenreIds (mảng)
    if (data.genreIds && data.genreIds.length > 0) {
      data.genreIds.forEach((genreId) => {
        formData.append("GenreIds", genreId.toString());
      });
    }
    
    // Append Duration (nếu có, hoặc để trống)
    formData.append("Duration", data.duration || "");

    const response = await api.post("/songs/CreateSong", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "accept": "text/plain",
      },
    });

    return response.data;
  },

  // Cập nhật function để hỗ trợ pagination
  getSongs: async (page: number = 1, pageSize: number = 20): Promise<GetSongsResponse> => {
    const response = await api.get("/songs/GetSongs", {
      params: {
        page,
        pageSize,
      },
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // Thêm function mới để lấy bài hát theo artist
  getSongsByArtist: async (artistId: number): Promise<GetSongsByArtistResponse> => {
    const response = await api.get(`/songs/GetSongsByArtist/artist/${artistId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },
};

// Genres API functions
export const genresAPI = {
  getGenres: async (): Promise<GetGenresResponse> => {
    const response = await api.get("/genres/GetGenres");
    return response.data;
  },
};
