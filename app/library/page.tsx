"use client";

import { useState, useEffect } from "react";
import { ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import CreatePlaylistDialog from "@/components/cards/PlaylistDialog";
import { songsAPI } from "@/lib/api";
import { Song, SongApiResponse } from "@/types/song";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

export default function Library() {
  const [activeFilter, setActiveFilter] = useState("playlistCreated");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useAuthContext(); // Thêm user vào đây
  const router = useRouter();

  // Helper function để build full URL
  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  // Kiểm tra đăng nhập khi mount
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      toast.error("Vui lòng đăng nhập để xem thư viện!");
      return;
    }
  }, [isLoggedIn, router]);

  // Format duration từ seconds sang MM:SS
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format uploadedAt sang readable date
  const formatUploadTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
      return `${Math.floor(diffDays / 365)} năm trước`;
    } catch {
      return dateString;
    }
  };

  // Map API response to Song format
  const mapApiSongToSong = (apiSong: SongApiResponse): Song => {
    return {
      id: apiSong.id,
      thumbnail: buildFullUrl(apiSong.coverUrl) || "",
      artistName: apiSong.artistName,
      songTitle: apiSong.title,
      genre: apiSong.genreNames && apiSong.genreNames.length > 0 
        ? apiSong.genreNames.join(", ") 
        : undefined, // Join array thành string
      likes: 0,
      reposts: 0,
      plays: apiSong.views || 0,
      comments: 0,
      duration: apiSong.duration ? formatDuration(apiSong.duration) : undefined,
      uploadTime: formatUploadTime(apiSong.uploadedAt),
      waveform: [],
    };
  };

  // Fetch songs when filter is songFavorite or songUpload
  useEffect(() => {
    if (activeFilter === "songFavorite" || activeFilter === "songUpload") {
      const fetchSongs = async () => {
        if (!isLoggedIn || !user?.id) {
          setSongs([]);
          return;
        }

        setIsLoading(true);
        try {
          if (activeFilter === "songUpload") {
            // Dùng API GetSongsByArtist cho bài hát của chính user
            const response = await songsAPI.getSongsByArtist(user.id);
            if (response.success && response.data) {
              const mappedSongs = response.data.map(mapApiSongToSong);
              setSongs(mappedSongs);
            } else {
              console.error("Failed to fetch songs:", response.message);
              setSongs([]);
            }
          } else {
            // songFavorite - giữ nguyên logic cũ nếu cần
            const response = await songsAPI.getSongs(1, 100);
            if (response.success && response.data && response.data.items) {
              const mappedSongs = response.data.items.map(mapApiSongToSong);
              setSongs(mappedSongs);
            } else {
              console.error("Failed to fetch songs:", response.message);
              setSongs([]);
            }
          }
        } catch (error) {
          console.error("Error fetching songs:", error);
          setSongs([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSongs();
    } else {
      // Reset songs khi không phải filter bài hát
      setSongs([]);
    }
  }, [activeFilter, isLoggedIn, user]); // Thay user?.id bằng user

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Left Sidebar */}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-background p-6 flex justify-between">
            {/* Filters */}
            <div className="flex justify-between">
              {ProfileFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`py-2 text-left px-6 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            {activeFilter === "songFavorite" && (
              <>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách bài hát...
                  </div>
                ) : songs.length > 0 ? (
                  songs.map((song) => (
                    <RenderSongList key={song.id} song={song} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có bài hát yêu thích nào
                  </div>
                )}
              </>
            )}

            {activeFilter === "songUpload" && (
              <>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách bài hát...
                  </div>
                ) : songs.length > 0 ? (
                  songs.map((song) => (
                    <RenderSongList key={song.id} song={song} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có bài hát nào được tải lên
                  </div>
                )}
              </>
            )}

            {activeFilter === "playlistCreated" && (
              <div className="space-y-4">
                {/* Ô tạo playlist mới */}
                <CreatePlaylistDialog
                  onCreate={(data) => {
                    console.log("Playlist mới:", data);
                  }}
                >
                  <div
                    onClick={() => console.log("Open create playlist modal")}
                    className="flex items-center gap-4 p-2 rounded-xl cursor-pointer hover:bg-muted transition-all"
                  >
                    {/* Ảnh giả lập (ô vuông có dấu +) */}
                    <div className="w-28 h-28 ml-2 flex items-center justify-center rounded-lg bg-muted-foreground/10 border border-muted-foreground/20">
                      <span className="text-4xl font-semibold text-muted-foreground">
                        +
                      </span>
                    </div>

                    {/* Thông tin playlist */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-foreground">
                        Tạo playlist mới
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Bắt đầu tạo danh sách phát của riêng bạn
                      </p>
                    </div>
                  </div>
                </CreatePlaylistDialog>

                {/* TODO: Load playlists từ API */}
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có playlist nào
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
