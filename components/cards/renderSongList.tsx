"use client";

import Image from "next/image";
import { Play, Heart, FolderPlus, Edit, Trash2, Pause } from "lucide-react";
import { SongApiResponse } from "@/types/song";
import { useState } from "react";
import { toast } from "sonner";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import EditSongDialog from "./EditSongDialog";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog";
import { usePlayListContext } from "@/contexts/playListContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/authContext";
import ActionMore from "../ActionMore";
import ReportDialog from "../ReportDialog";
import useLikeSong from "@/hooks/useLikeSong";

interface RenderSongListProps {
  song: SongApiResponse;
  songs: SongApiResponse[];
  playlistId?: number;
  onDeleted?: (id: number) => void;
  onUpdated?: (updatedSong: SongApiResponse) => void;
  refreshSongs?: () => void;
}

// Format number for display (1K, 1M, etc.)
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Generate waveform ngẫu nhiên với độ dài và pattern khác nhau cho mỗi bài hát
const generateRandomWaveform = (songId: number): number[] => {
  // Sử dụng songId như seed để mỗi bài hát có waveform nhất quán
  const seed = songId;

  // Độ dài ngẫu nhiên từ 20 đến 50 bars
  const length = 20 + (seed % 31);

  // Tạo số ngẫu nhiên nhất quán dựa trên seed
  const random = (offset: number) => {
    const x = Math.sin((seed + offset) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const waveform: number[] = [];

  // Pattern hiện đại: kết hợp nhiều sóng với animation style
  for (let i = 0; i < length; i++) {
    // Base height từ nhiều sóng kết hợp
    const wave1 = Math.sin(i * 0.3 + seed * 0.1) * 0.3;
    const wave2 = Math.sin(i * 0.5 + seed * 0.2) * 0.2;
    const wave3 = Math.sin(i * 0.8 + seed * 0.3) * 0.15;

    // Thêm peaks ngẫu nhiên
    const peakChance = random(i * 2);
    const isPeak = peakChance > 0.7; // 30% chance có peak
    const peakHeight = isPeak ? 0.4 + random(i) * 0.4 : 0;

    // Kết hợp các sóng
    let height = 0.25 + wave1 + wave2 + wave3 + peakHeight;

    // Thêm variation ngẫu nhiên
    const variation = (random(i * 3) - 0.5) * 0.1;
    height += variation;

    // Đảm bảo trong khoảng hợp lý
    height = Math.max(0.15, Math.min(0.95, height));

    waveform.push(height);
  }

  return waveform;
};

const renderWaveform = (waveform: number[], songId: number) => {
  // Sử dụng waveform từ prop nếu có, nếu không thì generate mới
  const displayWaveform =
    waveform.length > 0 ? waveform : generateRandomWaveform(songId);

  return (
    <div className="flex items-center gap-[2px] h-5 min-w-[120px] max-w-[300px]">
      {displayWaveform.map((height, index) => {
        // Tạo màu gradient hiện đại dựa trên height và vị trí
        const normalizedHeight = height;
        const isAccent = normalizedHeight > 0.65 || index % 7 === 0;
        const isMid = normalizedHeight > 0.45 && normalizedHeight <= 0.65;

        // Màu sắc hiện đại với gradient
        let backgroundColor: string;
        if (isAccent) {
          // Peak cao - màu đỏ/cam nóng
          backgroundColor = `hsl(${
            340 + (normalizedHeight - 0.65) * 60
          }, 70%, ${50 + normalizedHeight * 30}%)`;
        } else if (isMid) {
          // Mid range - màu xanh dương
          backgroundColor = `hsl(${
            200 + (normalizedHeight - 0.45) * 40
          }, 65%, ${45 + normalizedHeight * 25}%)`;
        } else {
          // Thấp - màu xám với tint nhẹ
          backgroundColor = `hsl(0, 0%, ${35 + normalizedHeight * 40}%)`;
        }

        // Độ rộng và height động
        const barWidth = isAccent ? "4px" : "3px";
        const barHeight = Math.max(normalizedHeight * 100, 20); // Tối thiểu 20%

        return (
          <div
            key={index}
            className="rounded-sm transition-all duration-300 ease-out"
            style={{
              width: barWidth,
              minHeight: "4px",
              height: `${barHeight}%`,
              backgroundColor: backgroundColor,
              // Thêm shadow nhẹ cho depth
              boxShadow: isAccent ? `0 0 4px ${backgroundColor}` : "none",
              // Animation khi hover
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        );
      })}
    </div>
  );
};

// Format uploadedAt sang readable date
const formatUploadTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  } catch {
    return dateString;
  }
};

export default function RenderSongList({
  song,
  songs,
  playlistId,
  onDeleted,
  onUpdated,
  refreshSongs,
}: RenderSongListProps) {
  const [imageError, setImageError] = useState(false);
  const { currentSong, audioRef, isPlaying, togglePlay, playFromPlaylist } =
    usePlayer();
  const { isLiked, likesCount, toggle } = useLikeSong(song?.id || 0);
  const { user } = useAuthContext();

  const [openReport, setOpenReport] = useState(false);

  const router = useRouter();

  const handleClickSongTitle = () => {
    const encoded = encodeURIComponent(JSON.stringify(songs));

    router.push(`/?playlist=${encoded}&songId=${song.id}`);
  };

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  const handlePlay = (song: SongApiResponse) => {
    // Nếu bài đang click là bài đang phát → toggle play/pause
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    // Build danh sách đúng format PlayerContext
    const list = songs.map((s) => ({
      id: s.id,
      title: s.title,
      artistName: s.artistName ?? "Unknown",
      coverUrl: buildFullUrl(s.coverUrl),
      fileUrl: buildFullUrl(s.fileUrl),
    }));

    // Tìm index của bài vừa click
    const index = list.findIndex((x) => x.id === song.id);

    // Set queue + phát bài tương ứng
    playFromPlaylist(list, index, playlistId); // Có thể truyền playlistId nếu muốn
  };

  // Kiểm tra nếu là localhost URL
  const isLocalhost = song.coverUrl?.includes("localhost");

  const [showConfirm, setShowConfirm] = useState(false);
  const handleDelete = async () => {
    try {
      if (playlistId !== undefined) {
        // 👉 Xoá khỏi playlist
        await playlistAPI.removeSongFromPlaylist(playlistId, song.id);
      } else {
        // 👉 Xoá bài khỏi hệ thống
        await songsAPI.deleteSong(song.id);
      }

      // cập nhật lại danh sách:
      onDeleted?.(song.id || 0);
      refreshSongs?.();
      setShowConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSong, setSelectedSong] = useState(song);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const { playlists, refreshPlaylists } = usePlayListContext();

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!song?.id) {
      toast.error("Không có bài hát để lưu.");
      setOpenSaveDialog(false);
      return;
    }

    try {
      await playlistAPI.addSongToPlaylist(playlistId, song.id);

      toast.success("Đã lưu vào playlist!");
      await refreshPlaylists();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      };

      const message =
        error.response?.data?.message ?? "Có lỗi khi lưu vào playlist.";

      toast.error(message);
    } finally {
      setOpenSaveDialog(false);
    }
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

  // return (
  //   <div className="space-y-3">
  //     {songs.map((song) => {
  const isCurrentSong = currentSong?.id === song.id;
  return (
    <div
      key={song.id}
      className="flex items-center p-4 mx-16 gap-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      {/* Thumbnail */}
      <div
        className="relative w-28 h-28 flex-shrink-0 bg-muted rounded-lg"
        onClick={() => handlePlay(song)}
      >
        {song.coverUrl && !imageError ? (
          <Image
            src={buildFullUrl(song.coverUrl)}
            alt={song.title}
            fill
            className="object-cover rounded-lg"
            sizes="112px"
            unoptimized={isLocalhost} // Tắt optimization cho localhost
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 rounded-lg">
            <span className="text-2xl">🎵</span>
          </div>
        )}
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          {isCurrentSong && isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="text-foreground font-medium text-lg truncate hover:underline cursor-pointer"
            onClick={handleClickSongTitle}
          >
            {song.title}
          </h3>
          {song.genreNames && (
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
              {song.genreNames.join(", ")}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-2">{song.artistName}</p>

        {/* Waveform với kiểu hiện đại */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 overflow-hidden">
            {renderWaveform([], song.id)}
          </div>
          {/* {song.duration && (
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {song.duration}
            </div>
          )} */}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle?.();
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? "text-red-500 fill-red-500" : ""
              }`}
            />
            <span className="text-sm">{formatNumber(likesCount)}</span>
          </button>

          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpenSaveDialog(true)}
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          {song.artistId === Number(user?.id) && (
            <>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(song);
                  setOpenEdit(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>{" "}
            </>
          )}

          <ActionMore
            onShare={handleShare}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onReport={() => setOpenReport(true)}
            buttonClassName="text-muted-foreground hover:text-foreground transition-colors bg-transparent p-1"
            iconClassName="w-4 h-4"
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="text-right text-muted-foreground text-sm">
        <div className="mb-1">{formatUploadTime(song.uploadedAt || "")}</div>
        <div className="flex items-center gap-1 mb-1">
          <Play className="w-3 h-3" />
          <span>{formatNumber(song.views || 0)}</span>
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl w-[320px]">
            <h3 className="text-lg font-semibold mb-3">
              {playlistId ? "Xoá khỏi playlist" : "Xoá bài hát"}
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              {playlistId ? (
                <>
                  Bạn có chắc muốn xoá <b>{song.title}</b> khỏi playlist?
                </>
              ) : (
                <>
                  Bạn có chắc muốn xoá vĩnh viễn <b>{song.title}</b>?
                </>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/70"
              >
                Huỷ
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
      <EditSongDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        songId={selectedSong?.id}
        onUpdated={(updatedSong) => {
          onUpdated?.(updatedSong);
        }}
        refreshSongs={refreshSongs}
      />
      <SaveToPlaylistDialog
        open={openSaveDialog}
        onOpenChange={setOpenSaveDialog}
        playlists={playlists} // truyền từ props cha
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
  //   })}
  // </div>
  // );
}
