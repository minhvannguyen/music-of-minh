export interface Like {
  id: number;
  userId: number;
  targetType: string; // 'song' | 'playlist' | etc.
  targetId: number;
  createdAt: string;
}
export interface LikeToggleRequest {
  userId: number;
  targetType: string; // 'song' | 'playlist' | etc.
  targetId: number;
}
export interface IsLikedResponse {
  isLiked: boolean;
}
export interface GetLikesCountResponse {
  status: number;
  count: number;
}
