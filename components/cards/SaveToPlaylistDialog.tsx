"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Bookmark } from "lucide-react";

import { Playlist } from "@/types/playList";

interface SaveToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlists: Playlist[];
  onSelect: (playlistId: number) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7114";

  const fixUrl = (url?: string | null) => {
    if (!url) return null;

    // Nếu đã phải URL đầy đủ → trả về luôn
    if (url.startsWith("https://") || url.startsWith("http://")) {
      return url;
    }

    // Nếu URL bắt đầu bằng /uploads
    if (url.startsWith("/")) {
      return `${API_BASE}${url}`;
    }

    // Nếu URL không có slash → thêm vào
    return `${API_BASE}/${url}`;
  };

export default function SaveToPlaylistDialog({
  open,
  onOpenChange,
  playlists,
  onSelect,
}: SaveToPlaylistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 rounded-xl overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-xl font-semibold">Lưu vào…</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto px-4 pb-4">
          {playlists.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Bạn chưa có playlist nào
            </p>
          )}

          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => onSelect(pl.id || 0)}
              className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {pl.coverUrl ? (
                    <Image
                      src={fixUrl(pl.coverUrl) || ""}
                      alt={pl.name || ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300"></div>
                  )}
                </div>

                <div className="text-left">
                  <p className="font-medium mb-1">{pl.name}</p>
                  <p className="text-xs text-muted-foreground">{pl.isPublic ? "Công khai" : "Riêng tư"}</p>
                </div>
              </div>

              <Bookmark className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
