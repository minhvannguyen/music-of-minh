"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useAuthContext } from "@/contexts/authContext";
import { followAPI } from "@/lib/api/followApi";

interface FollowUser {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface FollowContextType {
  followers: FollowUser[];
  following: FollowUser[];

  numberFollowers: number;
  numberFollowing: number;

  isLoading: boolean;

  follow: (userId: number) => Promise<void>;
  unfollow: (userId: number) => Promise<void>;
  checkIsFollowing: (userId: number) => Promise<boolean>;

  refreshFollows: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuthContext();

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);

  const [numberFollowers, setNumberFollowers] = useState(0);
  const [numberFollowing, setNumberFollowing] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // Fetch followers & following
  // ===============================
  const fetchFollows = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      setFollowers([]);
      setFollowing([]);
      setNumberFollowers(0);
      setNumberFollowing(0);
      return;
    }

    setIsLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        followAPI.getFollowers(user.id),
        followAPI.getFollowingUsers(user.id),
      ]);

      const followersData = followersRes?.data ?? followersRes ?? [];
      const followingData = followingRes?.data ?? followingRes ?? [];

      setFollowers(followersData);
      setFollowing(followingData);

      setNumberFollowers(followersData.length);
      setNumberFollowing(followingData.length);
    } catch (error) {
      console.error("Error fetching follow data:", error);
      setFollowers([]);
      setFollowing([]);
      setNumberFollowers(0);
      setNumberFollowing(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  // ===============================
  // Follow user
  // ===============================
  const follow = async (userId: number) => {
    try {
      await followAPI.followUser(userId);

      // cập nhật local state ngay lập tức
      setNumberFollowing((prev) => prev + 1);

      // refresh lại danh sách
      await fetchFollows();

      window.dispatchEvent(new Event("follows-changed"));
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  // ===============================
  // Unfollow user
  // ===============================
  const unfollow = async (userId: number) => {
    try {
      await followAPI.unfollowUser(userId);

      setNumberFollowing((prev) => Math.max(prev - 1, 0));

      await fetchFollows();

      window.dispatchEvent(new Event("follows-changed"));
    } catch (error) {
      console.error("Unfollow failed:", error);
    }
  };

  // ===============================
  // Check is following
  // ===============================
  const checkIsFollowing = async (userId: number) => {
    try {
      const res = await followAPI.isFollowing(userId);
      return res?.data ?? res ?? false;
    } catch {
      return false;
    }
  };

  return (
    <FollowContext.Provider
      value={{
        followers,
        following,

        numberFollowers,
        numberFollowing,

        isLoading,

        follow,
        unfollow,
        checkIsFollowing,

        refreshFollows: fetchFollows,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollowContext() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollowContext must be used within FollowProvider");
  }
  return context;
}