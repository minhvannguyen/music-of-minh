"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import NowPlayingCard from "@/components/cards/nowPlayingCard";
import { SongApiResponse } from "@/types/song";
import { usePlayer } from "@/contexts/PlayerContext";

interface HomePlayerViewProps {
  songs: SongApiResponse[];
  onNeedMore: () => void;
  initialSongId?: number | null; // ✅ thêm prop này
}

export default function HomePlayerView({
  songs,
  onNeedMore,
  initialSongId,
}: HomePlayerViewProps) {
  const {
    forcePlaylist,
    currentIndex,
    nextSong,
    prevSong,
    playlist,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimationControls();

  /* =======================
   * ▶ INIT / SYNC PLAYER
   * ======================= */
  const hasInitializedRef = useRef(false);

useEffect(() => {
  if (songs.length === 0) return;

  // ✅ Nếu context đã có playlist thì không làm gì
  if (playlist.length > 0) return;

  // ✅ Nếu đã từng inject rồi thì không làm lại
  if (hasInitializedRef.current) return;

  hasInitializedRef.current = true;

  let startIndex = 0;

  if (initialSongId) {
    const foundIndex = songs.findIndex((s) => s.id === initialSongId);
    if (foundIndex !== -1) {
      startIndex = foundIndex;
    }
  }

  const mapped = songs.map((s) => ({
    id: s.id,
    title: s.title,
    artistName: s.artistName ?? "Unknown",
    coverUrl: s.coverUrl,
    fileUrl: s.fileUrl,
  }));

  forcePlaylist(mapped, startIndex);

}, [songs, initialSongId, playlist.length]);

  /* =======================
   * ⏭ LAZY LOAD SIGNAL
   * ======================= */
  useEffect(() => {
    if (currentIndex >= songs.length - 6) {
      onNeedMore();
    }
  }, [currentIndex, songs.length, onNeedMore]);

  /* =======================
   * 🎡 WHEEL SCROLL
   * ======================= */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let accum = 0;
    let timer: NodeJS.Timeout | null = null;
    const threshold = 120;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      accum += e.deltaY;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => (accum = 0), 120);

      if (Math.abs(accum) > threshold) {
        accum > 0 ? nextSong() : prevSong();
        accum = 0;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [nextSong, prevSong]);

  /* =======================
   * 🎬 ANIMATION
   * ======================= */
  useEffect(() => {
    controls.start({
      y: -currentIndex * window.innerHeight,
      transition: { type: "spring", stiffness: 200, damping: 30 },
    });
  }, [currentIndex]);

  /* =======================
   * 🖥 UI
   * ======================= */
  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <motion.div
        className="flex flex-col"
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        style={{ touchAction: "none" }}
      >
        {songs.map((song, i) => (
          <div key={`${song.id}-${i}`} className="h-screen">
            <NowPlayingCard song={song} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}