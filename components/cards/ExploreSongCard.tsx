"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { SongApiResponse } from "@/types/song";
import { usePlayer } from "@/contexts/PlayerContext";
import { useRouter } from "next/navigation";

export default function ExploreSongCard({
  song,
  allSongs,
}: {
  song: SongApiResponse;
  allSongs: SongApiResponse[];
  playlistId: string;
}) {
  const [hovered, setHovered] = useState(false);
  const {
  isPlaying,
  currentSong,
  togglePlay,
  playFromPlaylist,
} = usePlayer();

  const router = useRouter();

  const handleClickSongTitle = () => {
    const encoded = encodeURIComponent(JSON.stringify(allSongs));

    router.push(
      `/?playlist=${encoded}&songId=${song.id}`
    );
  };

  const buildFullUrl = (path?: string): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://localhost:7114${path.startsWith("/") ? "" : "/"}${path}`;
  };

const handlePlay = () => {
  if (currentSong?.id === song.id) {
    togglePlay();
    return;
  }

  const index = allSongs.findIndex(s => s.id === song.id);

  playFromPlaylist(
    allSongs,
    index
  );
};

  const isCurrentSong = currentSong?.id === song.id;

  return (
    <div
      className="flex-shrink-0 w-48 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative">
        {/* Thumbnail */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-muted">
          <Image
            src={buildFullUrl(song.coverUrl)}
            alt={song.title}
            fill
            sizes="192px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay Play/Pause */}
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <h3 className="text-base text-foreground font-medium line-clamp-2 hover:underline" onClick={handleClickSongTitle}>
            {song.title}
          </h3>

          {song.artistName && (
            <p className="text-xs text-muted-foreground mt-1">
              {song.artistName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
