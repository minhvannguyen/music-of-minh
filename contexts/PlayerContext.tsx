"use client";

import React, { createContext, useContext, useMemo, useRef, useState, useEffect, useCallback } from "react";

export type PlayerTrack = {
  id: number;
  songTitle: string;
  artistName: string;
  thumbnail?: string;
  audioUrl: string;
};

type RepeatMode = "off" | "one" | "all";

type PlayerContextValue = {
  // state
  queue: PlayerTrack[];
  currentIndex: number;
  current?: PlayerTrack;
  isPlaying: boolean;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  volume: number; // 0..1
  repeat: RepeatMode;
  // refs
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  // actions
  setQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  playAt: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  toggleMuted: () => void;
  setRepeat: (r: RepeatMode) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [queue, setQueueState] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const current = queue[currentIndex];

  // init single audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";

      const a = audioRef.current;
      const onLoaded = () => setDuration(a.duration || 0);
      const onTime = () => setCurrentTime(a.currentTime || 0);
      const onEnded = () => {
        if (repeat === "one") {
          a.currentTime = 0;
          a.play().catch(() => {});
          return;
        }
        if (currentIndex < queue.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else if (repeat === "all" && queue.length > 0) {
          setCurrentIndex(0);
        } else {
          setIsPlaying(false);
        }
      };

      a.addEventListener("loadedmetadata", onLoaded);
      a.addEventListener("timeupdate", onTime);
      a.addEventListener("ended", onEnded);

      return () => {
        a.removeEventListener("loadedmetadata", onLoaded);
        a.removeEventListener("timeupdate", onTime);
        a.removeEventListener("ended", onEnded);
        a.pause();
        a.src = "";
      };
    }
  }, [currentIndex, queue.length, repeat]);

  // load current track
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    a.src = current.audioUrl;
    a.muted = isMuted;
    a.volume = volume;
    a.load();

    // autoplay current if already in playing state
    if (isPlaying) {
      a.play().catch(() => setIsPlaying(false));
    }
  }, [current?.audioUrl]);

  // react to play/pause state
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.play().catch(() => setIsPlaying(false));
    } else {
      a.pause();
    }
  }, [isPlaying]);

  // react to mute/volume
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  const setQueue = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    setQueueState(tracks);
    setCurrentIndex(Math.max(0, Math.min(tracks.length - 1, startIndex)));
  }, []);

  const playAt = useCallback((index: number) => {
    if (index < 0 || index >= queue.length) return;
    setCurrentIndex(index);
    setIsPlaying(true);
  }, [queue.length]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(true);
    } else if (repeat === "all") {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [currentIndex, queue.length, repeat]);

  const prev = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const seek = useCallback((time: number) => {
    const a = audioRef.current;
    if (!a || Number.isNaN(time)) return;
    a.currentTime = Math.max(0, Math.min(duration || a.duration || 0, time));
    setCurrentTime(a.currentTime);
  }, [duration]);

  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);
  const setMuted = useCallback((m: boolean) => setIsMuted(m), []);
  const toggleMuted = useCallback(() => setIsMuted((m) => !m), []);

  const value = useMemo<PlayerContextValue>(() => ({
    queue, currentIndex, current,
    isPlaying, isMuted, duration, currentTime, volume, repeat,
    audioRef,
    setQueue, playAt, play, pause, togglePlay, next, prev, seek, setVolume, setMuted, toggleMuted, setRepeat,
  }), [queue, currentIndex, current, isPlaying, isMuted, duration, currentTime, volume, repeat]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}