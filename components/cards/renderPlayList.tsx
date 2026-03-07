"use client";

import Image from "next/image";
import {
  Play,
  Edit,
  Trash2,
  Bookmark,
} from "lucide-react";
import UpdatePlaylistDialog from "@/components/cards/PlaylistDialog";
import { Playlist } from "@/types/playList";
import { playlistAPI } from "@/lib/api/playlistApi";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/authContext";

interface RenderPlayListProps {
  playlist: Playlist;
  refreshPlaylists?: () => void;
  onOpenPlaylist?: (playlist: Playlist) => void;
  onUpdatePlaylist?: (updated: Playlist) => void; 
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateWaveform = (seed: number) => {
  return Array.from({ length: 30 }, (_, i) => {
    const randomValue = seededRandom(seed + i);
    return Math.floor(randomValue * 20) + 5;
  });
};

export default function RenderPlayList({
  playlist,
  refreshPlaylists,
  onOpenPlaylist,
  onUpdatePlaylist,
}: RenderPlayListProps) {
  const waveform = generateWaveform(playlist.id || 0);
  const [showConfirm, setShowConfirm] = useState(false);

  const { user } = useAuthContext();

  const handleDelete = async () => {
    try {
      const res = await playlistAPI.deletePlaylist(playlist.id || 0);
      if (res?.status === 200 || res?.success) {
        toast.success("Xoá playlist thành công!");
        refreshPlaylists?.();
      } else {
        toast.error("Không thể xoá playlist!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xoá playlist!");
    } finally {
      setShowConfirm(false);
    }
  };

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  const [isSaved, setIsSaved] = useState(playlist.isSaved);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(playlist.isSaved);
  }, [playlist.isSaved]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // không mở playlist

    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu playlist!");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    // Optimistic update
    setIsSaved((prev) => !prev);

    try {
      const res = await playlistAPI.toggleSavePlaylist(playlist.id || 0);

      const newState = res.isSaved;

      setIsSaved(newState);

      toast.success(newState ? "Đã lưu playlist" : "Đã bỏ lưu playlist");

      onUpdatePlaylist?.({ ...playlist, isSaved: newState }); // cập nhật playlist ở parent
    } catch {
      // rollback nếu lỗi
      setIsSaved((prev) => !prev);
      toast.error("Có lỗi xảy ra!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="flex items-center gap-4 mx-16 p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
      onClick={() => onOpenPlaylist?.(playlist)} // ✔ emit sự kiện mở detail
    >
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={buildFullUrl(playlist.coverUrl || "")}
          alt={playlist.name || ""}
          fill
          className="object-cover rounded-lg"
          unoptimized={playlist.coverUrl?.includes("localhost")}
        />
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {playlist.name}
        </h3>

        <p className="text-muted-foreground text-xs">
          {playlist.songCount} bài hát • {playlist.totalViews} lượt nghe
        </p>

        {/* Actions */}
        <div
          className="flex items-center gap-3 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {playlist.userId === Number(user?.id) && (
            <>
              <UpdatePlaylistDialog
                mode="edit"
                playlist={playlist}
                refreshPlaylists={refreshPlaylists}
              >
                <button className="text-muted-foreground hover:text-foreground">
                  <Edit className="w-4 h-4" />
                </button>
              </UpdatePlaylistDialog>

              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Waveform */}
        <div className="flex items-end gap-[2px] mt-2">
          {waveform.map((v, i) => (
            <div
              key={i}
              className="bg-foreground/60 rounded-sm"
              style={{ width: "2px", height: `${v}px` }}
            />
          ))}
        </div>
      </div>

      <div onClick={handleToggleSave} className="cursor-pointer">
        <Bookmark
          className={`w-8 h-8 transition-colors ${
            isSaved
              ? "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground hover:text-foreground"
          } ${isSaving ? "opacity-50" : ""}`}
        />
      </div>

      {/* Confirm delete */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl w-[320px]">
            <h3 className="text-lg font-semibold mb-3">Xác nhận xoá</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Bạn chắc chắn muốn xoá <b>{playlist.name}</b>?
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
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
