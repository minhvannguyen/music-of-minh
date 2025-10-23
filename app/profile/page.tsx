"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "@/components/EditProfileDialog";
import { MockProfile, ProfileFilters } from "@/mock/profileData";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";

export default function ProfilePage() {

  const [activeFilter, setActiveFilter] = useState("songUpload");

  const [user, setUser] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    totalSongs: 28,
    totalPlaylists: 5,
    followers: 122,
    following: 80,
    avatar: "/default-avatar.png",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSave = (updatedUser: { name: string; email: string; avatar: string }) => {
    setUser((prev) => ({
      ...prev,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    }));
  };

  const playlists = [
    { id: 1, title: "Chill buổi tối", cover: "/covers/chill.jpg", songCount: 12 },
    { id: 2, title: "Rap Việt🔥", cover: "/covers/rap.jpg", songCount: 8 },
    { id: 3, title: "Nhạc yêu thích", cover: "/covers/fav.jpg", songCount: 15 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Thông tin người dùng */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
          <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
        </div>
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>

        <div className="flex flex-wrap justify-center gap-6 text-sm mt-3 text-muted-foreground">
          <p>🎵 Bài hát: <span className="text-foreground font-medium">{user.totalSongs}</span></p>
          <p>📁 Playlist: <span className="text-foreground font-medium">{user.totalPlaylists}</span></p>
          <p>👥 Người theo dõi: <span className="text-foreground font-medium">{user.followers}</span></p>
          <p>👥 Đang theo dõi: <span className="text-foreground font-medium">{user.following}</span></p>
        </div>

        <Button className="mt-4" onClick={() => setIsEditOpen(true)}>
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      {/* Playlist đã tạo */}
      <div className="bg-muted p-6 rounded-2xl shadow-md flex-1">
        {/* Filters */}
        <div className="flex ml-4">
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
        {/* profile playlist */}
        <div className="space-y-2 mt-8">
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

      {/* Popup chỉnh sửa hồ sơ */}
      <EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSave={handleSave}
      />
    </div>
  );
}
