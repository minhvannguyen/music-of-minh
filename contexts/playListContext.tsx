"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { PlayList } from "@/types/playList";
import { useAuthContext } from "@/contexts/authContext";
import { MockProfile } from "@/mock/profileData";

interface PlayListContextType {
  playlists: PlayList[];
  isLoading: boolean;
  refreshPlaylists: () => Promise<void>;
}

const PlayListContext = createContext<PlayListContextType | undefined>(undefined);

export function PlayListProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthContext();
  const [playlists, setPlaylists] = useState<PlayList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setPlaylists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/playlists`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const playlistsData = json?.data ?? json?.playlists ?? json ?? [];
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
      } else {
        // Fallback về mock data nếu API không có
        setPlaylists(MockProfile.playlists);
      }
    } catch (error) {
      console.warn("Failed to fetch playlists, using mock data:", error);
      setPlaylists(MockProfile.playlists);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchPlaylists();

    // Lắng nghe event để refresh
    const onPlaylistsChanged = () => {
      fetchPlaylists();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("playlists-changed", onPlaylistsChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("playlists-changed", onPlaylistsChanged);
      }
    };
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

export function usePlayListContext() {
  const context = useContext(PlayListContext);
  if (context === undefined) {
    throw new Error("usePlayListContext must be used within a PlayListProvider");
  }
  return context;
}


