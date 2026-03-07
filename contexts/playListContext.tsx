"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Playlist } from "@/types/playList";
import { useAuthContext } from "@/contexts/authContext";
import { playlistAPI } from "@/lib/api/playlistApi";
interface PlayListContextType {
  playlists: Playlist[];
  isLoading: boolean;
  refreshPlaylists: () => Promise<void>;
}

const PlayListContext = createContext<PlayListContextType | undefined>(
  undefined
);

export function PlayListProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuthContext();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // -----------------------------
  //  API fetch playlists
  // -----------------------------
  const fetchPlaylists = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await playlistAPI.getPlaylistsByUser(user.id);

      if (res?.status === 200 && Array.isArray(res.data)) {
        setPlaylists(res.data);
      } else {
        console.error("API không trả về đúng định dạng:", res);
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Lỗi khi fetch playlists:", error);
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  // Fetch khi mở app + khi login thay đổi
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Lắng nghe sự kiện update playlist global
  useEffect(() => {
    const onPlaylistsChanged = () => fetchPlaylists();
    window.addEventListener("playlists-changed", onPlaylistsChanged);
    return () =>
      window.removeEventListener("playlists-changed", onPlaylistsChanged);
  }, [fetchPlaylists]);

  return (
    <PlayListContext.Provider
      value={{
        playlists,
        isLoading,
        refreshPlaylists: fetchPlaylists,
      }}
    >
      {children}
    </PlayListContext.Provider>
  );
}

// Hook sử dụng
export function usePlayListContext() {
  const context = useContext(PlayListContext);
  if (!context) {
    throw new Error(
      "usePlayListContext must be used within a PlayListProvider"
    );
  }
  return context;
}
