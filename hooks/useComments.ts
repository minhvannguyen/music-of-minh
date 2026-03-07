"use client";

import { useState, useCallback, useEffect } from "react";
import type { Comment } from "@/types/comment";
import { commentAPI } from "@/lib/api/commentApi";

export function useComments(songId: number) {
  const [page, setPage] = useState(1);
  const [commentTree, setCommentTree] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Đếm tất cả comment (cha + con)
  const [totalComments, setTotalComments] = useState(0);

  /** 
   * Helper đếm tổng comment thật sự từ dữ liệu tree
   * (nếu API không trả total đúng)
   */
  const fetchTotalComments = async () => {
      try {
        const count = await commentAPI.getCommentsCountBySongId(songId);
        setTotalComments(count);
      } catch (error) {
        console.error("Error fetching total comments:", error);
      }
    };

  useEffect(() => {

    fetchTotalComments();
  }, [songId]);

  /** Load 1 trang comment */
  const loadPage = useCallback(
    async (p: number) => {
      try {
        setLoading(true);

        const res = await commentAPI.getCommentsBySongId(songId, p);
        const newData: Comment[] = res.data.data ?? [];

        setCommentTree((prev) => {
          const merged = p === 1 ? newData : [...prev, ...newData];
          return merged;
        });

        setHasMore(newData.length > 0);
      } catch (err) {
        console.error("Load comments error:", err);
      } finally {
        setLoading(false);
      }
    },
    [songId]
  );

  /** Reset toàn bộ và load trang đầu tiên */
  const resetAndLoad = useCallback(() => {
    setPage(1);
    loadPage(1);
  }, [loadPage]);

  return {
    page,
    setPage,
    commentTree,
    loading,
    hasMore,
    loadPage,
    resetAndLoad,
    totalComments,
    fetchTotalComments,
  };
}
