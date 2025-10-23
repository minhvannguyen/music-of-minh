export interface Song {
  id: number;
  thumbnail?: string;
  artistName?: string;
  songTitle: string;
  genre?: string;
  likes?: number;
  reposts?: number;
  plays?: number;
  comments?: number;
  duration?: string;
  uploadTime?: string;
  waveform?: number[];
}