"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { songsAPI } from "@/lib/api/songApi";
import { SongApiResponse } from "@/types/song";
import HomePlayerView from "@/components/HomePlayerView";
import { useAuthContext } from "@/contexts/authContext";

export default function HomePage() {
  const { isLoggedIn } = useAuthContext();
  const searchParams = useSearchParams();

  const [songs, setSongs] = useState<SongApiResponse[]>([]);
  const [initialSongId, setInitialSongId] = useState<number | null>(null);

  const [cursor, setCursor] = useState<{
    score: number;
    songId: number;
  } | null>(null);

  const loadMore = async () => {
    if (!cursor) return;
    
    let res; 
    if (isLoggedIn) {
     res = await songsAPI.getSongRecommend(
      cursor.score,
      cursor.songId,
      20,
    );}
    else {
       res = await songsAPI.getGuestSongRecommend(
        cursor.score,
        cursor.songId,
        20,
      );
    }

    setSongs((prev) => [...prev, ...res.items]);

    if (res.hasMore) {
      setCursor({
        score: res.nextScore,
        songId: res.nextSongId,
      });
    } else {
      setCursor(null);
    }
  };

  useEffect(() => {
    const playlistParam = searchParams.get("playlist");
    const songIdParam = searchParams.get("songId");

    // ✅ Nếu có playlist được truyền sang
    if (playlistParam) {
      try {
        const parsedSongs: SongApiResponse[] = JSON.parse(
          decodeURIComponent(playlistParam),
        );
        setSongs(parsedSongs);

        if (songIdParam) {
          setInitialSongId(Number(songIdParam));
        }

        return; // 🚀 Không gọi API nữa
      } catch (err) {
        console.error("Parse playlist error:", err);
      }
    }

    // ❗ Không có playlist -> gọi API như bình thường
    const initLoad = async () => {
      let res;
      if (isLoggedIn) {
        res = await songsAPI.getSongRecommend();
      } else {
        res = await songsAPI.getGuestSongRecommend();
      }

      setSongs(res.items);

      if (res.hasMore) {
        setCursor({
          score: res.nextScore,
          songId: res.nextSongId,
        });
      }
    };

    initLoad();
  }, [searchParams]);

  if (songs.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        Đang tải bài hát...
      </div>
    );
  }

  return (
    <HomePlayerView
      songs={songs}
      onNeedMore={loadMore}
      initialSongId={initialSongId} // truyền xuống để auto play
    />
  );
}
