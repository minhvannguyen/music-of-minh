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

// Request types cho Song API
export interface CreateSongRequest {
  title: string;
  artistId: number;
  genreIds?: number[]; // Đổi từ genreId? sang genreIds? (mảng)
  private: boolean;
  audioFile: File;
  coverImage: File;
  duration?: string; // Thêm trường duration (tùy chọn)
}

// Response types cho Song API
export interface CreateSongResponse {
  success: boolean;
  message: string;
  data?: Song;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Response types cho Genre API
export interface GetGenresResponse {
  success: boolean;
  message: string;
  data: Genre[];
}

// API Response types cho GetSongs với pagination
export interface SongApiResponse {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  fileUrl: string;
  coverUrl: string;
  duration: number | null;
  uploadedAt: string;
  views: number;
  private: boolean;
  genreIds: number[] | null;
  genreNames: string[] | null; // Sửa từ string sang string[]
}

export interface PaginatedSongsData {
  items: SongApiResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetSongsResponse {
  success: boolean;
  message: string;
  data: PaginatedSongsData;
  errors: null | unknown;
}

// Response type cho GetSongsByArtist (array trực tiếp, không paginated)
export interface GetSongsByArtistResponse {
  success: boolean;
  message: string;
  data: SongApiResponse[];
  errors: null | unknown;
}

// Extended song interface cho page component
export interface SongDisplayData {
  id: number;
  thumbnail: string;
  artistName: string;
  songTitle: string;
  genreName: string;
  hashtags: string[];
  musicInfo: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  artistAvatar: string;
  fileUrl: string;
  audioUrl: string;
}