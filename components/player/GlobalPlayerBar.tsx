"use client";

import { useMemo } from "react";
import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX } from "lucide-react";

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function GlobalPlayerBar() {
  const {
    current, isPlaying, togglePlay, next, prev,
    currentTime, duration, seek,
    isMuted, toggleMuted, volume, setVolume,
    repeat, setRepeat,
  } = usePlayer();

  const progress = useMemo(() => {
    if (!duration || !Number.isFinite(duration)) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141017] text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-4">
        {/* left: artwork + titles */}
        <div className="min-w-0 flex items-center gap-3 flex-1">
          <div className="relative w-12 h-12 rounded overflow-hidden bg-neutral-700 flex-shrink-0">
            {current?.thumbnail && (
              <Image src={current.thumbnail} alt={current?.songTitle || "cover"} fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium">{current?.songTitle || "Chưa chọn bài hát"}</div>
            <div className="truncate text-sm text-white/60">{current?.artistName || ""}</div>
          </div>
        </div>

        {/* center: controls + progress */}
        <div className="flex flex-col items-center gap-2 flex-[2]">
          <div className="flex items-center gap-5">
            <button className="opacity-80 hover:opacity-100" title="Shuffle" onClick={() => { /* future */ }}>
              <Shuffle size={18} />
            </button>
            <button className="opacity-80 hover:opacity-100" title="Bài trước" onClick={prev}>
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10"
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button className="opacity-80 hover:opacity-100" title="Bài tiếp" onClick={next}>
              <SkipForward size={20} />
            </button>
            <button
              className={`opacity-80 hover:opacity-100 ${repeat !== "off" ? "text-violet-300" : ""}`}
              title={repeat === "one" ? "Lặp 1 bài" : repeat === "all" ? "Lặp danh sách" : "Tắt lặp"}
              onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")}
            >
              <Repeat size={18} />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(duration || 0))}
              value={Math.floor(currentTime || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-white"
            />
            <span className="text-xs tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* right: volume */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button className="opacity-80 hover:opacity-100" onClick={toggleMuted} title={isMuted ? "Bật âm thanh" : "Tắt âm"}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((isMuted ? 0 : volume) * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-28 accent-white"
          />
        </div>
      </div>
    </div>
  );
}