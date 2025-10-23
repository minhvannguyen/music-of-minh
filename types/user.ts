export interface User {
  id: number;
  name?: string;
  userName?: string;
  email?: string;
  followers?: number;
  following?: number;
  avatar?: string;
  totalSongs?: number,
  totalPlaylists?: number,
  isFollowing?: boolean
}