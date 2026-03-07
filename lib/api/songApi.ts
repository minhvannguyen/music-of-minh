import axios from "axios";
import {
  CreateSongRequest,
  SongResponse,
  GetSongsResponse,
  GetSongsByIdResponse,
  SongApiResponse,
} from "@/types/song";

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

export interface RecommendResponse {
  items: SongApiResponse[];
  nextScore: number;
  nextSongId: number;
  hasMore: boolean;
}

export const songsAPI = {
  createSong: async (data: CreateSongRequest): Promise<SongResponse> => {
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

    const response = await api.post("/songs/CreateSong", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        accept: "text/plain",
      },
    });

    return response.data;
  },

  // api cập nhật bài hát
  updateSong: async (data: FormData): Promise<SongResponse> => {
    const response = await api.put(
      `/songs/UpdateSong/${data.get("songId")}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      },
    );
    return response.data;
  },

  // api đề xuất
  getSongRecommend: async (
    score?: number,
    songId?: number,
    limit: number = 20,
  ): Promise<RecommendResponse> => {
    const response = await api.get("/recommendation/GetSongRecommend", {
      params: {
        score,
        songId,
        limit,
      },
    });

    return response.data;
  },

  getGuestSongRecommend: async (
    score?: number,
    songId?: number,
    limit: number = 20,
  ): Promise<RecommendResponse> => {
    const response = await api.get("/recommendation/GetGuestRecommend", {
      params: {
        score,
        songId,
        limit,
      },
    });

    return response.data;
  },

  // Cập nhật function để hỗ trợ pagination
  get25Songs: async (
    page: number = 1,
    pageSize: number = 25,
  ): Promise<GetSongsResponse> => {
    const response = await api.get("/recommendation/Get25Songs", {
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

  getNewSongs: async (
    page: number = 1,
    pageSize: number = 20,
  ): Promise<GetSongsResponse> => {
    const response = await api.get("/songs/GetNewSongs", {
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

  // lấy bài hát theo ID
  getSongById: async (songId: number): Promise<GetSongsByIdResponse> => {
    const response = await api.get(`/songs/GetSong/${songId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // Thêm function mới để lấy bài hát theo artist
  getSongsByArtist: async (artistId: number) => {
    const response = await api.get(
      `/songs/GetSongsByArtist/artist/${artistId}`,
      {
        headers: {
          accept: "text/plain",
        },
      },
    );
    return response.data;
  },

  // api xoá bài hát
  deleteSong: async (songId: number) => {
    const response = await api.delete(`/songs/DeleteSong/${songId}`, {
      headers: {
        accept: "text/plain",
      },
    });
    return response.data;
  },

  // api lấy top songs
  getTopSongs: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/songs/GetPopularSongs/popular`, {
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

  // api tăng lượt nghe bài hát
  incrementView: async (songId: number) => {
    const response = await api.post(`/songs/IncrementView?songId=${songId}`);

    return response.data;
  },

  // api lấy bài hát yêu thích của user
  getFavoriteSongs: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/songs/GetFavoriteSongs`, {
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

  // api tìm kiếm bài hát
  searchSongs: async (
    keyword: string,
    page: number = 1,
    pageSize: number = 20,
  ) => {
    const response = await api.get(`/songs/SearchSongs/search`, {
      params: {
        keyword,
        page,
        pageSize,
      },
      
    });
    return response.data;
  },
};
