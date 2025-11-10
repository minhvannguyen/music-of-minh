"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@/types/user";
import { Song } from "@/types/song";
import { PlayList } from "@/types/playList";
import { useAuthContext } from "@/contexts/authContext";
import { MockProfile } from "@/mock/profileData";

interface ProfileContextType {
  profile: User | null;
  songs: Song[];
  favoriteSongs: Song[];
  playlists: PlayList[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  refreshSongs: () => Promise<void>;
  refreshFavoriteSongs: () => Promise<void>;
  refreshPlaylists: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isLoggedIn } = useAuthContext();
  const [profile, setProfile] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<PlayList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile data đầy đủ
  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn || !authUser) {
      setProfile(null);
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/profile`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        // Fallback về dùng auth user data
        console.warn("Profile endpoint not available, using auth user data");
        setProfile({
          id: 0,
          name: authUser.username || undefined,
          userName: authUser.username || undefined,
          email: authUser.email || undefined,
          avatar: authUser.avatarUrl || undefined,
          totalSongs: 0,
          totalPlaylists: 0,
          followers: 0,
          following: 0,
        });
        return;
      }

      const json = await res.json();
      const data = json?.data ?? json?.user ?? json;
      
      setProfile({
        id: data.id ?? 0,
        name: data.name ?? authUser.username ?? undefined,
        userName: data.userName ?? data.username ?? authUser.username ?? undefined,
        email: data.email ?? authUser.email ?? undefined,
        avatar: data.avatar ?? data.avatarUrl ?? authUser.avatarUrl ?? undefined,
        totalSongs: data.totalSongs ?? data.songCount ?? 0,
        totalPlaylists: data.totalPlaylists ?? data.playlistCount ?? 0,
        followers: data.followers ?? 0,
        following: data.following ?? 0,
        isFollowing: data.isFollowing ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      // Fallback về dùng auth user data nếu có
      if (authUser) {
        setProfile({
          id: 0,
          name: authUser.username || undefined,
          userName: authUser.username || undefined,
          email: authUser.email || undefined,
          avatar: authUser.avatarUrl || undefined,
          totalSongs: 0,
          totalPlaylists: 0,
          followers: 0,
          following: 0,
        });
      }
    }
  }, [isLoggedIn, authUser]);

  // Fetch songs đã upload
  const fetchSongs = useCallback(async () => {
    if (!isLoggedIn) {
      setSongs([]);
      return;
    }

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
    }
  }, [isLoggedIn]);

  // Fetch favorite songs
  const fetchFavoriteSongs = useCallback(async () => {
    if (!isLoggedIn) {
      setFavoriteSongs([]);
      return;
    }

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
    }
  }, [isLoggedIn]);

  // Fetch playlists
  const fetchPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setPlaylists([]);
      return;
    }

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
    }
  }, [isLoggedIn]);

  // Fetch tất cả dữ liệu khi login hoặc khi auth user thay đổi
  useEffect(() => {
    if (!isLoggedIn || !authUser) {
      setProfile(null);
      setSongs([]);
      setFavoriteSongs([]);
      setPlaylists([]);
      setIsLoading(false);
      return;
    }

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch song song để tăng tốc độ
        await Promise.all([
          fetchProfile(),
          fetchSongs(),
          fetchFavoriteSongs(),
          fetchPlaylists(),
        ]);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isLoggedIn, authUser, fetchProfile, fetchSongs, fetchFavoriteSongs, fetchPlaylists]);

  // Lắng nghe event để refresh khi cần
  useEffect(() => {
    if (!isLoggedIn) return;

    const onProfileChanged = () => {
      fetchProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("profile-changed", onProfileChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("profile-changed", onProfileChanged);
      }
    };
  }, [isLoggedIn, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        songs,
        favoriteSongs,
        playlists,
        isLoading,
        refreshProfile: fetchProfile,
        refreshSongs: fetchSongs,
        refreshFavoriteSongs: fetchFavoriteSongs,
        refreshPlaylists: fetchPlaylists,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
