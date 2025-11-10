import { RefObject } from "react";

export interface NowPlayingCardProps {
  videoUrl?: string;
  thumbnail?: string;
  artistName: string;
  songTitle: string;
  genreName: string;
  hashtags?: string[];
  musicInfo: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  artistAvatar: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  audioRef?: RefObject<HTMLAudioElement | null>;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onToggleMute?: () => void;
  onTogglePlay?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}
