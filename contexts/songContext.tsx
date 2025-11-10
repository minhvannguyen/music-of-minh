"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Song } from "@/types/song";
import { useAuthContext } from "@/contexts/authContext";
import { MockProfile } from "@/mock/profileData";

interface SongContextType {
  songs: Song[];
  isLoading: boolean;
  refreshSongs: () => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export function SongProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthContext();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSongs = useCallback(async () => {
    if (!isLoggedIn) {
      setSongs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/songs`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const songsData = json?.data ?? json?.songs ?? json ?? [];
        setSongs(Array.isArray(songsData) ? songsData : []);
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
