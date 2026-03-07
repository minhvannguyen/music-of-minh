"use client";

import { useEffect, useState } from "react";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";
import { getRecentlyPlayed } from "@/lib/local/recentlyPlayed";
import { SongApiResponse } from "@/types/song";
import { Playlist } from "@/types/playList";
import PlaylistDetail from "@/components/PlaylistDetail";
import { useParams } from "next/navigation";

export default function ExploreCategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const [items, setItems] = useState<SongApiResponse[] | Playlist[]>([]);
  const [type, setType] = useState<"songApiResponse" | "playlist">();
  const [title, setTitle] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      switch (category) {
        case "recommended": {
          const res = await songsAPI.get25Songs();
          setItems(res.data.items);
          setType("songApiResponse");
          setTitle("Dành cho bạn");
          break;
        }
        case "new-songs": {
          const res = await songsAPI.getNewSongs();
          setItems(res.data.items);
          setType("songApiResponse");
          setTitle("Bài hát mới");
          break;
        }

        case "top-songs": {
          const res = await songsAPI.getTopSongs();
          setItems(res.data.items);
          setType("songApiResponse");
          setTitle("Top bài hát");
          break;
        }

        case "top-playlists": {
          const res = await playlistAPI.getTopPlaylists();
          setItems(res.data.items);
          setType("playlist");
          setTitle("Top playlist");
          break;
        }

        case "recently-played": {
          setItems(getRecentlyPlayed());
          setType("songApiResponse");
          setTitle("Nghe gần đây");
          break;
        }

        default:
          setTitle("Không tìm thấy danh mục");
      }
    }

    load();
  }, [category]);

  const removeSongLocal = (id: number) => {
    setItems((prev) => (prev as SongApiResponse[]).filter((s) => s.id !== id));
  };

  const updateSongLocal = (updatedSong: SongApiResponse) => {
    setItems((prev) =>
      (prev as SongApiResponse[]).map((song) =>
        song.id === updatedSong.id ? updatedSong : song,
      ),
    );
  };

  const updatePlaylistLocal = (updated: Playlist) => {
  setItems((prev) =>
    (prev as Playlist[]).map((pl) =>
      pl.id === updated.id ? updated : pl
    )
  );
};

  if (!items) return <div className="p-6">Đang tải...</div>;
  // Nếu đang xem chi tiết playlist
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mx-20 mt-8 font-bold mb-4">{title}</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) =>
          type === "songApiResponse" ? (
            <RenderSongList
              key={item.id}
              song={item as SongApiResponse}
              songs={items as SongApiResponse[]}
              onDeleted={removeSongLocal}
              onUpdated={updateSongLocal}
            />
          ) : (
            <RenderPlayList
              key={item.id}
              playlist={item as Playlist}
              onOpenPlaylist={(playlist) => setSelectedPlaylist(playlist)}
              onUpdatePlaylist={updatePlaylistLocal}
            />
          ),
        )}
      </div>
    </div>
  );
}
