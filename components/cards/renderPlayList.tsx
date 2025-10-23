"use client";

import Image from "next/image";
import { Play, Heart, Share2, FolderPlus, MoreHorizontal, Album } from "lucide-react";
import { PlayList } from "@/types/playList";

interface RenderPlayListProps {
  playlist: PlayList;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export default function RenderPlayList({
  playlist,
}: RenderPlayListProps) {
  return (
    <div
      key={playlist.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={playlist.thumbnail || ""}
          alt={playlist.title || ""}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {playlist.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-1">
          by {playlist.creator}
        </p>
        <p className="text-muted-foreground text-xs">
          {playlist.trackCount} tracks • {formatNumber(playlist.followers || 0)}{" "}
          followers
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{formatNumber(playlist.likes || 0)}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(playlist.reposts || 0)}</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <FolderPlus className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Album className="mr-2" size={34} />
    </div>
  );
}
