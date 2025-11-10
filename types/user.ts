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
  isFollowing?: boolean,
  bio?: string | null;
}

// Type cho authentication context
export interface AuthUser {
  id?: number; // Thêm id để dùng cho update API
  username: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
  bio: string | null;
}