"use client";

import { Heart } from "lucide-react";
import useLikeSong from "@/hooks/useLikeSong";

export default function LikeButton({ songId }: { songId: number }) {
  const { likesCount, isLiked, toggle } = useLikeSong(songId);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} className="p-2">
        <Heart
          className={`w-6 h-6 transition ${
            isLiked ? "text-red-500 fill-red-500" : "text-gray-400"
          }`}
        />
      </button>

      <span className="text-sm text-white">{formatNumber(likesCount)}</span>
    </div>
  );
}
