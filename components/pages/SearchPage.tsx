"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Heart,
  Share2,
  FolderPlus,
  MoreHorizontal,
  UserPlus,
  Album,
} from "lucide-react";
import { mockSearchResults, searchFilters } from "@/mock/searchResults";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Song {
  id: number;
  thumbnail: string;
  artistName: string;
  songTitle: string;
  genre?: string;
  likes: number;
  reposts: number;
  plays: number;
  comments: number;
  duration: string;
  uploadTime: string;
  waveform: number[];
}

interface Playlist {
  id: number;
  title: string;
  creator: string;
  trackCount: number;
  followers: number;
  thumbnail: string;
  likes: number;
  reposts: number;
}

interface Person {
  id: number;
  name: string;
  username: string;
  followers: number;
  avatar: string;
  isFollowing: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("everything");
  const searchQuery = searchParams.get("q") || "anh yêu em";

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const renderWaveform = (waveform: number[]) => {
    return (
      <div className="flex items-center gap-1 h-4">
        {waveform.map((height, index) => (
          <div
            key={index}
            className="bg-muted-foreground rounded-sm"
            style={{
              width: "2px",
              height: `${height * 100}%`,
              backgroundColor:
                index % 4 === 0 ? "#ff6b6b" : "hsl(var(--muted-foreground))",
            }}
          />
        ))}
      </div>
    );
  };

  const renderSongResult = (song: Song) => (
    <div
      key={song.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={song.thumbnail}
          alt={song.songTitle}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
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

        {/* Waveform */}
        <div className="flex mb-2">
          <div>{renderWaveform(song.waveform)}</div>
          <div className="ml-4 text-xs text-muted-foreground">{song.duration}</div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.likes)}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(song.reposts)}</span>
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
          <span>{formatNumber(song.plays)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{song.comments}</span>
        </div>
      </div>
    </div>
  );

  

  const renderPlaylistResult = (playlist: Playlist) => (
    <div
      key={playlist.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image
          src={playlist.thumbnail}
          alt={playlist.title}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
        <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {playlist.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-1">
          by {playlist.creator}
        </p>
        <p className="text-muted-foreground text-xs">
          {playlist.trackCount} tracks • {formatNumber(playlist.followers)}{" "}
          followers
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{formatNumber(playlist.likes)}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(playlist.reposts)}</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <FolderPlus className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Album className="mr-2" size={34} />
    </div>
  );

  const renderPeopleResult = (person: Person) => (
    <div
      key={person.id}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <Image
        src={person.avatar}
        alt={person.name}
        width={108}
        height={108}
        className="rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="text-foreground font-medium text-lg mb-1">
          {person.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-1">{person.username}</p>
        <p className="text-muted-foreground text-xs">
          {formatNumber(person.followers)} followers
        </p>
      </div>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          person.isFollowing
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-yellow-500 text-black hover:bg-yellow-400"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        {person.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Left Sidebar */}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className=" bg-background p-6 flex justify-between">
            {/* Filters */}
            <div className="flex justify-between">
              {searchFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`py-2 text-left px-6 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {/* Search Results */}
          <div className="space-y-2">
            {activeFilter === "everything" && (
              <>
                {mockSearchResults.songs.map(renderSongResult)}
                {mockSearchResults.playlists.map(renderPlaylistResult)}
                {mockSearchResults.people.map(renderPeopleResult)}
              </>
            )}
            {activeFilter === "songs" &&
              mockSearchResults.songs.map(renderSongResult)}
            {activeFilter === "playlists" &&
              mockSearchResults.playlists.map(renderPlaylistResult)}
            {activeFilter === "people" &&
              mockSearchResults.people.map(renderPeopleResult)}
          </div>
        </div>
      </div>
    </div>
  );
}
