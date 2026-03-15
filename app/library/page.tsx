"use client";

import { useState, useEffect } from "react";
import { ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import CreatePlaylistDialog from "@/components/cards/PlaylistDialog";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import { SongApiResponse } from "@/types/song";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { Playlist } from "@/types/playList";
import { useSongContext } from "@/contexts/songContext";
import { useFavoriteContext } from "@/contexts/favoriteContext";
import RenderPlayList from "@/components/cards/renderPlayList";
import PlaylistDetail from "@/components/PlaylistDetail";

export default function Library() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();

  const { songs: contextSongs } = useSongContext();
  const {
    favoriteSongs,
    isLoading: favoritesLoading,
    refreshFavorites,
  } = useFavoriteContext();

  const [activeFilter, setActiveFilter] = useState("songUpload");
  const [apiSongs, setApiSongs] = useState<SongApiResponse[]>([]);
  const [isLoadingApiSongs, setIsLoadingApiSongs] = useState(false);
  const [isLoadingApiPlaylists, setIsLoadingApiPlaylists] = useState(false);
  const [apiPlaylists, setApiPlaylists] = useState<Playlist[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [isLoadingSavedPlaylists, setIsLoadingSavedPlaylists] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10; // Số bài hát mỗi trang

  // Kiểm tra đăng nhập khi mount
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      toast.error("Vui lòng đăng nhập để xem thư viện!");
      return;
    }
  }, [isLoggedIn, router]);

  const refreshPlaylists = async () => {
    if (!isLoggedIn || !user?.id) {
      setApiPlaylists([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }

    setIsLoadingApiPlaylists(true);

    try {
      const response = await playlistAPI.getPlaylistsByUser(user.id);

      if (response.status === 200 && Array.isArray(response.data)) {
        const mappedPlaylists = response.data;
        setApiPlaylists(mappedPlaylists);
        setTotalPages(1);
        setTotalItems(response.data.length);
      } else {
        console.error("Failed to fetch playlists:", response.message);
        setApiPlaylists([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setApiPlaylists([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoadingApiPlaylists(false);
    }
  };

  const refreshSavedPlaylists = async () => {
    if (!isLoggedIn) {
      setSavedPlaylists([]);
      return;
    }

    setIsLoadingSavedPlaylists(true);

    try {
      const data = await playlistAPI.getSavedPlaylists();

      if (Array.isArray(data)) {
        setSavedPlaylists(data);
      } else {
        setSavedPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching saved playlists:", error);
      setSavedPlaylists([]);
    } finally {
      setIsLoadingSavedPlaylists(false);
    }
  };

  useEffect(() => {
    if (activeFilter === "playlistCreated") {
      refreshPlaylists();
    } else {
      setApiPlaylists([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [activeFilter, isLoggedIn, user?.id]);

  useEffect(() => {
    if (activeFilter === "playlistSaved") {
      refreshSavedPlaylists();
    }
  }, [activeFilter]);

  const refreshSongs = async () => {
    if (!isLoggedIn || !user?.id) {
      setApiSongs([]);
      return;
    }

    setIsLoadingApiSongs(true);
    try {
      const response = await songsAPI.getSongsByArtist(user.id);

      if (response.success && response.data) {
        setApiSongs(response.data);

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

  useEffect(() => {
    if (activeFilter === "songUpload") {
      refreshSongs();
    } else {
      setApiSongs([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [activeFilter, isLoggedIn, user?.id]);

  useEffect(() => {
    if (activeFilter === "songFavorite") {
      refreshFavorites();
    }
  }, [activeFilter, refreshFavorites]);

  // Lấy dữ liệu songs dựa trên filter
  let currentSongs: SongApiResponse[] = [];
  if (activeFilter === "songFavorite") {
    currentSongs = favoriteSongs;
  } else if (activeFilter === "songUpload") {
    currentSongs = apiSongs;
  } else {
    currentSongs = contextSongs;
  }

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  // Nếu đang xem chi tiết playlist
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Left Sidebar */}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-background p-6 flex justify-between mx-12">
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
                {favoritesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách bài hát yêu thích...
                  </div>
                ) : favoriteSongs.length > 0 ? (
                  favoriteSongs.map((song) => (
                    <RenderSongList
                      key={song.id}
                      song={song}
                      songs={favoriteSongs}
                    />
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
                      <RenderSongList
                        key={song.id}
                        song={song}
                        songs={currentSongs}
                        refreshSongs={refreshSongs}
                      />
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
              <div>
                {/* Ô tạo playlist mới */}
                <CreatePlaylistDialog
                  mode="create"
                  onCreate={(data) => {
                    console.log("Playlist mới:", data);
                  }}
                >
                  <div
                    onClick={() => console.log("Open create playlist modal")}
                    className="flex items-center mx-16 gap-4 p-2 rounded-xl cursor-pointer hover:bg-muted transition-all"
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
                {isLoadingApiPlaylists ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải danh sách playlist...
                  </div>
                ) : apiPlaylists.length > 0 ? (
                  apiPlaylists.map((playlist) => (
                    <RenderPlayList
                      key={playlist.id}
                      playlist={playlist}
                      refreshPlaylists={refreshPlaylists}
                      onOpenPlaylist={(playlist) =>
                        setSelectedPlaylist(playlist)
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có playlist nào được tạo
                  </div>
                )}
              </div>
            )}

            {activeFilter === "playlistSaved" && (
              <div>
                {isLoadingSavedPlaylists ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải playlist đã lưu...
                  </div>
                ) : savedPlaylists.length > 0 ? (
                  savedPlaylists.map((playlist) => (
                    <RenderPlayList
                      key={playlist.id}
                      playlist={playlist}
                      refreshPlaylists={refreshSavedPlaylists}
                      onOpenPlaylist={(playlist) =>
                        setSelectedPlaylist(playlist)
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Bạn chưa lưu playlist nào
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
