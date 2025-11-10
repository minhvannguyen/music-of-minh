"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "@/components/cards/EditProfileDialog";
import { ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";
import { useAuthContext } from "@/contexts/authContext";
import { useSongContext } from "@/contexts/songContext";
import { useFavoriteContext } from "@/contexts/favoriteContext";
import { usePlayListContext } from "@/contexts/playListContext";
import { useFollowContext } from "@/contexts/followContext";
import { useRouter } from "next/navigation";
import { songsAPI } from "@/lib/api";
import { Song, SongApiResponse } from "@/types/song";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn, refreshUser } = useAuthContext();
  const { songs: contextSongs, isLoading: songsLoading } = useSongContext();
  const { favoriteSongs, isLoading: favoritesLoading } = useFavoriteContext();
  const { playlists, isLoading: playlistsLoading } = usePlayListContext();
  const { followers, following, isLoading: followsLoading } = useFollowContext();
  
  const [activeFilter, setActiveFilter] = useState("songUpload");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [apiSongs, setApiSongs] = useState<Song[]>([]);
  const [isLoadingApiSongs, setIsLoadingApiSongs] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10; // Số bài hát mỗi trang

  // Helper function để build full URL
  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

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

  // Fetch songs từ API khi filter là songUpload
  useEffect(() => {
    if (activeFilter === "songUpload") {
      const fetchSongs = async () => {
        if (!isLoggedIn || !user?.id) {
          setApiSongs([]);
          return;
        }

        setIsLoadingApiSongs(true);
        try {
          // Dùng API GetSongsByArtist thay vì getSongs
          const response = await songsAPI.getSongsByArtist(user.id);
          if (response.success && response.data) {
            const mappedSongs = response.data.map(mapApiSongToSong);
            setApiSongs(mappedSongs);
            // Vì không có pagination, set totalPages = 1
            setTotalPages(1);
            setTotalItems(response.data.length);
          } else {
            console.error("Failed to fetch songs:", response.message);
            setApiSongs([]);
            setTotalPages(1);
            setTotalItems(0);
          }
        } catch (error) {
          console.error("Error fetching songs:", error);
          setApiSongs([]);
          setTotalPages(1);
          setTotalItems(0);
        } finally {
          setIsLoadingApiSongs(false);
        }
      };

      fetchSongs();
    } else {
      setApiSongs([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [activeFilter, isLoggedIn, user?.id]); // Thêm dependencies

  // Reset về trang 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Helper function để convert avatarUrl thành full URL
  const getAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/")) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const baseUrl = apiBaseUrl.replace(/\/$/, "");
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const handleSave = async (updatedUser: { name: string; avatar: string; bio?: string }) => {
    try {
      await refreshUser();
      setAvatarError(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Redirect nếu chưa đăng nhập
  if (!authLoading && !isLoggedIn) {
    router.push("/");
    return null;
  }

  const isLoading = authLoading || songsLoading || favoritesLoading || playlistsLoading || followsLoading;

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Lấy dữ liệu songs dựa trên filter
  let currentSongs: Song[] = [];
  if (activeFilter === "songFavorite") {
    currentSongs = favoriteSongs;
  } else if (activeFilter === "songUpload") {
    currentSongs = apiSongs;
  } else {
    currentSongs = contextSongs;
  }

  // Tính toán totalSongs và totalPlaylists
  const totalSongs = activeFilter === "songUpload" ? totalItems : apiSongs.length;
  const totalPlaylists = playlists.length;

  // Lấy initials cho placeholder
  const initials = user.username?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? "U";
  const avatarUrl = getAvatarUrl(user.avatarUrl);

  // Helper function để render pagination numbers
  const renderPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Hiển thị tất cả nếu ít hơn maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị với ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Thông tin người dùng */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg bg-yellow-500">
          {avatarUrl && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={() => {
                setAvatarError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
              {initials}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-semibold">
          {user.username || user.email || "Người dùng"}
        </h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>

        {/* Bio */}
        {user.bio && (
          <p className="text-center text-sm text-muted-foreground max-w-md mt-2 px-4">
            {user.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6 text-sm mt-3 text-muted-foreground">
          <p>
            🎵 Bài hát:{" "}
            <span className="text-foreground font-medium">{totalSongs}</span>
          </p>
          <p>
            📁 Playlist:{" "}
            <span className="text-foreground font-medium">{totalPlaylists}</span>
          </p>
          <p>
            👥 Người theo dõi:{" "}
            <span className="text-foreground font-medium">{followers}</span>
          </p>
          <p>
            👥 Đang theo dõi:{" "}
            <span className="text-foreground font-medium">{following}</span>
          </p>
        </div>

        <Button className="mt-4" onClick={() => setIsEditOpen(true)}>
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      {/* Playlist đã tạo */}
      <div className="bg-muted p-6 rounded-2xl shadow-md flex-1">
        {/* Filters */}
        <div className="flex ml-4">
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
        {/* profile playlist */}
        <div className="space-y-2 mt-8">
          {activeFilter === "songFavorite" && (
            <>
              {currentSongs.length > 0 ? (
                currentSongs.map((song) => (
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
              {isLoadingApiSongs ? (
                <div className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách bài hát...
                </div>
              ) : currentSongs.length > 0 ? (
                <>
                  {currentSongs.map((song) => (
                    <RenderSongList key={song.id} song={song} />
                  ))}
                  
                  {/* Bỏ pagination vì GetSongsByArtist trả về tất cả bài hát */}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có bài hát nào được tải lên
                </div>
              )}
            </>
          )}

          {activeFilter === "playlistCreated" && (
            <>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <RenderPlayList key={playlist.id} playlist={playlist} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có playlist nào được tạo
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Popup chỉnh sửa hồ sơ */}
      <EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={user.id!}
        user={{
          name: user.username || "",
          avatar: avatarUrl || "/default-avatar.png",
          bio: user.bio || "",
        }}
        onSave={handleSave}
      />
    </div>
  );
}
