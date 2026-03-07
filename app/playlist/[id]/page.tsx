"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { playlistAPI } from "@/lib/api/playlistApi";
import PlaylistDetail from "@/components/PlaylistDetail";
import { Playlist } from "@/types/playList";
import { toast } from "sonner";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) return;

    const fetchPlaylist = async () => {
      try {
        const res = await playlistAPI.getById(id);

        if (res) {
          setPlaylist(res);
        } else {
          setPlaylist(null);
          toast.error("Không tìm thấy playlist.");
        }
      } catch (error) {
        console.error("Fetch playlist error:", error);
        toast.error("Lỗi khi tải playlist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-20">Đang tải playlist...</div>;
  }

  if (!playlist) {
    return <div className="text-center py-20">Playlist không tồn tại.</div>;
  }

  return (
    <PlaylistDetail
      playlist={playlist}
      onBack={() => router.back()}
    />
  );
}