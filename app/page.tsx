"use client";

import NowPlayingCard from "@/components/cards/nowPlayingCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { songsAPI } from "@/lib/api";
import { SongDisplayData, SongApiResponse } from "@/types/song";
import { api } from "@/lib/api";


export default function Home() {
  const [songs, setSongs] = useState<SongDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [savedSongs, setSavedSongs] = useState<Set<number>>(new Set());
  const [following, setFollowing] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  
  // Wheel scroll accumulation
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelThreshold = 100;
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSong = songs[currentIndex];

  // Helper function để build full URL
  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  // Map API response to display format
  const mapApiSongToDisplay = (apiSong: SongApiResponse): SongDisplayData => {
    return {
      id: apiSong.id,
      thumbnail: buildFullUrl(apiSong.coverUrl) || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
      artistName: apiSong.artistName,
      songTitle: apiSong.title,
      genreName: apiSong.genreNames && apiSong.genreNames.length > 0 
        ? apiSong.genreNames.join(", ") 
        : "", // Join array thành string
      hashtags: [],
      musicInfo: "Music 🎧",
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      artistAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      fileUrl: apiSong.fileUrl,
      audioUrl: buildFullUrl(apiSong.fileUrl),
    };
  };

  // Fetch songs from API với pagination
  const fetchSongs = useCallback(async (page: number, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await songsAPI.getSongs(page, 20);
      if (response.success && response.data && response.data.items) {
        const mappedSongs = response.data.items.map(mapApiSongToDisplay);
        
        if (append) {
          // Append vào danh sách hiện tại
          setSongs(prev => [...prev, ...mappedSongs]);
        } else {
          // Replace danh sách (lần load đầu)
          setSongs(mappedSongs);
        }

        // Update pagination state
        setHasNextPage(response.data.hasNextPage);
        setCurrentPage(page);
      } else {
        console.error("Failed to fetch songs:", response.message);
        if (!append) {
          setSongs([]);
        }
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      if (!append) {
        setSongs([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Load songs lần đầu
  useEffect(() => {
    fetchSongs(1, false);
  }, [fetchSongs]);

  // Load more songs khi đạt đến bài hát thứ 15
  useEffect(() => {
    // Kiểm tra nếu đang ở bài hát thứ 15 và còn trang tiếp theo
    if (currentIndex >= 14 && hasNextPage && !isLoadingMore && !isLoading) {
      const nextPage = currentPage + 1;
      fetchSongs(nextPage, true);
    }
  }, [currentIndex, hasNextPage, isLoadingMore, isLoading, currentPage, fetchSongs]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.addEventListener("ended", () => {
        nextSong();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Load and only autoplay if user has interacted
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
  
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.load();
  
    const tryPlay = async () => {
      try {
        audioRef.current!.muted = isMuted;
        await audioRef.current!.play();
        setIsPlaying(true);
      } catch (err) {
        // Nếu bị chặn vì chưa có tương tác và đang không mute, thử bật mute rồi play lại
        if (!isMuted) {
          try {
            audioRef.current!.muted = true;
            await audioRef.current!.play();
            setIsPlaying(true);
          } catch {
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }
      }
    };
  
    tryPlay();
  
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSong, isMuted, hasInteracted]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted || !hasInteracted;
    }
  }, [isMuted, hasInteracted]);

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  const nextSong = useCallback(() => {
    if (isProcessingRef.current || isTransitioning || hasSwiped || songs.length === 0) return;
    
    isProcessingRef.current = true;
    setIsTransitioning(true);
    setHasSwiped(true);
    
    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % songs.length;
      return nextIndex;
    });
    
    setTimeout(() => {
      setIsTransitioning(false);
      setHasSwiped(false);
      isProcessingRef.current = false;
    }, 600);
  }, [isTransitioning, hasSwiped, songs.length]);

  const prevSong = useCallback(() => {
    if (isProcessingRef.current || isTransitioning || hasSwiped || songs.length === 0) return;
    
    isProcessingRef.current = true;
    setIsTransitioning(true);
    setHasSwiped(true);
    
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setHasSwiped(false);
      isProcessingRef.current = false;
    }, 600);
  }, [isTransitioning, hasSwiped, songs.length]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (isProcessingRef.current) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    setHasSwiped(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || hasSwiped || isTransitioning || isProcessingRef.current) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      nextSong();
    }
    if (isDownSwipe) {
      prevSong();
    }
  };

  // Wheel scroll handler với accumulation
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (isProcessingRef.current || isTransitioning || hasSwiped) return;

    wheelAccumulatorRef.current += e.deltaY;
    
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
    
    wheelTimeoutRef.current = setTimeout(() => {
      wheelAccumulatorRef.current = 0;
    }, 150);

    if (Math.abs(wheelAccumulatorRef.current) >= wheelThreshold) {
      if (wheelAccumulatorRef.current > 0) {
        nextSong();
      } else {
        prevSong();
      }
      wheelAccumulatorRef.current = 0;
    }
  }, [isTransitioning, hasSwiped, nextSong, prevSong]);

    // Add wheel event listener
    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
          container.removeEventListener('wheel', handleWheel);
          if (wheelTimeoutRef.current) {
            clearTimeout(wheelTimeoutRef.current);
          }
        };
      }
    }, [handleWheel]);

  // Mouse drag handlers
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (isProcessingRef.current) return;
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientY);
    setHasSwiped(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientY);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd || hasSwiped || isTransitioning || isProcessingRef.current) {
      setIsDragging(false);
      return;
    }

    const distance = mouseStart - mouseEnd;
    const isUpDrag = distance > minSwipeDistance;
    const isDownDrag = distance < -minSwipeDistance;

    if (isUpDrag) {
      nextSong();
    }
    if (isDownDrag) {
      prevSong();
    }
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleLike = () => {
    if (!currentSong) return;
    setLikedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentSong.id)) {
        newSet.delete(currentSong.id);
      } else {
        newSet.add(currentSong.id);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!currentSong) return;
    setSavedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentSong.id)) {
        newSet.delete(currentSong.id);
      } else {
        newSet.add(currentSong.id);
      }
      return newSet;
    });
  };

  const handleFollow = () => {
    if (!currentSong) return;
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentSong.id)) {
        newSet.delete(currentSong.id);
      } else {
        newSet.add(currentSong.id);
      }
      return newSet;
    });
  };

  const handleShare = () => {
    if (!currentSong) return;
    if (navigator.share) {
      navigator.share({
        title: currentSong.songTitle,
        text: `Đang nghe: ${currentSong.songTitle} bởi @${currentSong.artistName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${currentSong.songTitle} - @${currentSong.artistName}`);
      alert("Link đã được copy vào clipboard!");
    }
  };

  const handleComment = () => {
    alert("Chức năng bình luận sẽ được phát triển!");
  };

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return;

    // Mark that the user has interacted to satisfy autoplay policies
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    try {
      if (audioRef.current.paused) {
        // Ensure correct mute state before playing. During user gesture,
        // don't rely on possibly-stale hasInteracted; use isMuted only.
        audioRef.current.muted = isMuted;
        audioRef.current.volume = 1;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Error playing audio on user gesture:", err);
            setIsPlaying(false);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Play/pause error:", err);
    }
  }, [isMuted, hasInteracted]);

  if (isLoading) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="text-foreground">Đang tải danh sách bài hát...</div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="text-foreground">Không có bài hát nào.</div>
      </div>
    );
  }
  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Container cho tất cả các video cards */}
      <motion.div 
        className="flex flex-col"
        animate={{ y: -currentIndex * 100 + "vh" }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 300,
          duration: 0.6
        }}
      >
        {/* Render tất cả các bài hát */}
        {songs.map((song, index) => (
          <div key={song.id} className="h-screen w-full">
            <NowPlayingCard
              thumbnail={song.thumbnail}
              artistName={song.artistName}
              songTitle={song.songTitle}
              genreName={song.genreName}
              hashtags={song.hashtags}
              musicInfo={song.musicInfo}
              likes={song.likes}
              comments={song.comments}
              saves={song.saves}
              shares={song.shares}
              artistAvatar={song.artistAvatar}
              isLiked={likedSongs.has(song.id)}
              isSaved={savedSongs.has(song.id)}
              isFollowing={following.has(song.id)}
              isMuted={isMuted}
              isPlaying={isPlaying && index === currentIndex}
              onLike={handleLike}
              onSave={handleSave}
              onFollow={handleFollow}
              onShare={handleShare}
              onComment={handleComment}
              onToggleMute={() => setIsMuted(!isMuted)}
              onTogglePlay={handleTogglePlay}
              onSwipeUp={nextSong}
              onSwipeDown={prevSong}
              audioRef={audioRef}
            />
          </div>
        ))}
      </motion.div>

      {/* Loading indicator khi đang load thêm */}
      {isLoadingMore && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          Đang tải thêm bài hát...
        </div>
      )}
    </div>
  );
}