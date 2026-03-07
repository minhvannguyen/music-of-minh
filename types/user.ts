export interface User {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  followers?: number;
  following?: number;
  avatarUrl?: string;
  totalSongs?: number,
  totalPlaylists?: number,
  isFollowing?: boolean,
  bio?: string | null;
  role?: string;
  totalFollowers?: number;
  totalFollowing?: number;
}

// Type cho authentication context
export interface AuthUser {
  id?: number; // Thêm id để dùng cho update API
  username: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalFollowers?: number;
  totalFollowing?: number;
  totalSongs?: number;
  totalPlaylists?: number;
}