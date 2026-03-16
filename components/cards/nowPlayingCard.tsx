"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  VolumeX,
  Volume2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  FolderPlus,
} from "lucide-react";
import Image from "next/image";
import ActionMore from "../ActionMore";
import useLikeSong from "@/hooks/useLikeSong";
import CommentPopup from "./CommentPopup";
import { toast } from "sonner";
import { playlistAPI } from "@/lib/api/playlistApi";
import { usePlayListContext } from "@/contexts/playListContext";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { SongApiResponse } from "@/types/song";
import { useFollow } from "@/hooks/useFollow";
import ReportDialog from "../ReportDialog";

export default function NowPlayingCard({ song }: { song: SongApiResponse }) {
  const {
    isPlaying,
    isMuted,
    audioRef,
    togglePlay,
    toggleMute,
    nextSong,
    prevSong,
  } = usePlayer();

  // const cardRef = useRef<HTMLDivElement>(null);

  const [showPlayIcon, setShowPlayIcon] = useState(false);
  // const timeoutRef = useRef<TimeoutRef | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  /** Handle click: toggle play + show play icon */
  const handleCardClick = () => {
    togglePlay?.();

    setShowPlayIcon(true);
  };

  // SHARE
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: song?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast("Đã sao chép liên kết!");
      }
    } catch {}
  };

  // COPY
  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast("Đã sao chép liên kết!");
  };

  // DOWNLOAD
  const handleDownload = async () => {
    if (!audioRef?.current?.src) return;

    const res = await fetch(audioRef.current.src);
    const blob = await res.blob();

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "music.mp3";
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // LIKE / PLAYLIST CONTEXT
  const { isLiked, likesCount, toggle } = useLikeSong(song?.id || 0);
  const { playlists, refreshPlaylists } = usePlayListContext();
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  // follow
  const { toggleFollow, isFollowing } = useFollow(song?.artistId);

  const handleAddToPlaylist = async (id: number) => {
    try {
      await playlistAPI.addSongToPlaylist(id, song?.id || 0);
      toast.success("Đã lưu vào playlist!");
      refreshPlaylists();
    } catch {
      toast.error("Bài hát đã có trong playlist!9");
    }
  };

  const [openReport, setOpenReport] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const buildFullUrl = (p?: string) => {
  if (!p) return "";

  // nếu đã là url đầy đủ
  if (p.startsWith("http")) return p;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // bỏ /api để lấy root server
  const baseUrl = apiUrl.replace(/\/api$/, "");

  return `${baseUrl}/${p.replace(/^\//, "")}`;
};

  if (!song) return null;

  return (
    <div
      // ref={cardRef}
      className="relative h-screen bg-background overflow-hidden cursor-pointer"
    >
      <div className="flex h-full">
        {/* LEFT SIDE */}
        <div className="w-full flex items-center justify-center">
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
            className="h-full aspect-square rounded-lg relative overflow-hidden"
          >
            {/* BACKGROUND BLUR IMAGE */}
            {song?.coverUrl && (
              <Image
                src={buildFullUrl(song.coverUrl)}
                alt="thumbnail"
                fill
                className="object-cover blur-xl scale-110 opacity-100"
                priority
              />
            )}

            {/* DARK OVERLAY (optional) */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* FOREGROUND IMAGE (clear) */}
            {song?.coverUrl && (
              <Image
                src={buildFullUrl(song.coverUrl)}
                alt="thumbnail"
                fill
                className="object-contain relative z-1"
                priority
              />
            )}

            {/* Overlay icons */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Play pause in center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div className="p-4 bg-black/50 rounded-full">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MUTE */}
            {isHovered && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute?.();
                }}
                className="absolute top-10 left-4 p-2 bg-black/40 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </motion.button>
            )}

            {/* Song info */}
            <motion.div className="absolute bottom-4 left-0 px-4 text-white w-full">
              {/* <h3 className="font-bold">@{artistName}</h3> */}
              <p className="text-sm">#{song.genreNames}</p>

              {/* Title + Wave */}
              {/* <div className="flex items-center gap-3 mt-2">
                <span className="font-bold text-xl">{songTitle}</span>

                <div className="flex items-end gap-[2px] h-6">
                  {audioData.map((level, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white w-[2px] rounded-full"
                      animate={{
                        height: isPlaying ? `${2 + level * 16}px` : "2px",
                      }}
                    />
                  ))}
                </div>
              </div> */}
            </motion.div>
          </motion.div>

          {/* RIGHT PANEL */}
          <div className="ml-6" onClick={(e) => e.stopPropagation()}>
            {/* Avatar + Follow */}
            <div className="relative w-12 aspect-square rounded-full mb-6">
              <Image
                src={buildFullUrl(song?.artistAvatar || "avatar/default.png")}
                alt=""
                fill
                className="object-cover rounded-full"
              />

              {/* Follow Button */}
              <button
                onClick={() => toggleFollow?.()}
                className="
      absolute bottom-0 right-0 
      translate-x-1/4 translate-y-1/4
      w-5 h-5 
      rounded-full 
      bg-red-500 
      text-white 
      flex items-center justify-center 
      text-sm font-bold
      shadow-md
      
    "
              >
                {isFollowing ? "✓" : "+"}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-6">
              {/* Like */}
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => toggle?.()}
                  className="p-3 rounded-full bg-gray-100"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked ? "text-red-500 fill-red-500" : ""
                    }`}
                  />
                </motion.button>
                <span className="text-xs">{formatNumber(likesCount)}</span>
              </div>

              {/* Comments */}
              <CommentPopup songId={Number(song?.id || 0)} />

              {/* Save */}
              <motion.button
                className="p-3 rounded-full bg-gray-100"
                onClick={() => setOpenSaveDialog(true)}
              >
                <FolderPlus className="w-6 h-6" />
              </motion.button>

              <ActionMore
                onShare={handleShare}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onReport={() => setOpenReport(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        <button
          onClick={() => prevSong?.()}
          className="p-2 bg-black/20 rounded-full"
        >
          <ChevronUp />
        </button>

        <button
          onClick={() => nextSong?.()}
          className="p-2 bg-black/20 rounded-full"
        >
          <ChevronDown />
        </button>
      </div>

      <SaveToPlaylistDialog
        open={openSaveDialog}
        onOpenChange={setOpenSaveDialog}
        playlists={playlists}
        onSelect={handleAddToPlaylist}
      />

      <ReportDialog
        open={openReport}
        onOpenChange={setOpenReport}
        targetId={song.id}
        targetType="song"
      />
    </div>
  );
}
