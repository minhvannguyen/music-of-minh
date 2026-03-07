"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { CreatePlaylistRequest, Playlist } from "@/types/playList";
import { playlistAPI } from "@/lib/api/playlistApi";

interface Props {
  mode?: "create" | "edit";            // 🆕 chế độ tạo hoặc sửa
  playlist?: Playlist;                 // 🆕 dữ liệu playlist khi sửa
  onCreate?: (data: Playlist) => void;
  onUpdate?: (data: Playlist) => void; // 🆕 callback khi update
  refreshPlaylists?: () => void;       // 🆕 callback khi refresh
  children?: ReactNode;
}

export default function PlaylistDialog({
  mode = "create",
  playlist,
  onCreate,
  onUpdate,
  refreshPlaylists,
  children,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const { user, isLoggedIn } = useAuthContext();
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [newPlaylist, setNewPlaylist] = useState<Playlist>({ name: "" });

  // --- Load dữ liệu khi edit ---
  useEffect(() => {
    if (openDialog && mode === "edit" && playlist) {
      setNewPlaylist({ name: playlist.name });
      setCoverPreview(playlist.coverUrl || null);
      setIsPublic(playlist.isPublic ?? true);
    }
  }, [openDialog, mode, playlist]);

  // --- Handle ảnh ---
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/webp", "image/png", "image/jpg"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Ảnh bìa chỉ chấp nhận JPG hoặc PNG!");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Ảnh bìa quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    setCover(selected);
    setCoverPreview(URL.createObjectURL(selected));
    toast.success("Đã chọn ảnh bìa!");
  };

  // --- Submit Form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !user?.id) {
      toast.error("Vui lòng đăng nhập!");
      return;
    }

    if (!newPlaylist.name?.trim()) {
      toast.error("Vui lòng nhập tên playlist!");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        // ------------------ CREATE -------------------
        const data: CreatePlaylistRequest = {
          name: newPlaylist.name.trim(),
          UserId: user.id,
          IsPublic: isPublic,
          coverImage: cover || undefined,
        };

        const res = await playlistAPI.createPlaylist(data);

        if (res?.status === 200 || res?.success) {
          toast.success("Tạo playlist thành công!");
          onCreate?.(res.data);
          setOpenDialog(false);
        } else {
          toast.error(res?.message || "Không thể tạo playlist!");
        }
      } else if (mode === "edit" && playlist?.id) {
  const data = {
    id: playlist.id,
    name: newPlaylist.name.trim(),
    isPublic: isPublic,
    coverImage: cover || undefined,
  };

  const res = await playlistAPI.updatePlaylist(data);

  if (res?.status === 200 || res?.success) {
    toast.success("Cập nhật playlist thành công!");

    // 🔥 Build object cập nhật (KHÔNG phụ thuộc res.data)
    const updatedPlaylist: Playlist = {
      ...playlist,
      name: newPlaylist.name.trim(),
      isPublic: isPublic,
      coverUrl: cover ? coverPreview : playlist.coverUrl, // nếu đổi ảnh thì dùng preview
    };

    onUpdate?.(updatedPlaylist);
    refreshPlaylists?.();
    setOpenDialog(false);
  } else {
    toast.error(res?.message || "Không thể cập nhật playlist!");
  }
}

    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
  };

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = "https://localhost:7114";
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "create" ? "Tạo playlist mới" : "Cập nhật playlist"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Tên playlist */}
          <Input
            placeholder="Nhập tên playlist..."
            value={newPlaylist.name}
            onChange={(e) =>
              setNewPlaylist({ ...newPlaylist, name: e.target.value })
            }
          />

          {/* Ảnh bìa */}
          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <Input type="file" accept="image/*" onChange={handleCoverChange} />
            {coverPreview && (
              <img
                src={buildFullUrl(coverPreview)}
                className="mt-2 w-full h-32 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Công khai */}
          <div className="flex items-center space-x-2">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            <Label>Công khai</Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Đang lưu..."
                : mode === "create"
                ? "Tạo mới"
                : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
