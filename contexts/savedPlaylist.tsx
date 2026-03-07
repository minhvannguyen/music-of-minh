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

interface SavedPlayListContextType {
  savedPlaylists: Playlist[];
  isLoading: boolean;
  refreshSavedPlaylists: () => Promise<void>;
}

const SavedPlayListContext = createContext<SavedPlayListContextType | undefined>(
  undefined
);

export function SavedPlayListProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuthContext();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // -----------------------------
  //  API fetch playlists
  // -----------------------------
  const fetchSavedPlaylists = useCallback(async () => {
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
    fetchSavedPlaylists();
  }, [fetchSavedPlaylists]);

  // Lắng nghe sự kiện update playlist global
  useEffect(() => {
    const onPlaylistsChanged = () => fetchSavedPlaylists();
    window.addEventListener("playlists-changed", onPlaylistsChanged);
    return () =>
      window.removeEventListener("playlists-changed", onPlaylistsChanged);
  }, [fetchSavedPlaylists]);

  return (
    <SavedPlayListContext.Provider
      value={{
        savedPlaylists: playlists,
        isLoading,
        refreshSavedPlaylists: fetchSavedPlaylists,
      }}
    >
      {children}
    </SavedPlayListContext.Provider>
  );
}

// Hook sử dụng
export function useSavedPlayListContext() {
  const context = useContext(SavedPlayListContext);
  if (!context) {
    throw new Error(
      "useSavedPlayListContext must be used within a SavedPlayListProvider"
    );
  }
  return context;
}
