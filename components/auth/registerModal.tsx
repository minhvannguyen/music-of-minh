"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ✅ Schema đăng ký
const registerSchema = z
  .object({
    userName: z
      .string()
      .min(1, "Tên phải có ít nhất 2 ký tự")
      .max(50, "Tên quá dài"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function RegisterModal({
  open,
  onClose,
  onSwitchToLogin,
  onOpenVerify,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onOpenVerify: (email: string, userData: { username: string; email: string; password: string }) => void;
}) {
  const { theme } = useTheme();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      
      // Gọi API đăng ký để gửi OTP
      const result = await register(values.email);
      
      if (result.success) {
        toast.success("Mã xác nhận đã được gửi tới email của bạn!");
        // Mở modal verify với email và thông tin user
        onOpenVerify(values.email, {
          username: values.userName,
          email: values.email,
          password: values.password
        });
      } else {
        toast.error(result.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`
          sm:max-w-md backdrop-blur-md border shadow-xl rounded-2xl transition-all
          ${theme === "dark"
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white/90 border-gray-200 text-gray-900"}
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Đăng ký tài khoản
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User name */}
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <Label>Tên của bạn</Label>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên của bạn..."
                      type="text"
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

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input
                      placeholder="Nhập email..."
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

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Mật khẩu</Label>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Nhập mật khẩu..."
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className={`${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-2 top-2 transition-colors ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Nhập lại mật khẩu..."
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        className={`mb-6 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-2 top-2 transition-colors ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nút đăng ký */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Đăng ký
            </Button>
          </form>
        </Form>

        {/* Đăng nhập */}
        <p
          className={`text-center text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Đã có tài khoản?{" "}
          <button
            onClick={onSwitchToLogin}
            type="button"
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Đăng nhập
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
