import { RefObject } from "react";

export interface NowPlayingCardProps {
  index: number;
  songId: number;
  videoUrl?: string;
  thumbnail?: string;
  artistName: string;
  songTitle: string;
  genreName: string;  
  artistAvatar: string;
  isLiked?: boolean;
  isFollowing?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  audioRef?: RefObject<HTMLAudioElement | null>;
  onComment?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onToggleMute?: () => void;
  onTogglePlay?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}
