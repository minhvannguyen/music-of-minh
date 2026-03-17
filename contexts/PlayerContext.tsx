"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { SongApiResponse } from "@/types/song";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";

export type RepeatMode = "none" | "one" | "all";
export type PlaylistSource = "home" | "explore" | "playlist" | null;

interface PlayerContextType {
  playlist: SongApiResponse[];
  currentIndex: number;
  currentSong: SongApiResponse | null;

  isPlaying: boolean;
  isLoading: boolean;

  play: (index?: number) => void;
  pause: () => void;
  togglePlay: () => void;

  nextSong: () => void;
  prevSong: () => void;

  appendToPlaylist: (songs: SongApiResponse[]) => void;
  playFromPlaylist: (
    songs: SongApiResponse[],
    index: number,
    playlistId?: number,
  ) => void;
  forcePlaylist: (songs: SongApiResponse[], startIndex?: number) => void;

  progress: number;
  duration: number;
  seekTo: (time: number) => void;

  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  toggleMute: () => void;

  shuffle: boolean;
  toggleShuffle: () => void;

  repeat: RepeatMode;
  setRepeat: (mode: RepeatMode) => void;

  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // optional: preload
    audio.preload = "auto";

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const [playlist, setPlaylist] = useState<SongApiResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<SongApiResponse | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("none");

  const [isBusy, setIsBusy] = useState(false); // lock chuyển bài

