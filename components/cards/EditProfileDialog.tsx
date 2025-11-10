"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userAPI } from "@/lib/api";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number; // Thêm userId prop
  user: {
    name: string;
    avatar: string;
    bio?: string;
  };
  onSave: (updatedUser: { name: string; avatar: string; bio?: string }) => Promise<void>;
}

export default function EditProfileDialog({
  isOpen,
  onClose,
  userId,
  user,
  onSave,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [preview, setPreview] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API update user
      const response = await userAPI.updateUser(userId, {
        username: name,
        bio: bio || undefined,
        avatar: avatarFile,
      });

      if (response?.success) {
        // Gọi callback onSave để refresh UI
        await onSave({
          name: response.data?.username || name,
          avatar: response.data?.avatarUrl || preview,
          bio: response.data?.bio || bio,
        });
        onClose();
      } else {
        setError(response?.message || "Cập nhật thất bại. Vui lòng thử lại.");
      }
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      setError(
        error instanceof Error ? error.message : String(error) ||
        "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-semibold text-center mb-5">
          Chỉnh sửa hồ sơ
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 cursor-pointer group">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover group-hover:opacity-70 transition"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs text-white">Chọn ảnh</span>
              </div>
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên người dùng
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên người dùng"
              disabled={isLoading}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Nhập bio"
              disabled={isLoading}
            />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-300"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-300 text-black disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
