"use client";

import { useEffect, useState } from "react";
import { likeAPI } from "@/lib/api/likeApi";
import { useAuthContext } from "@/contexts/authContext";
import { toast } from "sonner";

export default function useLikeSong(songId: number) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  const { user } = useAuthContext();

  useEffect(() => {
  if (!songId) return;

  const fetchLikes = async () => {
    try {
      const res = await likeAPI.getLikesCount("song", songId);
      setLikesCount(res.count ?? 0);

      if (user?.id) {
        const isLikedRes = await likeAPI.isLiked(
          user.id,
          "song",
          songId
        );

        setIsLiked(isLikedRes.isLiked);
      } else {
        setIsLiked(false);
      }
    } catch (err) {
      console.error("fetchLikes error:", err);
    }
  };

  fetchLikes();
}, [songId, user?.id]);

  const toggle = async () => {

    if (!user?.id) {
      toast("🚫 bạn cần đăng nhập để thích bài hát!");
      return;
    }

    const res = await likeAPI.toggleLike({
      userId: user?.id ?? 0,
      targetType: "song",
      targetId: songId,
    });
    if (res.isLiked) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    } else {
      console.log("Unlike successful");
      setIsLiked(false);
      setLikesCount((prev) => Math.max(prev - 1, 0));
    }
  };

  return { likesCount, isLiked, toggle };
}
