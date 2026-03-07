"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Repeat } from "lucide-react";

export default function GlobalMusicPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    togglePlay,
    seekTo,
    nextSong,
    prevSong,
    repeat,
    setRepeat,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const cycleRepeat = () => {
    if (repeat === "none") setRepeat("one");
    else if (repeat === "one") setRepeat("all");
    else setRepeat("none");
  };

  const buildFullUrl = (p?: string) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `https://localhost:7114/${p.replace(/^\//, "")}`;
  }

  return (
    <div className="fixed left-0 bottom-0 w-64 bg-muted text-foreground p-3 border-t border-white/10 flex flex-col gap-3 z-50 rounded-2xl">
      {/* Song Info */}
      <div className="flex gap-3 items-center">
        <img
          src={buildFullUrl(currentSong.coverUrl)}
          className="w-12 h-12 rounded-md object-cover"
        />

        <div className="flex-1 overflow-hidden">
          <p className="font-semibold text-sm truncate">{currentSong.title}</p>
          <p className="text-gray-500 text-xs truncate">
            @{currentSong.artistName || "Unknown"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 text-xs px-2">
        <span className="w-10">{formatTime(progress)}</span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="flex-1 accent-yellow-500"
        />

        <span className="w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous */}
        <button
          onClick={ prevSong }
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <SkipBack size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center"
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>

        {/* Next */}
        <button
          onClick={nextSong}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <SkipForward size={20} />
        </button>

        {/* Repeat */}
        <div className="relative group">
  {/* Nút Repeat */}
  <button
    onClick={cycleRepeat}
    className={`p-2 rounded-full transition
      ${
        repeat === "none"
          ? "bg-white/5"
          : repeat === "one"
          ? "bg-blue-500"
          : "bg-yellow-500"
      }`}
  >
    <Repeat size={12} />
  </button>

  {/* Tooltip */}
  <div
    className="absolute right-1/2 translate-x-1/2 -top-9
               bg-yellow-500 text-white text-xs px-2 py-1 rounded
               opacity-0 group-hover:opacity-100
               pointer-events-none transition"
  >
    {repeat}
  </div>
</div>

      </div>
    </div>
  );
}
