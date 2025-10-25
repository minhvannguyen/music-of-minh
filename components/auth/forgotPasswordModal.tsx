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

const forgotSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPasswordModal({
  open,
  onClose,
  onOpenVerify, // (email: string) => void  — gọi modal Verify sau khi gửi thành công
  onSwitchToLogin,
}: {
  open: boolean;
  onClose: () => void;
  onOpenVerify: (email: string) => void;
  onSwitchToLogin: () => void;
}) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    try {
      setLoading(true);
      // TODO: gọi API backend gửi OTP hoặc link reset
      // ví dụ:
      // await fetch("/api/auth/forgot", { method: "POST", body: JSON.stringify(values) })
      await new Promise((r) => setTimeout(r, 900)); // mock
      // giả sử backend gửi OTP thành công -> mở modal Verify
      onClose(); // đóng modal hiện tại
      onOpenVerify(values.email); // mở modal verify với email
    } catch (err) {
      console.error(err);
      // show toast / set form lỗi nếu cần
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-md backdrop-blur-md border shadow-xl rounded-2xl transition-all
          ${theme === "dark"
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white/90 border-gray-200 text-gray-900"}`}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Quên mật khẩu
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email của bạn</Label>
                  <FormControl>
                    <Input
                      placeholder="Nhập email đã đăng ký..."
                      type="email"
                      {...field}
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Chúng tôi sẽ gửi cho bạn mã xác thực (OTP) hoặc link để đặt lại mật khẩu.
            </p>

            <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              {loading && <Loader2 className="animate-spin mr-2" />}
              Gửi mã / Link
            </Button>
          </form>
        </Form>

        <p className={`text-center text-sm mt-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={`font-medium hover:underline ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          >
            Quay lại đăng nhập
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
