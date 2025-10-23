"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
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

interface NowPlayingCardProps {
  videoUrl?: string;
  thumbnail?: string;
  artistName: string;
  songTitle: string;
  hashtags?: string[];
  musicInfo: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  artistAvatar: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onToggleMute?: () => void;
  onTogglePlay?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export default function NowPlayingCard({
  videoUrl,
  thumbnail,
  artistName,
  songTitle,
  hashtags = [],
  musicInfo,
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  return (
    <div
      ref={cardRef}
      className="relative w-full h-screen bg-background overflow-hidden"
    >
      {/* Main Content Container - Vertical Layout */}
      <div className="flex h-full">
        {/* Center Video Area */}
        <div className="flex-1 flex items-center justify-center bg-background">
          <motion.div 
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
              />
            )}

            {/* Video overlay */}
            <div className="absolute inset-0 bg-black/10" />
            
            {/* Mute button */}
            <motion.button
              onClick={onToggleMute}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* Play/Pause button */}
            <motion.button
              onClick={onTogglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </motion.button>

            {/* Song info overlay */}
            <motion.div 
              className="absolute bottom-4 left- Mel-4 ml-3 z-20 text-white max-w-[280px]"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            >
              <div className="mb-2">
                <h3 className="font-bold text-lg leading-tight">
                  @{artistName}
                </h3>
                <p className="text-sm leading-relaxed">
                  {songTitle}
                  {hashtags.length > 0 && (
                    <span className="text-blue-300">
                      {" "}
                      {hashtags.map((tag) => `#${tag}`).join(" ")}
                    </span>
                  )}
                </p>
              </div>

              <div className="text-sm text-gray-200">
                <span className="flex items-center gap-2">
                  <span>♫</span>
                  <span>{musicInfo}</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="ml-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
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
                  onClick={onLike}
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
                  onClick={onComment}
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
                  onClick={onSave}
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

              {/* Share */}
              <div className="flex flex-col items-center space-y-2">
                <motion.button
                  onClick={onShare}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share className="w-6 h-6 text-gray-600" />
                </motion.button>
                <span className="text-foreground text-xs font-medium text-center">
                  {formatNumber(shares)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        <motion.button
          onClick={onSwipeDown}
          className="p-2 rounded-full bg-black/10 backdrop-blur-sm text-foreground hover:bg-black/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={onSwipeUp}
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
