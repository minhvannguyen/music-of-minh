"use client";

import Image from "next/image";
import { Play, Heart, Share2, FolderPlus, MoreHorizontal } from "lucide-react";
import { Song } from "@/types/song";
import { useState } from "react";

interface RenderSongListProps {
  song: Song;
}

// Format number for display (1K, 1M, etc.)
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Generate waveform ngẫu nhiên với độ dài và pattern khác nhau cho mỗi bài hát
const generateRandomWaveform = (songId: number): number[] => {
  // Sử dụng songId như seed để mỗi bài hát có waveform nhất quán
  const seed = songId;
  
  // Độ dài ngẫu nhiên từ 20 đến 50 bars
  const length = 20 + (seed % 31);
  
  // Tạo số ngẫu nhiên nhất quán dựa trên seed
  const random = (offset: number) => {
    const x = Math.sin((seed + offset) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  
  const waveform: number[] = [];
  
  // Pattern hiện đại: kết hợp nhiều sóng với animation style
  for (let i = 0; i < length; i++) {
    // Base height từ nhiều sóng kết hợp
    const wave1 = Math.sin(i * 0.3 + seed * 0.1) * 0.3;
    const wave2 = Math.sin(i * 0.5 + seed * 0.2) * 0.2;
    const wave3 = Math.sin(i * 0.8 + seed * 0.3) * 0.15;
    
    // Thêm peaks ngẫu nhiên
    const peakChance = random(i * 2);
    const isPeak = peakChance > 0.7; // 30% chance có peak
    const peakHeight = isPeak ? (0.4 + random(i) * 0.4) : 0;
    
    // Kết hợp các sóng
    let height = 0.25 + wave1 + wave2 + wave3 + peakHeight;
    
    // Thêm variation ngẫu nhiên
    const variation = (random(i * 3) - 0.5) * 0.1;
    height += variation;
    
    // Đảm bảo trong khoảng hợp lý
    height = Math.max(0.15, Math.min(0.95, height));
    
    waveform.push(height);
  }
  
  return waveform;
};

const renderWaveform = (waveform: number[], songId: number) => {
  // Sử dụng waveform từ prop nếu có, nếu không thì generate mới
  const displayWaveform = waveform.length > 0 ? waveform : generateRandomWaveform(songId);
  
  return (
    <div className="flex items-center gap-[2px] h-5 min-w-[120px] max-w-[300px]">
      {displayWaveform.map((height, index) => {
        // Tạo màu gradient hiện đại dựa trên height và vị trí
        const normalizedHeight = height;
        const isAccent = normalizedHeight > 0.65 || index % 7 === 0;
        const isMid = normalizedHeight > 0.45 && normalizedHeight <= 0.65;
        
        // Màu sắc hiện đại với gradient
        let backgroundColor: string;
        if (isAccent) {
          // Peak cao - màu đỏ/cam nóng
          backgroundColor = `hsl(${340 + (normalizedHeight - 0.65) * 60}, 70%, ${50 + normalizedHeight * 30}%)`;
        } else if (isMid) {
          // Mid range - màu xanh dương
          backgroundColor = `hsl(${200 + (normalizedHeight - 0.45) * 40}, 65%, ${45 + normalizedHeight * 25}%)`;
        } else {
          // Thấp - màu xám với tint nhẹ
          backgroundColor = `hsl(0, 0%, ${35 + normalizedHeight * 40}%)`;
        }
        
        // Độ rộng và height động
        const barWidth = isAccent ? "4px" : "3px";
        const barHeight = Math.max(normalizedHeight * 100, 20); // Tối thiểu 20%
        
        return (
          <div
            key={index}
            className="rounded-sm transition-all duration-300 ease-out"
            style={{
              width: barWidth,
              minHeight: "4px",
              height: `${barHeight}%`,
              backgroundColor: backgroundColor,
              // Thêm shadow nhẹ cho depth
              boxShadow: isAccent 
                ? `0 0 4px ${backgroundColor}` 
                : 'none',
              // Animation khi hover
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        );
      })}
    </div>
  );
};

export default function RenderSongList({
  song,
}: RenderSongListProps) {
  const [imageError, setImageError] = useState(false);

  // Kiểm tra nếu là localhost URL
  const isLocalhost = song.thumbnail?.includes('localhost');
  
  return (
    <div
      key={song.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-28 flex-shrink-0 bg-muted rounded-lg">
        {song.thumbnail && !imageError ? (
          <Image
            src={song.thumbnail}
            alt={song.songTitle}
            fill
            className="object-cover rounded-lg"
            sizes="112px"
            unoptimized={isLocalhost} // Tắt optimization cho localhost
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 rounded-lg">
            <span className="text-2xl">🎵</span>
          </div>
        )}
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-foreground font-medium text-lg truncate">
            {song.songTitle}
          </h3>
          {song.genre && (
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
              {song.genre}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-2">{song.artistName}</p>

        {/* Waveform với kiểu hiện đại */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 overflow-hidden">
            {renderWaveform(song.waveform || [], song.id)}
          </div>
          {song.duration && (
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {song.duration}
            </div>
          )}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.likes || 0)}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.reposts || 0)}</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <FolderPlus className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-right text-muted-foreground text-sm">
        <div className="mb-1">{song.uploadTime}</div>
        <div className="flex items-center gap-1 mb-1">
          <Play className="w-3 h-3" />
          <span>{formatNumber(song.plays || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{song.comments}</span>
        </div>
      </div>
    </div>
  );
}
