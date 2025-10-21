"use client";

import NowPlayingCard from "@/components/cards/nowPlayingCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mockSongs } from "@/mock/songs";

export default function Home() {
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
  
  // Wheel scroll accumulation
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelThreshold = 100; // Tích lũy 100px mới trigger
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSong = mockSongs[currentIndex];

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  // Auto play next song after 30 seconds (simulate song duration)
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        nextSong();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentIndex]);

  const nextSong = useCallback(() => {
    if (isProcessingRef.current || isTransitioning || hasSwiped) return;
    
    isProcessingRef.current = true;
    setIsTransitioning(true);
    setHasSwiped(true);
    
    setCurrentIndex((prev) => (prev + 1) % mockSongs.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setHasSwiped(false);
      isProcessingRef.current = false;
    }, 600);
  }, [isTransitioning, hasSwiped]);

  const prevSong = useCallback(() => {
    if (isProcessingRef.current || isTransitioning || hasSwiped) return;
    
    isProcessingRef.current = true;
    setIsTransitioning(true);
    setHasSwiped(true);
    
    setCurrentIndex((prev) => (prev - 1 + mockSongs.length) % mockSongs.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setHasSwiped(false);
      isProcessingRef.current = false;
    }, 600);
  }, [isTransitioning, hasSwiped]);

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
    
    // Chặn hoàn toàn nếu đang processing
    if (isProcessingRef.current || isTransitioning || hasSwiped) return;

    // Tích lũy deltaY
    wheelAccumulatorRef.current += e.deltaY;
    
    // Clear timeout cũ nếu có
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
    
    // Set timeout ngắn để reset accumulator nếu không có wheel event nào nữa
    wheelTimeoutRef.current = setTimeout(() => {
      wheelAccumulatorRef.current = 0;
    }, 150);

    // Kiểm tra threshold
    if (Math.abs(wheelAccumulatorRef.current) >= wheelThreshold) {
      if (wheelAccumulatorRef.current > 0) {
        nextSong();
      } else {
        prevSong();
      }
      // Reset accumulator sau khi trigger
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
    };
  }, []);

  const handleLike = () => {
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
    if (navigator.share) {
      navigator.share({
        title: currentSong.songTitle,
        text: `Đang nghe: ${currentSong.songTitle} bởi @${currentSong.artistName}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${currentSong.songTitle} - @${currentSong.artistName}`);
      alert("Link đã được copy vào clipboard!");
    }
  };

  const handleComment = () => {
    // Có thể mở modal comment hoặc redirect đến trang comment
    alert("Chức năng bình luận sẽ được phát triển!");
  };

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
        {mockSongs.map((song, index) => (
          <div key={song.id} className="h-screen w-full">
            <NowPlayingCard
              thumbnail={song.thumbnail}
              artistName={song.artistName}
              songTitle={song.songTitle}
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
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSwipeUp={nextSong}
              onSwipeDown={prevSong}
            />
          </div>
        ))}
      </motion.div>

      {/* Visual feedback khi đang transition
      {isTransitioning && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </div>
        </div>
      )} */}

      {/* Navigation dots indicator
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {mockSongs.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setCurrentIndex(index);
              }
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Song counter *
      <div className="absolute bottom-6 left-6 z-40 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {mockSongs.length}
      </div> */}
    </div>
  );
}