  const playFromPlaylist = async (
    songs: SongApiResponse[],
    index: number,
    playlistId?: number,
  ) => {
    const song = songs[index];
    if (!song || !audioRef.current) return;

    setHasCountedView(false);

    if (playlistId) {
      setCurrentPlaylistId(playlistId);
      setHasCountedPlaylistView(false);
    }

    const audio = audioRef.current;

    try {
      setIsLoading(true);
      setIsPlaying(false);

      // 1️⃣ reset audio cũ
      audio.pause();
      audio.currentTime = 0;

      // 2️⃣ update state
      setPlaylist(songs);
      setCurrentIndex(index);
      setCurrentSong(song);

      // 3️⃣ set src ĐÚNG URL
      audio.src = buildFullUrl(song.fileUrl);
      audio.volume = isMuted ? 0 : volume;

      // 4️⃣ BẮT BUỘC
      audio.load();

      // 5️⃣ đợi audio ready
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          audio.removeEventListener("canplaythrough", onReady);
          resolve();
        };
        const onError = () => {
          audio.removeEventListener("error", onError);
          reject();
        };

        audio.addEventListener("canplaythrough", onReady);
        audio.addEventListener("error", onError);
      });

      // 6️⃣ play
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("playFromPlaylist error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const appendToPlaylist = (songs: SongApiResponse[]) => {
    setPlaylist((prev) => {
      // tránh append trùng (phòng API trả overlap)
      const existingIds = new Set(prev.map((s) => s.id));
      const unique = songs.filter((s) => !existingIds.has(s.id));
      return [...prev, ...unique];
    });
  };

  /** =========================
   *  ▶ PLAY FUNCTION
   *  ========================= */
  const buildFullUrl = (url: string) => {
  if (!url) return "";

  // đã là full URL
  if (url.startsWith("http")) return url;

  // nếu có env thì dùng
  const base = process.env.NEXT_PUBLIC_FILE_URL;

  if (base) {
    return `${base}${url}`;
  }

  // fallback (quan trọng)
  return url.startsWith("/") ? url : `/${url}`;
};

  const play = async (index?: number) => {
    const audio = audioRef.current;

    setHasCountedView(false);
    if (!audio) return;

    try {
      setIsLoading(true);

      // ========================
      // 1️⃣ RESUME (pause → play)
      // ========================
      if (
        index === undefined &&
        currentSong &&
        audio.src &&
        audio.currentTime > 0 &&
        audio.paused
      ) {
        await audio.play();
        setIsPlaying(true);
        return;
      }

      // ========================
      // 2️⃣ SWITCH / FIRST PLAY
      // ========================
      const song =
        index !== undefined ? playlist[index] : (currentSong ?? playlist[0]);

      if (!song) return;

      setCurrentSong(song);
      if (index !== undefined) setCurrentIndex(index);

      // stop old audio
      audio.pause();
      audio.currentTime = 0;

      // set source
      const src = buildFullUrl(song.fileUrl);
      if (!src) throw new Error("Invalid audio source");

      audio.src = src;
      audio.load();

      // wait until ready
      await new Promise<void>((resolve) => {
        const onCanPlay = () => {
          audio.removeEventListener("canplay", onCanPlay);
          resolve();
        };
        audio.addEventListener("canplay", onCanPlay);
        setTimeout(resolve, 800);
      });

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("playFromPlaylist error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /** =========================
   *  ⏸ PAUSE
   *  ========================= */
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    isPlaying ? pause() : play();
  };

  /** =========================
   *  ⏭ NEXT
   *  ========================= */
  const nextSong = () => {
    if (isBusy || playlist.length === 0) return;

    setIsBusy(true);

    let newIndex = currentIndex;

    if (shuffle) {
      // random nhưng tránh trùng bài
      do {
        newIndex = Math.floor(Math.random() * playlist.length);
      } while (newIndex === currentIndex);
    } else {
      if (currentIndex < playlist.length - 1) {
        newIndex = currentIndex + 1;
      } else if (repeat === "all") {
        newIndex = 0;
      } else {
        // không repeat → hết playlist → dừng
        setIsBusy(false);
        return;
      }
    }

    // update state
    setCurrentIndex(newIndex);
    setCurrentSong(playlist[newIndex]);

    // play đúng bài
    play(newIndex);

    setTimeout(() => setIsBusy(false), 300);
  };

  /** =========================
   *  ⏮ PREVIOUS
   *  ========================= */
  const prevSong = () => {
    if (isBusy || playlist.length === 0) return;

    setIsBusy(true);

    let newIndex = currentIndex;

    if (currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (repeat === "all") {
      newIndex = playlist.length - 1;
    } else {
      setIsBusy(false);
      return;
    }

    setCurrentIndex(newIndex);
    setCurrentSong(playlist[newIndex]);

    play(newIndex);

    setTimeout(() => setIsBusy(false), 300);
  };

  /** =========================
   *  🎵 END SONG EVENT
   *  ========================= */
  const [hasRepeatedOne, setHasRepeatedOne] = useState(false);

  const [hasCountedView, setHasCountedView] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<number | null>(
    null,
  );
  const [hasCountedPlaylistView, setHasCountedPlaylistView] = useState(false);

  const handleEnded = useCallback(() => {
    if (repeat === "all") {
      play(currentIndex);
      return;
    } else if (repeat === "one") {
      if (!hasRepeatedOne) {
        setHasRepeatedOne(true);
        play(currentIndex); // lặp lại đúng 1 lần
        return;
      } else {
        setHasRepeatedOne(false); // reset cho bài sau
        nextSong(); // sang bài mới
        return;
      }
    }
    nextSong();
  }, [repeat, hasRepeatedOne, currentIndex, nextSong]);

  const forcePlaylist = (songs: SongApiResponse[], startIndex = 0) => {
    if (songs.length === 0) return;

    setPlaylist(songs);
    setCurrentIndex(startIndex);
    setCurrentSong(songs[startIndex]);

    audioRef.current!.src = songs[startIndex].fileUrl;
    audioRef.current!.play().catch(() => {});
    setIsPlaying(false);
  };

  // Tạo audio element 1 lần
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }

      // Tính view: khi bài hát đã chạy được 30s hoặc 50% thời lượng thì tính là đã xem
      if (
        currentSong &&
        !hasCountedView &&
        ((audioRef.current?.currentTime &&
          audioRef.current.currentTime >= 30) ||
          (audioRef.current?.currentTime &&
            audioRef.current.currentTime >=
              (audioRef.current?.duration || 0) * 0.5))
      ) {
        songsAPI.incrementView(currentSong.id);
        setHasCountedView(true);
      }

      if (
        currentPlaylistId &&
        audio.currentTime >= 30 &&
        !hasCountedPlaylistView
      ) {
        playlistAPI.incrementView(currentPlaylistId);
        setHasCountedPlaylistView(true);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [currentSong, hasCountedView, currentPlaylistId, hasCountedPlaylistView]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [handleEnded]); // <= now always fresh

  /** =========================
   *  🎚 VOLUME
   *  ========================= */
  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    setIsMuted((m) => !m);
    if (audioRef.current) audioRef.current.volume = !isMuted ? 0 : volume;
  };

  /** =========================
   *  ⏩ SEEK
   *  ========================= */
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const value: PlayerContextType = {
    playlist,
    currentIndex,
    currentSong,

    isPlaying,
    isLoading,

    play,
    pause,
    togglePlay,

    nextSong,
    prevSong,

    audioRef,

    appendToPlaylist,
    playFromPlaylist,
    forcePlaylist,

    progress,
    duration,
    seekTo,

    volume,
    setVolume,
    isMuted,
    toggleMute,

    shuffle,
    toggleShuffle: () => setShuffle((s) => !s),

    repeat,
    setRepeat,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
};
