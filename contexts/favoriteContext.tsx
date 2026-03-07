"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { SongApiResponse } from "@/types/song";
import { useAuthContext } from "@/contexts/authContext";
import { songsAPI } from "@/lib/api/songApi";

interface FavoriteContextType {
  favoriteSongs: SongApiResponse[];
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthContext();
  const [favoriteSongs, setFavoriteSongs] = useState<SongApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavoriteSongs = useCallback(async () => {
  if (!isLoggedIn) {
    setFavoriteSongs([]);
    return;
  }

  setIsLoading(true);

  try {
    const response = await songsAPI.getFavoriteSongs(1, 50); 
    // truyền page & pageSize nếu cần

    if (response.success && response.data?.items) {
      setFavoriteSongs(response.data.items);
    } else {
      setFavoriteSongs([]);
    }
  } catch (error) {
    console.error("Failed to fetch favorite songs:", error);
    setFavoriteSongs([]);
  } finally {
    setIsLoading(false);
  }
}, [isLoggedIn]);

  useEffect(() => {
    fetchFavoriteSongs();

    const onFavoritesChanged = () => {
      fetchFavoriteSongs();
    };

    window.addEventListener("favorites-changed", onFavoritesChanged);

    return () => {
      window.removeEventListener("favorites-changed", onFavoritesChanged);
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
  if (!context) {
    throw new Error("useFavoriteContext must be used within FavoriteProvider");
  }
  return context;
}