"use client";

import { ReactNode, useState } from "react";
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
import { PlayList } from "@/types/playList";
import { Label } from "@radix-ui/react-label";

interface Props {
  onCreate?: (data: PlayList) => void;
  children?: ReactNode; // thêm dòng này để bọc nội dung custom
}

export default function PlaylistDialog({ onCreate, children }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState<PlayList>({
    title: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (onCreate) {
      onCreate(newPlaylist);
    }

    console.log("Tạo playlist:", newPlaylist);

    setOpenDialog(false);
    setNewPlaylist({ title: "" });
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Tạo playlist mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Input
              id="title"
              placeholder="Ví dụ: Chill buổi sáng"
              value={newPlaylist.title}
              onChange={(e) =>
                setNewPlaylist({ ...newPlaylist, title: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="public" />
            <Label htmlFor="public">Công khai</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
