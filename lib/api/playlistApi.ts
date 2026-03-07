import axios from "axios";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "@/types/playList";

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
  },
);

export const playlistAPI = {
  // Tạo playlist mới
  createPlaylist: async (data: CreatePlaylistRequest) => {
    const formData = new FormData();
    formData.append("Name", data.name);
    formData.append("IsPublic", data.IsPublic ? "true" : "false");

    if (data.UserId) {
      formData.append("UserId", String(data.UserId));
    }

    if (data.coverImage) {
      formData.append("CoverImage", data.coverImage);
    }

    try {
      // Ghi chú: override header để browser/axios đính kèm boundary đúng
      const response = await api.post("/playlists/Create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      });
      return response.data; // Giữ nguyên để UI xử lý
    } catch (error: unknown) {
      console.error("CreatePlaylist error:", error);
      throw { success: false, message: "Lỗi khi tạo playlist" };
    }
  },

  // Cập nhật playlist
  updatePlaylist: async (data: UpdatePlaylistRequest) => {
    const formData = new FormData();
    formData.append("Name", data.name);
    formData.append("IsPublic", data.isPublic ? "true" : "false");

    if (data.coverImage) {
      formData.append("CoverImage", data.coverImage);
    }
    const response = await api.put(`/playlists/Update/${data.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Thêm function mới để lấy playlist theo người dùng
  getPlaylistsByUser: async (userId: number) => {
    const response = await api.get(`/playlists/GetByUserId/${userId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // Thêm function mới để xóa playlist
  deletePlaylist: async (playlistId: number) => {
    const response = await api.delete(`/playlists/Delete/${playlistId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // Thêm function mới để thêm bài hát vào playlist
  addSongToPlaylist: async (playlistId: number, songId: number) => {
    const response = await api.post(`/playlists/AddSong`, {
      playlistId,
      songId,
    });
    return response.data;
  },

  // Thêm function mới để xóa bài hát khỏi playlist
  removeSongFromPlaylist: async (playlistId: number, songId: number) => {
    const response = await api.delete(`/playlists/RemoveSong`, {
      data: {
        playlistId,
        songId,
      },
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  },

  // api lấy danh sách bài hát trong playlist
  getSongsInPlaylist: async (playlistId: number) => {
    const response = await api.get(`/playlists/GetSongs/${playlistId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // Lấy playlist theo ID
  getById: async (playlistId: number) => {
    const response = await api.get(`/playlists/GetById/${playlistId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // lấy top playlists
  getTopPlaylists: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/playlists/GetTopPlaylists/top`, {
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

  // api lưu playlist
  toggleSavePlaylist: async (playlistId: number) => {
    const response = await api.post(
      `/saved-playlists/ToggleSave/${playlistId}`,
      {
        headers: {
          accept: "text/plain",
        },
      },
    );
    return response.data;
  },

  // kiểm tra xem playlist đã được lưu chưa
  isPlaylistSaved: async (playlistId: number) => {
    const response = await api.get(`/saved-playlists/IsSaved/${playlistId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // api lấy về các playlist đã lưu của user
  getSavedPlaylists: async () => {
    const response = await api.get(`/saved-playlists/GetMySavedPlaylists`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // api tăng lượt nghe
  incrementView: async (playlistId: number) => {
    const response = await api.post(
      `/playlists/IncrementView?playlistId=${playlistId}`,
    );
    return response.data;
  },

  // api tìm kiếm playlist
  searchPlaylists: async (
    keyword: string,
    userId?: number,  
    page: number = 1,
    pageSize: number = 20,
  ) => {
    const response = await api.get(`/playlists/SearchByName`, {
      params: {
        keyword,
        userId,
        page,
        pageSize,
      },
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

};
