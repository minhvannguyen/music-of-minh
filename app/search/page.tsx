"use client";

import { useEffect, useState } from "react";
import RenderSongList from "@/components/cards/renderSongList";
import RenderPlayList from "@/components/cards/renderPlayList";
import RenderUserList from "@/components/cards/renderUserList";

import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import { userAPI } from "@/lib/api/userApi";
import { SongApiResponse } from "@/types/song";
import { Playlist } from "@/types/playList";
import { User } from "@/types/user";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/authContext";

export default function Search() {
  const [songs, setSongs] = useState<SongApiResponse[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [people, setPeople] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const type = searchParams.get("type") || "songs";
  const [activeFilter, setActiveFilter] = useState(type);

  const { user } = useAuthContext();

  useEffect(() => {
    if (!keyword.trim()) {
      setSongs([]);
      setPlaylists([]);
      setPeople([]);
      setHasSearched(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setHasSearched(true);

        // Reset trước khi search
        setSongs([]);
        setPlaylists([]);
        setPeople([]);

        if (activeFilter === "songs") {
          const res = await songsAPI.searchSongs(keyword, 1, 20);
          setSongs(res?.items ?? []);
        }

        if (activeFilter === "playlists") {
          const res = await playlistAPI.searchPlaylists(
            keyword,
            user?.id ?? 0,
            1,
            20
          );
          setPlaylists(res?.data ?? []);
        }

        if (activeFilter === "people") {
          const res = await userAPI.searchUsers(keyword, 1, 20);
          setPeople(res?.data ?? []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter, keyword]);

  // Kiểm tra có kết quả không
  const isEmptyResult =
    hasSearched &&
    !loading &&
    ((activeFilter === "songs" && songs.length === 0) ||
      (activeFilter === "playlists" && playlists.length === 0) ||
      (activeFilter === "people" && people.length === 0));

  return (
    <div className="min-h-screen max-w-6xl mx-auto bg-background text-foreground">
      <div className="flex">
        <div className="flex-1 p-6">
          {/* FILTERS */}
          <div className="bg-background p-6 ml-10 flex gap-3">
            {["songs", "playlists", "people"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-2 px-6 rounded-lg transition-colors ${
                  activeFilter === filter
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}
          <div className="mb-6 ml-16 mr-20">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-3 rounded-lg bg-muted text-foreground outline-none"
            />
          </div>

          {/* RESULTS */}
          <div className="space-y-2 mt-6">
            {loading && (
              <p className="text-center text-muted-foreground">
                Đang tìm kiếm...
              </p>
            )}

            {/* SONGS */}
            {!loading &&
              activeFilter === "songs" &&
              songs?.map((song) => (
                <RenderSongList key={song.id} song={song} songs={songs} />
              ))}

            {/* PLAYLISTS */}
            {!loading &&
              activeFilter === "playlists" &&
              playlists?.map((playlist) => (
                <RenderPlayList key={playlist.id} playlist={playlist} />
              ))}

            {/* PEOPLE */}
            {!loading &&
              activeFilter === "people" &&
              people?.map((user) => (
                <RenderUserList key={user.id} user={user} />
              ))}

            {/* EMPTY RESULT MESSAGE */}
            {isEmptyResult && (
              <p className="text-center text-muted-foreground py-8">
                Không tìm thấy kết quả
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}