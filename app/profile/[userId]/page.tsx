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
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import { SongApiResponse } from "@/types/song";
import { Playlist } from "@/types/playList";
import PlaylistDetail from "@/components/PlaylistDetail";
import { useParams } from "next/navigation";
import { User } from "@/types/user";
import { userAPI } from "@/lib/api/userApi";
import { UserPlus } from "lucide-react";
import { useFollow } from "@/hooks/useFollow";
import { is } from "zod/v4/locales";
import FollowerPopup from "@/components/FollowerPopup";

export default function ProfilePage() {
  const params = useParams();
  const userIdParam = params?.userId as string | undefined;
  const router = useRouter();
  const {
    user,
    isLoading: authLoading,
    isLoggedIn,
    refreshUser,
  } = useAuthContext();

  const isGuestMode = !!userIdParam;
  const viewedUserId = userIdParam ? Number(userIdParam) : user?.id;
  const isMe = !!user && (!userIdParam || user.id === Number(userIdParam));

  const [guestUser, setGuestUser] = useState<User | null>(null);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  const { songs: contextSongs, isLoading: songsLoading } = useSongContext();
  const { favoriteSongs, isLoading: favoritesLoading } = useFavoriteContext();
  const { playlists, isLoading: playlistsLoading } = usePlayListContext();
  const {
    followers,
    following,
    isLoading: followsLoading,
  } = useFollowContext();

  const [activeFilter, setActiveFilter] = useState("songUpload");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [apiSongs, setApiSongs] = useState<SongApiResponse[]>([]);
  const [isLoadingApiSongs, setIsLoadingApiSongs] = useState(false);
  const [isLoadingApiPlaylists, setIsLoadingApiPlaylists] = useState(false);
  const [apiPlaylists, setApiPlaylists] = useState<Playlist[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [isLoadingSavedPlaylists, setIsLoadingSavedPlaylists] = useState(false);
  const { numberFollowers, numberFollowing } = useFollowContext();

  const { toggleFollow, isFollowing } = useFollow(
    isLoggedIn && viewedUserId ? viewedUserId : 0,
  );

  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const [followType, setFollowType] = useState<"followers" | "following">(
    "followers",
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10; // Số bài hát mỗi trang

  useEffect(() => {
    const fetchGuestProfile = async () => {
      if (!isGuestMode || !viewedUserId || isMe) return;

      setIsLoadingGuest(true);
      try {
        const res = await userAPI.getUserById(Number(viewedUserId));
        // bạn nên có API riêng: userAPI.getUserById()

        if (res.success) {
          setGuestUser(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch guest profile", err);
      } finally {
        setIsLoadingGuest(false);
      }
    };

    fetchGuestProfile();
  }, [userIdParam]);

  useEffect(() => {
    if (!isLoggedIn && !isGuestMode) {
      router.replace("/login");
    }
  }, [isLoggedIn, isGuestMode]);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );

  const refreshPlaylists = async () => {
    if (!viewedUserId) {
      setApiPlaylists([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }

    setIsLoadingApiPlaylists(true);

    try {
      const response = await playlistAPI.getPlaylistsByUser(
        Number(viewedUserId),
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        setApiPlaylists(response.data);
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
    if (activeFilter === "playlistSaved") {
      refreshSavedPlaylists();
    }
  }, [activeFilter]);

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

  // Fetch songs từ API khi filter là songUpload
  const refreshSongs = async () => {
    if (!viewedUserId) {
      setApiSongs([]);
      return;
    }

    setIsLoadingApiSongs(true);
    try {
      const response = await songsAPI.getSongsByArtist(Number(viewedUserId));

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

  const handleSave = async (updatedUser: {
    name: string;
    avatar: string;
    bio?: string;
  }) => {
    try {
      await refreshUser();
      setAvatarError(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Loading state
  if (authLoading || (isMe && !user)) {
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

  const profileUser = isMe ? user : guestUser;

  // Lấy dữ liệu songs dựa trên filter
  let currentSongs: SongApiResponse[] = [];
  if (activeFilter === "songFavorite") {
    currentSongs = favoriteSongs;
  } else if (activeFilter === "songUpload") {
    currentSongs = apiSongs;
  } else {
    currentSongs = contextSongs;
  }

  const totalSongs = isMe
    ? contextSongs.length
    : (profileUser?.totalSongs ?? 0);

  const totalPlaylists = isMe
    ? playlists.length
    : (profileUser?.totalPlaylists ?? 0);

  const totalFollowers = isMe
    ? numberFollowers
    : (profileUser?.totalFollowers ?? 0);

  const totalFollowing = isMe
    ? numberFollowing
    : (profileUser?.totalFollowing ?? 0);

  if (!profileUser) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center text-muted-foreground">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }
  // Lấy initials cho placeholder
  const initials =
    profileUser.username?.charAt(0)?.toUpperCase() ??
    profileUser.email?.charAt(0)?.toUpperCase() ??
    "U";
  const avatarUrl = getAvatarUrl(profileUser.avatarUrl);

  // Nếu đang xem chi tiết playlist
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
      />
    );
  }

  const profileFilters = isMe
    ? ProfileFilters
    : [
        { id: "songUpload", label: "Bài hát" },
        { id: "playlistCreated", label: "Playlist" },
      ];
  if (!profileUser) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center text-muted-foreground">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Thông tin người dùng */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg bg-yellow-500">
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
          {profileUser.username || profileUser.email || "Người dùng"}
        </h1>
        <p className="text-muted-foreground text-sm">{profileUser.email}</p>

        {/* Bio */}
        {profileUser.bio && (
          <p className="text-center text-sm text-muted-foreground max-w-md mt-2 px-4">
            {profileUser.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6 text-sm mt-3 text-muted-foreground">
          <p>
            🎵 Bài hát:{" "}
            <span className="text-foreground font-medium">{totalSongs}</span>
          </p>
          <p>
            📁 Playlist:{" "}
            <span className="text-foreground font-medium">
              {totalPlaylists}
            </span>
          </p>
          <p>
            <button
              onClick={() => {
                setFollowType("followers");
                setShowFollowPopup(true);
              }}
            >
              👥 Người theo dõi:{" "}
              <span className="text-foreground font-medium">
                {totalFollowers}
              </span>
            </button>
          </p>
          <p>
            <button
              onClick={() => {
                setFollowType("following");
                setShowFollowPopup(true);
              }}
            >
              👥 Đang theo dõi:{" "}
              <span className="text-foreground font-medium">
                {totalFollowing}
              </span>
            </button>
          </p>
        </div>

        {isMe ? (
          <Button className="mt-4" onClick={() => setIsEditOpen(true)}>
            Chỉnh sửa hồ sơ
          </Button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isFollowing
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Playlist đã tạo */}
      <div className="bg-muted p-6 rounded-2xl shadow-md flex-1">
        {/* Filters */}
        <div className="flex ml-16">
          {profileFilters.map((filter) => (
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

        <div className="space-y-2 mt-8">
          {activeFilter === "songFavorite" && (
            <>
              {currentSongs.length > 0 ? (
                currentSongs.map((song) => (
                  <RenderSongList
                    key={song.id}
                    song={song}
                    songs={currentSongs}
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
            <>
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
                    onOpenPlaylist={(playlist) => setSelectedPlaylist(playlist)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có playlist nào được tạo
                </div>
              )}
            </>
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
                    onOpenPlaylist={(playlist) => setSelectedPlaylist(playlist)}
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

      {showFollowPopup && (
        <FollowerPopup
          type={followType}
          userId={Number(profileUser.id)}
          onClose={() => setShowFollowPopup(false)}
        />
      )}

      {/* Popup chỉnh sửa hồ sơ */}
      {isMe && user && (
        <EditProfileDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          userId={Number(user.id)}
          user={{
            name: user.username || "",
            avatar: avatarUrl || "/default-avatar.png",
            bio: user.bio || "",
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
