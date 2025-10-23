"use client";

import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";
import { mockExplorePlaylistData, mockExploreSongData } from "@/mock/exploreData";
import React from "react";

export default function ExploreCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = React.use(params);

  // 🔍 Lấy dữ liệu từ file mock dựa trên slug
  const sectionSong = mockExploreSongData.find((s) => s.slug === category);
  const sectionPlaylist = mockExplorePlaylistData.find((s) => s.slug === category);

  // Nếu không tồn tại slug
  if (!sectionSong && !sectionPlaylist) {
    return <div className="p-8">Không tìm thấy danh mục</div>;
  }

  // Nếu là phần Playlist
  if (sectionPlaylist && category === "top100-playlists") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">{sectionPlaylist.title}</h1>
        <div className="flex flex-col gap-4">
          {sectionPlaylist.items.map((playlist) => (
            <RenderPlayList key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    );
  }

  // Ngược lại là phần Songs
  if (sectionSong) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">{sectionSong.title}</h1>
        <div className="flex flex-col gap-4">
          {sectionSong.items.map((song) => (
            <RenderSongList key={song.id} song={song} />
          ))}
        </div>
      </div>
    );
  }

  // Trường hợp còn lại (không khớp)
  return <div className="p-8">Không tìm thấy danh mục</div>;
}
