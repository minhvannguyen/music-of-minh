export interface Song {
  id: number;
  coverUrl?: string;
  fileUrl?: string;
  artistId?: number;
  artistName?: string;
  title: string;
  genreIds?: number[];
  genreNames?: string[];
  likes?: number;
  reposts?: number;
  views?: number;
  comments?: number;
  duration?: string;
  uploadedAt?: string;
  waveform?: number[];
  private: boolean;

  
}

// Request types cho Song API
export interface CreateSongRequest {
  title: string;
  artistId: number;
  artistName: string;
  genreIds?: number[]; // Đổi từ genreId? sang genreIds? (mảng)
  private: boolean;
  audioFile: File;
  coverImage: File;
  duration?: string; // Thêm trường duration (tùy chọn)
}

export interface UpdateSongRequest {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  genreIds?: number[]; // Đổi từ genreId? sang genreIds? (mảng)
  private: boolean;
  audioFile: File;
  coverImage: File;
  duration?: string; // Thêm trường duration (tùy chọn)
}

// Response types cho Song API
export interface SongResponse {
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
  artistId?: number;
  artistAvatar?: string;
  artistName: string;
  fileUrl: string;
  coverUrl: string;
  duration?: number | null;
  uploadedAt?: string;
  likes?: number;
  reposts?: number;
  comments?: number;
  views?: number;
  private?: boolean;
  genreIds?: number[] | [];
  genreNames?: string[] | []; // Sửa từ string sang string[]
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

export interface GetSongsByIdResponse {
  success: boolean;
  message: string;
  data: SongApiResponse;
  errors: null | unknown;
}

// Extended song interface cho page component
export interface SongDisplayData {
  songId: number;
  thumbnail: string;
  artistName: string;
  songTitle: string;
  genreName: string;
  artistAvatar: string;
  fileUrl: string;
  audioUrl: string;
}