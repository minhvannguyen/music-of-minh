"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Song } from "@/types/song";
import { useAuthContext } from "@/contexts/authContext";
import { MockProfile } from "@/mock/profileData";

interface FavoriteContextType {
  favoriteSongs: Song[];
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthContext();
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavoriteSongs = useCallback(async () => {
    if (!isLoggedIn) {
      setFavoriteSongs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/songs/favorites`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const songsData = json?.data ?? json?.songs ?? json ?? [];
        setFavoriteSongs(Array.isArray(songsData) ? songsData : []);
      } else {
        // Fallback về mock data nếu API không có
        setFavoriteSongs(MockProfile.songs);
      }
    } catch (error) {
      console.warn("Failed to fetch favorite songs, using mock data:", error);
      setFavoriteSongs(MockProfile.songs);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchFavoriteSongs();

    // Lắng nghe event để refresh
    const onFavoritesChanged = () => {
      fetchFavoriteSongs();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("favorites-changed", onFavoritesChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("favorites-changed", onFavoritesChanged);
      }
    };
  }, [fetchFavoriteSongs]);

  return (
    <FavoriteContext.Provider
      value={{
        favoriteSongs,
        isLoading,
        refreshFavorites: fetchFavoriteSongs,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavoriteContext() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error("useFavoriteContext must be used within a FavoriteProvider");
  }
  return context;
}


