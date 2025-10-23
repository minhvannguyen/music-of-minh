"use client";

import { useState } from "react";
import { MockProfile, ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";

export default function Search() {
  const [activeFilter, setActiveFilter] = useState("songUpload");

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
                <RenderSongList
                  key={song.id}
                  song={song}
            
                />
              ))}
            
            {activeFilter === "songUpload" &&
              MockProfile.songs.map((song) => (
                <RenderSongList
                  key={song.id}
                  song={song}
            
                />
              ))}

            {activeFilter === "playlistCreated" &&
              MockProfile.playlists.map((playlist) => (
                <RenderPlayList
                  key={playlist.id}
                  playlist={playlist}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
