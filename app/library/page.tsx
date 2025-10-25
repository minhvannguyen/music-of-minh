"use client";

import { useState } from "react";
import { MockProfile, ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";
import CreatePlaylistDialog from "@/components/cards/PlaylistDialog";


export default function Library() {
  const [activeFilter, setActiveFilter] = useState("playlistCreated");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Left Sidebar */}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className=" bg-background p-6 flex justify-between">
            {/* Filters */}
            <div className="flex justify-between">
              {ProfileFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`py-2 text-left px-6 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* playlist */}
          <div className="space-y-2">
            {activeFilter === "songFavorite" &&
              MockProfile.songs.map((song) => (
                <RenderSongList key={song.id} song={song} />
              ))}

            {activeFilter === "songUpload" &&
              MockProfile.songs.map((song) => (
                <RenderSongList key={song.id} song={song} />
              ))}

            {activeFilter === "playlistCreated" && (
              <div className="space-y-4">
                {/* Ô tạo playlist mới */}
                <CreatePlaylistDialog
      onCreate={(data) => {
        console.log("Playlist mới:", data);
      }}
    >
                <div
                  onClick={() => console.log("Open create playlist modal")}
                  className="flex items-center gap-4 p-2 rounded-xl cursor-pointer hover:bg-muted transition-all"
                >
                  {/* Ảnh giả lập (ô vuông có dấu +) */}
                  <div className="w-28 h-28 ml-2 flex items-center justify-center rounded-lg bg-muted-foreground/10 border border-muted-foreground/20">
                    <span className="text-4xl font-semibold text-muted-foreground">
                      +
                    </span>
                  </div>

                  {/* Thông tin playlist */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-base font-semibold text-foreground">
                      Tạo playlist mới
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bắt đầu tạo danh sách phát của riêng bạn
                    </p>
                  </div>
                </div>
                </CreatePlaylistDialog>

                {/* Danh sách playlist hiện có */}
                {MockProfile.playlists.map((playlist) => (
                  <RenderPlayList key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
