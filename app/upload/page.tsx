"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function UploadPage() {
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // --- Handle chọn file nhạc ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!validTypes.includes(selected.type)) {
      setError("❌ Chỉ chấp nhận file nhạc MP3 hoặc WAV!");
      setFile(null);
      setAudioPreview(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("⚠️ File quá lớn! Vui lòng chọn file dưới 10MB.");
      setFile(null);
      setAudioPreview(null);
      return;
    }

    setError("");
    setFile(selected);
    setAudioPreview(URL.createObjectURL(selected));
  };

  // --- Handle chọn ảnh bìa ---
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selected.type)) {
      setError("❌ Ảnh bìa chỉ chấp nhận JPG hoặc PNG!");
      setCover(null);
      setCoverPreview(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("⚠️ Ảnh bìa quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      setCover(null);
      setCoverPreview(null);
      return;
    }

    setError("");
    setCover(selected);
    setCoverPreview(URL.createObjectURL(selected));
  };

  // --- Submit form ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !artistName || !genre || !file || !cover) {
      setError("⚠️ Vui lòng điền đủ thông tin, chọn file nhạc và ảnh bìa!");
      return;
    }
    setError("");
    alert(`🎶 Đã tải lên: ${songTitle} - ${artistName}`);
  };

  // Dọn URL tạm
  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [audioPreview, coverPreview]);

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
                    src={coverPreview || "/default-cover.jpg"} // đảm bảo có giá trị fallback
                    alt="Cover preview"
                    fill // dùng fill để tự căn theo khung cha có position: relative
                    unoptimized // ✅ cần cho ảnh blob URL (ảnh upload)
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
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Switch id="public" className="shadow-md"/>
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
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-foreground">
                Thể loại
              </label>
              <Input
                type="text"
                placeholder="VD: Pop, EDM..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">
                File nhạc
              </label>
              <Input type="file" accept="audio/*" onChange={handleFileChange} />
              <p className="text-xs text-gray-500 mt-1">
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

        {/* --- Hiển thị lỗi --- */}
        {error && (
          <p className="text-sm text-red-500 font-medium text-center">
            {error}
          </p>
        )}

        {/* --- Nút tải lên --- */}
        <div className="flex justify-center pt-2">
          <Button type="submit" className="px-8 py-2">
            🚀 Tải lên
          </Button>
        </div>
      </form>
    </div>
  );
}
