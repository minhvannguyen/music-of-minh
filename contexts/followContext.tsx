"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuthContext } from "@/contexts/authContext";

interface FollowContextType {
  followers: number;
  following: number;
  isLoading: boolean;
  refreshFollows: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthContext();
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFollows = useCallback(async () => {
    if (!isLoggedIn) {
      setFollowers(0);
      setFollowing(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Nếu có API riêng cho follows
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/user/follows`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data ?? json;
        setFollowers(data?.followers ?? 0);
        setFollowing(data?.following ?? 0);
      } else {
        // Fallback về 0 nếu API không có
        setFollowers(0);
        setFollowing(0);
      }
    } catch (error) {
      console.warn("Failed to fetch follows:", error);
      setFollowers(0);
      setFollowing(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchFollows();

    // Lắng nghe event để refresh
    const onFollowsChanged = () => {
      fetchFollows();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("follows-changed", onFollowsChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("follows-changed", onFollowsChanged);
      }
    };
  }, [fetchFollows]);

  return (
    <FollowContext.Provider
      value={{
        followers,
        following,
        isLoading,
        refreshFollows: fetchFollows,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollowContext() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollowContext must be used within a FollowProvider");
  }
  return context;
}


