"use client";

import Image from "next/image";
import { Play, Edit, Trash2, Music2 } from "lucide-react";
import { Playlist } from "@/types/playList";
import RenderSongList from "./cards/renderSongList";
import { useEffect, useState } from "react";
import { playlistAPI } from "@/lib/api/playlistApi";
import { toast } from "sonner";
import { usePlayListContext } from "@/contexts/playListContext";
import { SongApiResponse } from "@/types/song";
import UpdatePlaylistDialog from "@/components/cards/PlaylistDialog";
import { useAuthContext } from "@/contexts/authContext";
import MusicEqualizer from "./MusicEqualizer";
import { usePlayer } from "@/contexts/PlayerContext";

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
}

export default function PlaylistDetail({
  playlist,
  onBack,
}: PlaylistDetailProps) {
  const { user } = useAuthContext();

  const { playFromPlaylist } = usePlayer();
  // local copy of playlist that we can update
  const [playlistLocal, setPlaylistLocal] = useState<Playlist>(playlist);

  // keep local playlist in sync if parent passes a different playlist object later
  useEffect(() => {
    setPlaylistLocal(playlist);
  }, [playlist]);

  const [songs, setSongs] = useState<SongApiResponse[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const { refreshPlaylists } = usePlayListContext();

  // ==========================
  // FETCH SONGS OF PLAYLIST
  // ==========================
  const fetchSongs = async (playlistId?: number | string) => {
    const id = playlistId ?? playlistLocal?.id;
    if (!id) return;

    setIsLoadingSongs(true);

    try {
      const res = await playlistAPI.getSongsInPlaylist(id as number);

      if (res?.status === 200 && Array.isArray(res.data)) {
        setSongs(res.data);
      } else {
        console.warn("getSongsInPlaylist returned unexpected:", res);
        toast.error("Không tải được danh sách bài hát.");
      }
    } catch (err) {
      console.error("fetchSongs error:", err);
      toast.error("Lỗi khi tải danh sách bài hát.");
    } finally {
      setIsLoadingSongs(false);
    }
  };

  useEffect(() => {
    // load songs when local playlist id becomes available
    if (playlistLocal?.id) {
      fetchSongs(playlistLocal.id);
    }
  }, [playlistLocal?.id]);

  // ==========================
  // DELETE PLAYLIST
  // ==========================
  const handleDeletePlaylist = async () => {
    try {
      const res = await playlistAPI.deletePlaylist(playlistLocal.id || 0);

      if (res?.status === 200 || res?.success) {
        toast.success("Đã xoá playlist thành công!");
        await refreshPlaylists();
        onBack();
      } else {
        console.warn("deletePlaylist unexpected:", res);
        toast.error("Không thể xoá playlist!");
      }
    } catch (err) {
      console.error("handleDeletePlaylist error:", err);
      toast.error("Lỗi khi xoá playlist!");
    } finally {
      setShowDelete(false);
    }
  };

  // ==========================
  // HANDLE UPDATE FROM DIALOG
  // ==========================
  const handleUpdatePlaylist = async (
    updated: Partial<Playlist> | Playlist,
  ) => {
    console.log("handleUpdatePlaylist called with:", updated);

    // merge optimistic
    setPlaylistLocal((prev) => ({
      ...(prev ?? {}),
      ...(updated ?? {}),
    }));

    // try to refresh playlists list in context
    try {
      await refreshPlaylists();
    } catch (e) {
      console.warn("refreshPlaylists failed:", e);
    }

    // best-effort: if API returned full updated object (id,name,coverUrl,...), use it
    // otherwise try to re-fetch playlist detail from backend if api provides it
    if (!("coverUrl" in (updated ?? {})) || !("name" in (updated ?? {}))) {
      // optional: if you have endpoint to fetch single playlist by id, call it
      try {
        if (playlistLocal?.id) {
          const r = await playlistAPI.getById(playlistLocal.id);
          if (r?.status === 200 && r.data) {
            setPlaylistLocal(r.data);
          }
        }
      } catch (e) {
        console.warn("Refetch playlist detail failed:", e);
      }
    }
  };

  const handlePlayAll = () => {
  if (!songs.length) {
    toast.error("Playlist chưa có bài hát.");
    return;
  }

  playFromPlaylist(songs, 0, playlistLocal?.id);
};

const shuffleArray = (array: SongApiResponse[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const handlePlayRandom = () => {
  if (!songs.length) {
    toast.error("Playlist chưa có bài hát.");
    return;
  }

  const shuffled = shuffleArray(songs);
  playFromPlaylist(shuffled, 0, playlistLocal?.id);
};

  // Helper function để build full URL
  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  const isOwner = user && playlistLocal && Number(user.id) === Number(playlistLocal.userId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex justify-center items-start gap-6 p-6 rounded-xl bg-muted/40 border mb-6">
        {/* Thumbnail Playlist */}
        <div className="relative w-40 h-40 ml-8 mr-6 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {playlistLocal?.coverUrl ? (
            <Image
              src={buildFullUrl(playlistLocal.coverUrl)}
              alt={playlistLocal.name || ""}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Music2 className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold mb-2">{playlistLocal?.name}</h1>
            <span className="bg-muted text-muted-foreground px-2 py-1 mb-2 rounded-full text-xs">
              {playlistLocal?.isPublic ? "Công khai" : "Riêng tư"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mb-6">
            • {songs.length} bài hát • {playlistLocal?.totalViews ?? 0} lượt
            nghe
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-4 mt-8">
            <button className="px-5 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/80" onClick={handlePlayAll}>
              <Play className="w-4 h-4" />
              Phát tất cả
            </button>
            <button className="px-5 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/80" onClick={handlePlayRandom}>
              <Play className="w-4 h-4" />
              Phát ngẫu nhiên
            </button>
            {isOwner && (
              <>
                <UpdatePlaylistDialog
                  mode="edit"
                  playlist={playlistLocal}
                  onUpdate={handleUpdatePlaylist}
                  refreshPlaylists={refreshPlaylists}
                >
                  <button className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2 hover:bg-muted/60">
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                </UpdatePlaylistDialog>

                <button
                  onClick={() => setShowDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Xoá playlist
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - empty for now, can put additional actions or info here later */}
        <MusicEqualizer />

        {/* LEFT SIDE - Back button */}
        <div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/70 mb-4 mr-8"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* SONG LIST */}
      <div className="space-y-2">
        {isLoadingSongs ? (
          <p className="text-center text-muted-foreground py-8">
            Đang tải danh sách bài hát...
          </p>
        ) : songs.length > 0 ? (
          songs.map((s) => (
            <RenderSongList
              key={s.id}
              song={s}
              songs={songs}
              playlistId={playlistLocal?.id}
              refreshSongs={fetchSongs}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Playlist này chưa có bài hát nào.
          </p>
        )}
      </div>

      {/* DELETE CONFIRM */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-[320px]">
            <h3 className="text-lg font-semibold mb-3">Xoá Playlist?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Bạn có chắc chắn muốn xoá playlist
              <b> {playlistLocal?.name}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 bg-muted rounded-lg"
              >
                Huỷ
              </button>

              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
