"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onSave: (updatedUser: { name: string; email: string; avatar: string }) => void;
}

export default function EditProfileDialog({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [preview, setPreview] = useState(user.avatar);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setAvatar(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, avatar: preview });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-semibold text-center mb-5">
          Chỉnh sửa hồ sơ
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 cursor-pointer group">
              <Image
                src={preview}
                alt="Avatar preview"
                fill
                className="object-cover group-hover:opacity-70 transition"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
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
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-black">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
