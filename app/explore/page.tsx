"use client";

import { useEffect, useState } from "react";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import { getRecentlyPlayed } from "@/lib/local/recentlyPlayed";
import { mockRecommendedSongs } from "@/mock/recommendedSongs";
import { SongApiResponse } from "@/types/song";
import { Playlist } from "@/types/playList";
import { useRouter } from "next/navigation";
import ImageSlider from "@/components/ImageSlider";
import ExploreSongCard from "@/components/cards/ExploreSongCard";
import ExplorePlaylistCard from "@/components/cards/ExplorePlaylistCard";
import { useAuthContext } from "@/contexts/authContext";

export default function Explore() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [newSongs, setNewSongs] = useState<SongApiResponse[]>([]);
  const [topSongs, setTopSongs] = useState<SongApiResponse[]>([]);
  const [topPlaylists, setTopPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SongApiResponse[]>([]);
  const [recommended, setRecommended] = useState<SongApiResponse[]>([]);

  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const promises= [
          songsAPI.getNewSongs(),
          songsAPI.getTopSongs(),
          playlistAPI.getTopPlaylists(),
        ];

        // ✅ Chỉ thêm API recommended nếu đã đăng nhập
        if (isLoggedIn) {
          promises.unshift(songsAPI.get25Songs());
        }

        const responses = await Promise.all(promises);

        let indexOffset = 0;

        // ✅ Nếu có recommended
        if (isLoggedIn) {
          const recommendedRes = responses[0];
          setRecommended(recommendedRes?.data?.items || []);
          indexOffset = 1;
        }

        const newRes = responses[indexOffset];
        const topSongRes = responses[indexOffset + 1];
        const topPlaylistRes = responses[indexOffset + 2];

        setNewSongs(newRes?.data?.items || []);
        setTopSongs(topSongRes?.data?.items || []);
        setTopPlaylists(topPlaylistRes?.data?.items || []);

        setRecentlyPlayed(getRecentlyPlayed());
      } catch (err) {
        console.error("Explore load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoggedIn]); // 👈 thêm dependency

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="min-h-screen p-6 mx-14 space-y-10">
      <div className="">
        <ImageSlider />
      </div>

      {/* 🌟 Recommended */}
      {isLoggedIn && (
        <Section
          title="Gợi ý cho bạn"
          slug="recommended"
          items={recommended}
          type="song"
          router={router}
        />
      )}

      {/* 🔥 New Songs */}
      <Section
        title="Bài hát mới"
        slug="new-songs"
        items={newSongs}
        type="song"
        router={router}
      />

      {/* 🎵 Top Songs */}
      <Section
        title="Top bài hát"
        slug="top-songs"
        items={topSongs}
        type="song"
        router={router}
      />

      {/* 🎼 Top Playlists */}
      <Section
        title="Top playlist"
        slug="top-playlists"
        items={topPlaylists}
        type="playlist"
        router={router}
      />

      {/* 🎧 Recently Played */}
      <Section
        title="Nghe gần đây"
        items={recentlyPlayed}
        type="song"
        router={router}
      />
    </div>
  );
}

type SectionProps = {
  title: string;
  items: SongApiResponse[] | Playlist[];
  type: "song" | "playlist";
  slug?: string;
  router: ReturnType<typeof useRouter>;
};

function Section({ title, items, type, slug, router }: SectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>

        {slug && (
          <button
            className="text-sm hover:text-muted-foreground"
            onClick={() => router.push(`/explore/${slug}`)}
          >
            TẤT CẢ
          </button>
        )}
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item, index) =>
          type === "song" ? (
            <ExploreSongCard
              key={`song-${item.id}-${index}`}
              song={item as SongApiResponse}
              allSongs={items as SongApiResponse[]}
              playlistId={`explore-${slug ?? title}`}
            />
          ) : (
            <ExplorePlaylistCard
              key={`playlist-${item.id}-${index}`}
              playlist={item as Playlist}
            />
          ),
        )}
      </div>
    </div>
  );
}
