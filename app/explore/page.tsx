"use client";

import { useState } from "react";
import { Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mockExplorePlaylistData, mockExploreSongData } from "@/mock/exploreData";
import { Song } from "@/types/song";
import { ExploreSection } from "@/types/exploreSection";
import { PlayList } from "@/types/playList";

export default function Explore() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const router = useRouter(); 

  // phần này để hiển thị các danh sách bài hát như nghe gần đây, mới, top100
  const renderPlaylistCardSong = (item: Song) => (
    <div
      key={item.id}
      className="flex-shrink-0 w-48 cursor-pointer group"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="relative">
        {/* Thumbnail */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.thumbnail || ""}
            alt={item.songTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="192px"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <h3 className="text-foreground text-sm font-medium line-clamp-2 leading-tight truncate">
            {item.songTitle}
          </h3>
          {item.artistName && (
            <p className="text-muted-foreground text-xs mt-1">
              {item.artistName}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSongSection = (section: ExploreSection<Song>) => (
    <div key={section.title} className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground text-xl font-bold">{section.title}</h2>
        {section.showViewAll && (
          <button
            onClick={() => router.push(`/explore/${section.slug}`)}
            className="flex items-center gap-1 text-foreground hover:text-muted-foreground transition-colors text-sm"
          >
            <span>TẤT CẢ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-2">
        {section.items.map(renderPlaylistCardSong)}
      </div>
    </div>
  );

  //phần này hiển thị danh sách playlist
  const renderPlaylistCard = (item: PlayList) => (
    <div
      key={item.id}
      className="flex-shrink-0 w-48 cursor-pointer group"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="relative">
        {/* Thumbnail */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.thumbnail || ""}
            alt={item.title ||""}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="192px"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <h3 className="text-foreground text-sm font-medium line-clamp-2 leading-tight truncate">
            {item.title}
          </h3>
          {item.creator && (
            <p className="text-muted-foreground text-xs mt-1">
              {item.creator}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlaylistSection = (section: ExploreSection<PlayList>) => (
    <div key={section.title} className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground text-xl font-bold">{section.title}</h2>
        {section.showViewAll && (
          <button
            onClick={() => router.push(`/explore/${section.slug}`)}
            className="flex items-center gap-1 text-foreground hover:text-muted-foreground transition-colors text-sm"
          >
            <span>TẤT CẢ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-2">
        {section.items.map(renderPlaylistCard)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Khám Phá</h1>
          <p className="text-muted-foreground">
            Khám phá âm nhạc mới và playlist hay nhất
          </p>
        </div>

        {/* Explore Sections */}
        <div className="space-y-8">{mockExploreSongData.map(renderSongSection)}</div>
        <div className="space-y-8 mt-8">{mockExplorePlaylistData.map(renderPlaylistSection)}</div>
      </div>
    </div>
  );
}
