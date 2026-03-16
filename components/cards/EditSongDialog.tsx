"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Genre } from "@/types/genre";
import { songsAPI } from "@/lib/api/songApi";
import { playlistAPI } from "@/lib/api/playlistApi";
import { genresAPI } from "@/lib/api/genreApi";
import { useAuthContext } from "@/contexts/authContext";
import { SongApiResponse } from "@/types/song";

interface EditSongDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  songId: number; // ⬅ chỉ cần truyền id
  onUpdated?: (updatedSong: SongApiResponse) => void; // 🆕 callback khi update thành công
  refreshSongs?: () => void; // 🆕 callback để refresh danh sách bài hát sau khi update
}

export default function EditSongDialog({
  open,
  onOpenChange,
  songId,
  onUpdated,
  refreshSongs,
}: EditSongDialogProps) {
  // --- States ---
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genreId, setGenreId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // --- Fetch genres ---
  useEffect(() => {
    const fetchGenres = async () => {
      const res = await genresAPI.getGenres();
      if (res.success) setGenres(res.data);
    };
    fetchGenres();
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const fixUrl = (url?: string | null) => {
    if (!url) return null;

    // Nếu đã phải URL đầy đủ → trả về luôn
    if (url.startsWith("https://") || url.startsWith("http://")) {
      return url;
    }

    // Nếu URL bắt đầu bằng /uploads
    if (url.startsWith("/")) {
      return `${API_BASE}${url}`;
    }

    // Nếu URL không có slash → thêm vào
    return `${API_BASE}/${url}`;
  };

  // --- Fetch song detail when popup opens ---
  useEffect(() => {
    if (!open || !songId) return;

    const fetchSongDetail = async () => {
      try {
        setIsDetailLoading(true);

        const res = await songsAPI.getSongById(songId);

        if (!res.success) {
          toast.error("Không thể tải thông tin bài hát!");
          return;
        }

        const data = res.data;

        // Fill form with loaded data
        setSongTitle(data.title);
        setArtistName(data.artistName);
        setGenreId(data.genreIds?.[0]?.toString() || "");

        setIsPublic(!data.private);

        setAudioPreview(fixUrl(data.fileUrl) || null);
        setCoverPreview(fixUrl(data.coverUrl) || null);

        setFile(null);
        setCover(null);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu bài hát.");
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchSongDetail();
  }, [open, songId]);

  // --- File handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setAudioPreview(URL.createObjectURL(selected));
    toast.success("Đã chọn file nhạc mới!");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setCover(selected);
    setCoverPreview(URL.createObjectURL(selected));
    toast.success("Đã chọn ảnh bìa mới!");
  };

  // --- Submit update ---
  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("songId", songId.toString());
      formData.append("title", songTitle);
      formData.append("artistName", artistName);
      formData.append("private", (!isPublic).toString());
      // Append GenreIds (mảng)
      if (genreId) {
        formData.append("GenreIds", genreId.toString());
      }
      if (file) formData.append("audioFile", file);
      if (cover) formData.append("coverImage", cover);

      const res = await songsAPI.updateSong(formData);

      if (res.success && res.data) {
        onUpdated?.(res.data as SongApiResponse);
        refreshSongs?.();
        toast.success("Cập nhật bài hát thành công!");
        onOpenChange(false);
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>✏️ Chỉnh sửa bài hát</DialogTitle>
        </DialogHeader>

        {/* Loading state */}
        {isDetailLoading ? (
          <div className="py-10 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 mt-4">
              {/* Cover */}
              <div className="flex flex-col items-center mt-2">
                <div className="relative w-56 h-56">
                  <label
                    htmlFor="edit-cover"
                    className="w-56 h-56 bg-gray-200 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center shadow"
                  >
                    {coverPreview ? (
                      <Image
                        src={coverPreview || "/default-cover.jpg"}
                        alt="Cover preview"
                        fill
                        unoptimized
                        className="object-cover w-full h-full rounded-xl"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm text-center">
                        📷 Chọn ảnh bìa
                      </span>
                    )}
                  </label>
                </div>

                <Input
                  id="edit-cover"
                  type="file"
                  onChange={handleCoverChange}
                  className="hidden"
                />

                <div className="flex items-center space-x-2 mt-6">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label>Công khai</Label>
                </div>
              </div>

              {/* Right form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Tên bài hát</Label>
                  <Input
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Nghệ sĩ</Label>
                  <Input
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Thể loại</Label>
                  <Select value={genreId} onValueChange={setGenreId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">File nhạc mới (tùy chọn)</Label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Audio preview */}
            {audioPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">🎧 Nghe thử</p>
                <audio controls className="w-full rounded">
                  <source src={audioPreview} />
                </audio>
              </div>
            )}
          </>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading || isDetailLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
