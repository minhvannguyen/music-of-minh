"use client";

import Image from "next/image";
import { Play, Heart, Share2, FolderPlus, MoreHorizontal } from "lucide-react";
import { Song } from "@/types/song";

interface RenderSongListProps {
  song: Song;
  
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const renderWaveform = (waveform: number[]) => {
  return (
    <div className="flex items-center gap-1 h-4">
      {waveform.map((height, index) => (
        <div
          key={index}
          className="bg-muted-foreground rounded-sm"
          style={{
            width: "2px",
            height: `${height * 100}%`,
            backgroundColor:
              index % 4 === 0 ? "#ff6b6b" : "hsl(var(--muted-foreground))",
          }}
        />
      ))}
    </div>
  );
};

export default function RenderSongList({
  song,
}: RenderSongListProps) {
  return (
    <div
      key={song.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={song.thumbnail || ""}
          alt={song.songTitle}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-foreground font-medium text-lg truncate">
            {song.songTitle}
          </h3>
          {song.genre && (
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
              {song.genre}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-2">{song.artistName}</p>

        {/* Waveform */}
        <div className="flex mb-2">
          <div>{renderWaveform(song.waveform || [])}</div>
          <div className="ml-4 text-xs text-muted-foreground">
            {song.duration}
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.likes || 0)}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.reposts || 0)}</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <FolderPlus className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-right text-muted-foreground text-sm">
        <div className="mb-1">{song.uploadTime}</div>
        <div className="flex items-center gap-1 mb-1">
          <Play className="w-3 h-3" />
          <span>{formatNumber(song.plays || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{song.comments}</span>
        </div>
      </div>
    </div>
  );
}
