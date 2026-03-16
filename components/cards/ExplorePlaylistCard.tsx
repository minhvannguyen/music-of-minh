"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Playlist } from "@/types/playList";

export default function ExplorePlaylistCard({
  playlist,
}: {
  playlist: Playlist;
}) {
  const [hovered, setHovered] = useState(false);

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  return (
    <Link href={`/playlist/${playlist.id}`}>
      <div
        className="flex-shrink-0 w-48 cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative">
          {/* Thumbnail */}
          <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-muted">
            <Image
              src={buildFullUrl(playlist.coverUrl ?? "")}
              alt={playlist.name ?? ""}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="192px"
            />

            {/* Play overlay */}
            <div
              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <Play className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="mt-3">
            <h3 className="text-lg text-foreground font-medium line-clamp-2">
              {playlist.name}
            </h3>

            {playlist.creator && (
              <p className="text-xs text-muted-foreground mt-1">
                {playlist.creator}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
