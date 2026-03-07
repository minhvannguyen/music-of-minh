// lib/local/recentlyPlayed.ts

import { SongApiResponse } from "@/types/song";

const KEY = "recently_played_songs";

export function addRecentlyPlayed(song : SongApiResponse) {
  if (!song) return;

  let list = getRecentlyPlayed();
  list = list.filter((s: SongApiResponse) => s.id !== song.id);
  list.unshift(song);

  if (list.length > 20) list = list.slice(0, 20);

  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRecentlyPlayed() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
