"use client";

import { useCallback, useEffect, useState } from "react";
import { followAPI } from "@/lib/api/followApi";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";

interface UseFollowResult {
  isFollowing: boolean;
  loading: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  toggleFollow: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFollow = (userId?: number): UseFollowResult => {

  const { user } = useAuthContext();

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFollowStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await followAPI.isFollowing(userId);
      setIsFollowing(res === true);
    } catch (err) {
      console.error("Fetch follow status error:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  const follow = async () => {
    if (!user?.id) {
      toast("🚫 bạn cần đăng nhập đã!");
      return;
    }

    if (!userId || loading) return;

    try {
      setLoading(true);
      const res = await followAPI.followUser(userId);
      setIsFollowing(true);
      toast.success(res?.message ?? "Đã theo dõi người dùng");
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    if (!userId || loading) return;

    try {
      setLoading(true);
      const res = await followAPI.unfollowUser(userId);
      setIsFollowing(false);
      toast.success(res?.message ?? "Đã bỏ theo dõi");
    } catch (err) {
      console.error("Unfollow error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  };

  return {
    isFollowing,
    loading,
    follow,
    unfollow,
    toggleFollow,
    refetch: fetchFollowStatus,
  };
};
