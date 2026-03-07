export const mockSearchResults = {
  songs: [
    {
      id: 1,
      title: "Yêu em thật đấy Remix",
      artistId: 101,
      artistName: "Duc Anh",
      fileUrl: "/mock/audio/yeu-em-that-day.mp3",
      coverUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      duration: 283, // 4:43
      uploadedAt: "6 months ago",
      likes: 7871,
      reposts: 117,
      comments: 59,
      views: 369000,
      private: false,
      genreIds: [1],
      genreNames: ["Drum & Bass"],
      waveform: [
        0.2, 0.8, 0.3, 0.9, 0.1, 0.7, 0.4, 0.6, 0.8, 0.2, 0.5, 0.9, 0.3, 0.7,
        0.1, 0.6, 0.4, 0.8, 0.2, 0.5,
      ],
    },
    {
      id: 2,
      title: "ANH ĐÃ KHÔNG BIẾT CÁCH YÊU EM - Quang Dang Tran - Tuanlamnhac",
      artistId: 102,
      artistName: "Quang Dang Tran",
      fileUrl: "/mock/audio/anh-da-khong-biet.mp3",
      coverUrl:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop",
      duration: 211, // 3:31
      uploadedAt: "3 months ago",
      likes: 30200,
      reposts: 830,
      comments: 187,
      views: 2440000,
      private: false,
      genreIds: [1],
      genreNames: ["Drum & Bass"],
      waveform: [
        0.1, 0.6, 0.4, 0.8, 0.2, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.1, 0.4, 0.7,
        0.2, 0.5, 0.9, 0.3, 0.6, 0.8,
      ],
    },
    {
      id: 3,
      title: "Anh nhớ Em người yêu cũ",
      artistId: 103,
      artistName: "Yêu Ca Hát",
      fileUrl: "/mock/audio/anh-nho-em.mp3",
      coverUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      duration: 277, // 4:37
      uploadedAt: "11 years ago",
      likes: 15000,
      reposts: 450,
      comments: 234,
      views: 890000,
      private: false,
      genreIds: [2],
      genreNames: ["Hanoirec"],
      waveform: [
        0.3, 0.7, 0.2, 0.6, 0.4, 0.8, 0.1, 0.5, 0.9, 0.2, 0.6, 0.3, 0.7, 0.4,
        0.8, 0.1, 0.5, 0.9, 0.2, 0.6,
      ],
    },
  ],

  playlists: [
    {
      id: 1,
      title: "Nhạc Việt Nam Hay Nhất 2024",
      creator: "Music Vietnam",
      trackCount: 25,
      followers: 12500,
      thumbnail:
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop",
      likes: 15000,
      reposts: 450,
    },
    {
      id: 2,
      title: "Lofi Chill Beats",
      creator: "Chill Music",
      trackCount: 18,
      followers: 8900,
      thumbnail:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop",
      likes: 15000,
      reposts: 450,
    },
  ],

  people: [
    {
      id: 1,
      name: "Duc Anh",
      username: "@ducanh",
      followers: 125000,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      isFollowing: false,
    },
    {
      id: 2,
      name: "Quang Dang Tran",
      username: "@quangdang",
      followers: 89000,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      isFollowing: true,
    },
  ],
};

export const searchFilters = [
  { id: "songs", label: "Bài hát", active: false },
  { id: "people", label: "Người dùng", active: false },
  { id: "playlists", label: "Playlists", active: false },
];
