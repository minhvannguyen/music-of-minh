"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { songsAPI, genresAPI } from "@/lib/api";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { CreateSongRequest } from "@/types/song";
import { Genre } from "@/types/genre";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genreId, setGenreId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // State cho genres
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  // Fetch genres khi component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const response = await genresAPI.getGenres();
        
        if (response?.success && response.data) {
          setGenres(response.data);
        } else {
          console.error("Failed to fetch genres:", response?.message);
          toast.error("Không thể tải danh sách thể loại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách thể loại.");
      } finally {
        setIsLoadingGenres(false);
      }
    };

    if (isLoggedIn) {
      fetchGenres();
    }
  }, [isLoggedIn]);

  // Kiểm tra đăng nhập khi mount
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      toast.error("Vui lòng đăng nhập để tải nhạc lên!");
      return;
    }
  }, [isLoggedIn, router]);

  // --- Handle chọn file nhạc ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Chỉ chấp nhận file nhạc MP3 hoặc WAV!");
      setFile(null);
      setAudioPreview(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn file dưới 10MB.");
      setFile(null);
      setAudioPreview(null);
      return;
    }

    setFile(selected);
    setAudioPreview(URL.createObjectURL(selected));
    toast.success("Đã chọn file nhạc!");
  };

  // --- Handle chọn ảnh bìa ---
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Ảnh bìa chỉ chấp nhận JPG hoặc PNG!");
      setCover(null);
      setCoverPreview(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Ảnh bìa quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      setCover(null);
      setCoverPreview(null);
      return;
    }

    setCover(selected);
    setCoverPreview(URL.createObjectURL(selected));
    toast.success("Đã chọn ảnh bìa!");
  };

  // --- Submit form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user?.id) {
      toast.error("Vui lòng đăng nhập để tải nhạc lên!");
      return;
    }

    if (!songTitle || !artistName || !genreId || !file || !cover) {
      toast.error("Vui lòng điền đủ thông tin, chọn file nhạc và ảnh bìa!");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CreateSongRequest = {
        title: songTitle,
        artistId: user.id,
        private: !isPublic,
        audioFile: file,
        coverImage: cover,
        genreIds: [parseInt(genreId)], // Đổi từ genreId sang genreIds (mảng)
        // duration có thể bỏ qua hoặc để backend tự tính
      };

      const response = await songsAPI.createSong(requestData);

      if (response?.success) {
        toast.success(response.message || "Tải lên thành công!");
        // Reset form
        setSongTitle("");
        setArtistName("");
        setGenreId("");
        setFile(null);
        setCover(null);
        setAudioPreview(null);
        setCoverPreview(null);
        setIsPublic(true);
      } else {
        toast.error(response?.message || "Tải lên thất bại. Vui lòng thử lại!");
      }
    } catch (error: unknown) {
      console.error("Failed to upload song:", error);
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Dọn URL tạm
  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [audioPreview, coverPreview]);

  // Hiển thị loading nếu chưa xác định trạng thái đăng nhập
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        🎵 Tải nhạc của bạn lên
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-muted p-6 rounded-2xl shadow-md"
      >
        {/* --- Thông tin upload --- */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center">
            {/* --- Ảnh bìa --- */}
            <div className="relative w-56 h-56">
              <label
                htmlFor="cover"
                className="w-56 h-56 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-md"
              >
                {coverPreview ? (
                  <Image
                    src={coverPreview || "/default-cover.jpg"}
                    alt="Cover preview"
                    fill
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-500 text-sm text-center">
                    📷 Chọn ảnh bìa
                    <br />
                    (JPG, PNG — dưới 5MB)
                  </span>
                )}
              </label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Switch 
                id="public" 
                className="shadow-md"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isLoading}
              />
              <Label htmlFor="public">Công khai</Label>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Tên bài hát
              </label>
              <Input
                type="text"
                placeholder="VD: Anh nhớ em"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Nghệ sĩ
              </label>
              <Input
                type="text"
                placeholder="VD: Sơn Tùng M-TP"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Thể loại
              </label>
              <Select
                value={genreId}
                onValueChange={setGenreId}
                disabled={isLoading || isLoadingGenres}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn thể loại" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingGenres && (
                <p className="text-xs text-gray-500 mt-1">
                  Đang tải danh sách thể loại...
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">
                File nhạc
              </label>
              <Input 
                type="file" 
                accept="audio/*" 
                onChange={handleFileChange}
                disabled={isLoading}
              />
              
              <p className="text-xs text-gray-500 mt-1 ml-5">
                (MP3, WAV — tối đa 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* --- Nghe thử --- */}
        {audioPreview && (
          <div className="flex flex-col items-center mt-4">
            <p className="text-sm font-medium mb-2">🎧 Nghe thử nhạc:</p>
            <audio controls className="w-full max-w-md rounded-lg shadow">
              <source src={audioPreview} type={file?.type} />
              Trình duyệt không hỗ trợ phát nhạc.
            </audio>
          </div>
        )}

        {/* --- Nút tải lên --- */}
        <div className="flex justify-center pt-2">
          <Button type="submit" className="px-8 py-2" disabled={isLoading}>
            {isLoading ? "⏳ Đang tải lên..." : "🚀 Tải lên"}
          </Button>
        </div>
      </form>
    </div>
  );
}
