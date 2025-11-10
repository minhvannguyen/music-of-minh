"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, progress } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  VolumeX,
  Volume2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import ActionMore from "../ActionMore";
import { NowPlayingCardProps } from "../../types/NowPlayingCard";

export default function NowPlayingCard({
  thumbnail,
  artistName,
  songTitle,
  genreName,
  hashtags = [],
  likes,
  comments,
  saves,
  shares,
  artistAvatar,
  isLiked = false,
  isSaved = false,
  isFollowing = false,
  isMuted = false,
  isPlaying = false,
  audioRef, // Add this
  onLike,
  onComment,
  onSave,
  onShare,
  onFollow,
  onToggleMute,
  onTogglePlay,
  onSwipeUp,
  onSwipeDown,
}: NowPlayingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showPlayIcon, setShowPlayIcon] = useState(false); // State để control hiển thị icon
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Handle click to toggle play/pause và hiển thị icon
  const handleCardClick = () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      audioContextRef.current.resume().catch(() => {});
    }
    onTogglePlay?.();

    // Hiển thị icon overlay
    setShowPlayIcon(true);

    // Clear timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ẩn icon sau 2 giây
    timeoutRef.current = setTimeout(() => {
      setShowPlayIcon(false);
    }, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  // Audio analysis state
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Function để cập nhật audio data
  const updateAudioData = () => {
    if (
      !isPlaying ||
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      return;
    }

    // Create new array with correct type
    const binCount = analyserRef.current?.frequencyBinCount || 0;
    const dataArray = new Uint8Array(binCount);
    analyserRef.current?.getByteFrequencyData(dataArray);

    // Chuyển đổi data thành mảng 12 giá trị cho 12 thanh sóng
    // trong updateAudioData bên trong effect
    const barCount = 80;
    const step = Math.max(1, Math.floor(dataArray.length / barCount));
    const audioLevels: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const index = i * step;
      const value = dataArray[index] || 0;
      const normalized = Math.min(1, (value / 255) * 1.5);
      audioLevels.push(normalized);
    }

    setAudioData(audioLevels);
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  };

  // Start audio analysis when isPlaying changes
  useEffect(() => {
    if (!isPlaying || !audioRef?.current) {
      // Cleanup when not playing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioData([]);
      return;
    }

    try {
      // Create AudioContext nếu chưa có
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const audioElement = audioRef.current;

      // Reuse or create a single MediaElementSource and Analyser tied to the audio element
      // Access cached nodes from the audio element to ensure single source per element
      type AudioElementWithCache = HTMLAudioElement & {
        __mediaSourceNode?: MediaElementAudioSourceNode;
        __analyserNode?: AnalyserNode;
      };
      const cachedEl = audioElement as AudioElementWithCache;

      let mediaSource: MediaElementAudioSourceNode | undefined =
        cachedEl.__mediaSourceNode;
      if (!mediaSource) {
        mediaSource = audioContext.createMediaElementSource(audioElement);
        cachedEl.__mediaSourceNode = mediaSource;
      }
      mediaSourceRef.current = mediaSource;

      let analyser: AnalyserNode | undefined = cachedEl.__analyserNode;
      if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // nhiều bins hơn
        analyser.smoothingTimeConstant = 0.7; // phản ứng nhanh hơn
        mediaSource.connect(analyser);
        analyser.connect(audioContext.destination);
        cachedEl.__analyserNode = analyser;
      }
      analyserRef.current = analyser;

      // Thay phần đầu của updateAudioData trong effect bằng:
      const updateAudioData = () => {
        // Nếu thiếu điều kiện sống còn → dừng hẳn
        if (
          !audioRef?.current ||
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        ) {
          return;
        }

        // Nếu chưa playing / đang paused / context suspended → vẫn re-queue để đợi
        if (
          !isPlaying ||
          audioRef.current.paused ||
          audioContextRef.current.state === "suspended"
        ) {
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
          return;
        }

        const binCount = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(binCount);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 64;
        const step = Math.floor(dataArray.length / barCount);
        const audioLevels: number[] = [];

        for (let i = 0; i < barCount; i++) {
          const index = i * step;
          const value = dataArray[index] || 0;
          const normalized = Math.min(1, (value / 255) * 1.5);
          audioLevels.push(normalized);
        }

        setAudioData(audioLevels);
        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      };

      // Start the update loop
      updateAudioData();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // Không disconnect media source ở đây để tránh lỗi khi tái tạo
      };
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
      setAudioData([]);
    }
  }, [isPlaying, audioRef]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      try {
        if (mediaSourceRef.current) {
          mediaSourceRef.current.disconnect();
          mediaSourceRef.current = null;
        }
        if (analyserRef.current) {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        }
      } catch {}
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const handleShare = () => alert("Chia sẻ bài viết!");
  const handleCopy = () => alert("Đã sao chép liên kết!");
  const handleDownload = () => alert("Đang tải xuống...");
  const handleRepeat = () => alert("Lặp lại hành động!");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Lắng nghe tiến độ phát audio
  useEffect(() => {
    if (!audioRef?.current) return;

    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    // Gọi ngay để cập nhật khi load xong
    if (audio.readyState >= 1) updateDuration();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={cardRef}
      className="relative w-full h-screen bg-background overflow-hidden cursor-pointer"
      onClick={handleCardClick} // Dùng handleCardClick thay vì onTogglePlay trực tiếp
    >
      {/* Main Content Container - Vertical Layout */}
      <div className="flex h-full">
        {/* Center Video Area */}
        <div className="flex-1 flex items-center justify-center bg-background">
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="max-w-[60%] w-full aspect-square bg-black rounded-lg relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {thumbnail && (
              <Image
                src={thumbnail}
                alt="Video thumbnail"
                fill
                className="object-contain"
                priority
                unoptimized={thumbnail.includes("localhost")}
              />
            )}

            {/* Video overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Play/Pause Icon Overlay - Hiển thị khi click */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <motion.div
                      className="p-4 rounded-full bg-black/50 backdrop-blur-sm mb-6"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </motion.div>
                  </div>
                  {/* Thanh duration có thể click để tua */}
                  <div
                    className="w-full cursor-pointer select-none"
                    onClick={(e) => {
                      if (!audioRef?.current) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newTime = (clickX / rect.width) * duration;

                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }}
                  >
                    {/* Thanh nền */}
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden relative">
                      {/* Thanh tiến độ */}
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-yellow-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>

                    {/* Thời gian hiển thị */}
                    <div className="flex justify-between text-xs text-white/80 mt-1 ml-3 mr-3">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mute button */}
            {isHovered && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute?.();
                }}
                className="absolute top-10 left-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </motion.button>
            )}

            {/* Song info overlay */}
            <motion.div
              className="absolute bottom-4 left-0 right-0 z-20 text-white px-4 w-full"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            >
              <div className="">
                <h3 className="font-bold text-md leading-tight mb-2">
                  @{artistName}
                </h3>
                <p className="text-sm leading-relaxed">
                  #{genreName}
                  {hashtags.length > 0 && (
                    <span className="text-blue-300">
                      {" "}
                      {hashtags.map((tag) => `#${tag}`).join(" ")}
                    </span>
                  )}
                </p>
              </div>

              <div className="text-sm text-gray-200">
                <span className="flex text-xl font-bold items-center gap-3 flex-wrap">
                  <span>♫</span>
                  <span className="flex-shrink-0">{songTitle}</span>
                  {/* Music Wave Visualization với dữ liệu audio thật */}
                  <div className="flex items-end gap-[2px] h-6 ml-3 flex-1 w-full">
                    {Array.from({ length: 80 }).map((_, index) => {
                      const baseHeight = 2;
                      const maxHeight = 14;

                      const audioLevel = audioData[index] || 0;
                      const currentHeight = baseHeight + audioLevel * maxHeight;

                      return (
                        <motion.div
                          key={index}
                          className="bg-white rounded-full flex-shrink-0"
                          style={{
                            width: "2px",
                            minHeight: `${baseHeight}px`,
                          }}
                          animate={
                            isPlaying && audioData.length > 0
                              ? {
                                  height: `${currentHeight}px`,
                                  opacity: 0.6 + audioLevel * 0.4,
                                }
                              : {
                                  height: `${baseHeight}px`,
                                  opacity: 0.5,
                                }
                          }
                          transition={{
                            duration: 0.06,
                            ease: "linear",
                          }}
                        />
                      );
                    })}
                  </div>
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="ml-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
            onClick={(e) => e.stopPropagation()} // Ngăn toggle khi click vào side panel
          >
            {/* Artist avatar */}
            <div className="flex flex-col items-center space-y-2 mb-7">
              <div className="relative">
                <Image
                  src={artistAvatar}
                  alt={artistName}
                  width={45}
                  height={45}
                  className="rounded-full border-2 border-gray-200"
                />
                <motion.button
                  onClick={onFollow}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-md font-bold">+</span>
                </motion.button>
              </div>
            </div>

            {/* Interaction buttons */}
            <div className="flex flex-col items-center space-y-6">
              {/* Like */}
              <div className="flex flex-col items-center space-y-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike?.();
                  }}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked ? "text-red-500 fill-current" : "text-gray-600"
                    }`}
                  />
                </motion.button>
                <span className="text-foreground text-xs font-medium text-center">
                  {formatNumber(likes)}
                </span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center space-y-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComment?.();
                  }}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                </motion.button>
                <span className="text-foreground text-xs font-medium text-center">
                  {formatNumber(comments)}
                </span>
              </div>

              {/* Save */}
              <div className="flex flex-col items-center space-y-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.();
                  }}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark
                    className={`w-6 h-6 ${
                      isSaved ? "text-yellow-500 fill-current" : "text-gray-600"
                    }`}
                  />
                </motion.button>
                <span className="text-foreground text-xs font-medium text-center">
                  {formatNumber(saves)}
                </span>
              </div>

              <ActionMore
                onShare={handleShare}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onRepeat={handleRepeat}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onSwipeDown?.();
          }}
          className="p-2 rounded-full bg-black/10 backdrop-blur-sm text-foreground hover:bg-black/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onSwipeUp?.();
          }}
          className="p-2 rounded-full bg-black/10 backdrop-blur-sm text-foreground hover:bg-black/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
