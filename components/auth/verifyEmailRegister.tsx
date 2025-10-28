"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/themeContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { toast } from "sonner";

import { authAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Mã chưa hợp lệ").max(10),
});

export default function VerifyEmailRegister({
  open,
  onClose,
  email,
  userData, // Thêm prop để nhận thông tin user
  onVerified,
  onResendRequest,
  onSwitchToForgot,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  userData: { username: string; email: string; password: string }; // Thêm type cho userData
  onVerified?: () => void;
  onResendRequest?: (email: string) => Promise<void>;
  onSwitchToForgot: () => void;
}) {
  const { theme } = useTheme();
  const { confirmRegistration, register, loading } = useAuth();
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email, code: "" },
  });

  // sync email prop to form
  useEffect(() => {
    form.reset({ email, code: "" });
  }, [email]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const onSubmit = async (values: z.infer<typeof verifySchema>) => {
    try {
      
      // Gọi API xác nhận OTP và hoàn tất đăng ký
      const result = await confirmRegistration(values.code, userData);
      
      if (result.success) {
        toast.success("Đăng ký thành công! Tài khoản đã được kích hoạt!");
        onClose();
        onVerified?.();
      } else {
        toast.error(result.message || "Xác nhận thất bại");
      }
    } catch (error) {
      console.error("Verify error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(30);
      
      // Gửi lại OTP
      const result = await register(email);
      
      if (result.success) {
        toast.success("Đã gửi lại mã xác nhận!");
      } else {
        toast.error(result.message || "Gửi lại mã thất bại");
        setResendCooldown(0);
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      setResendCooldown(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-md backdrop-blur-md border shadow-xl rounded-2xl transition-all
          ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700 text-white"
              : "bg-white/90 border-gray-200 text-gray-900"
          }`}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Xác thực email
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Thông báo email */}
            <p
              className={`text-sm text-center ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Chúng tôi đã gửi mã xác thực đến email{" "}
              <span
                className={`font-semibold ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                {email}
              </span>
              . Vui lòng kiểm tra hộp thư và nhập mã OTP bên dưới.
            </p>

            {/* Mã xác thực */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <Label>Mã xác thực (OTP)</Label>
                  <FormControl>
                    <Input
                      placeholder="Nhập mã..."
                      {...field}
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Xác thực
            </Button>
          </form>
        </Form>

        <div className="mt-3 text-center text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            {resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown}s`
              : "Gửi lại mã"}
          </button>
        </div>

        <p
          className={`text-center text-sm mt-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <button
            type="button"
            onClick={onSwitchToForgot}
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Quay lại
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
