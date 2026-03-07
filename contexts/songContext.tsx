"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Song, SongApiResponse } from "@/types/song";
import { useAuthContext } from "@/contexts/authContext";
import { MockProfile } from "@/mock/profileData";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
interface SongContextType {
  songs:  SongApiResponse[];
  isLoading: boolean;
  refreshSongs: () => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export function SongProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuthContext();
  const [songs, setSongs] = useState<SongApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSongs = useCallback(async () => {
    if (!isLoggedIn) {
      setSongs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await songsAPI.getSongsByArtist(user?.id || 0);
      
            if (res?.success && Array.isArray(res.data)) {
              setSongs(res.data);
      } else {
        // Fallback về mock data nếu API không có
        setSongs(MockProfile.songs);
      }
    } catch (error) {
      console.warn("Failed to fetch songs, using mock data:", error);
      setSongs(MockProfile.songs);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchSongs();

    // Lắng nghe event để refresh
    const onSongsChanged = () => {
      fetchSongs();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("songs-changed", onSongsChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("songs-changed", onSongsChanged);
      }
    };
  }, [fetchSongs]);

  return (
    <SongContext.Provider
      value={{
        songs,
        isLoading,
        refreshSongs: fetchSongs,
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

export function useSongContext() {
  const context = useContext(SongContext);
  if (context === undefined) {
    throw new Error("useSongContext must be used within a SongProvider");
  }
  return context;
}
