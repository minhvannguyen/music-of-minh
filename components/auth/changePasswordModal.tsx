"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void; // Khi đổi mật khẩu xong thì chuyển về login hoặc trang khác
}

export default function ChangePasswordModal({
  open,
  onClose,
  email,
  onSuccess,
}: ChangePasswordModalProps) {
  const { changePasswordForgot, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (password.trim().length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setError("");
    try {
      const result = await changePasswordForgot(email, password);
      if (result.success) {
        toast.success("Đổi mật khẩu thành công!");
        onSuccess();
      } else {
        setError(result.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Đổi mật khẩu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} disabled className="bg-muted" />
          </div>

          <div>
            <Label>Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label>Nhập lại mật khẩu</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-3"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Đổi mật khẩu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
