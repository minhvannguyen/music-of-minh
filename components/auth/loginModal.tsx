"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/themeContext"; // 👈 lấy theme hiện tại

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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

export default function LoginModal({
  open,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}) {
  const { theme } = useTheme(); // 👈 theme: "light" | "dark"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Login:", values);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`
          sm:max-w-md backdrop-blur-md border shadow-xl rounded-2xl transition-all
          ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700 text-white"
              : "bg-white/90 border-gray-200 text-gray-900"
          }
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Đăng nhập
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className={`
                        ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                      `}
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
                        className={`
                          ${
                            theme === "dark"
                              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          }
                        `}
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

            {/* Quên mật khẩu */}
            <div className="text-right">
              <button
                onClick={onSwitchToForgot}
                type="button"
                className={`text-sm hover:underline ${
                  theme === "dark"
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Nút đăng nhập */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Đăng nhập
            </Button>
          </form>
        </Form>

        {/* Hoặc */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span
              className={`w-full border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span
              className={`px-2 ${
                theme === "dark"
                  ? "bg-gray-900 text-gray-400"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Hoặc
            </span>
          </div>
        </div>

        {/* Đăng nhập bằng Google */}
        <Button
          variant="outline"
          className={`w-full flex items-center justify-center gap-2 border ${
            theme === "dark"
              ? "border-gray-700 hover:bg-gray-800 text-gray-200"
              : "border-gray-300 hover:bg-gray-100 text-gray-800"
          }`}
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-0.5 0 48 48"
          >
            <path
              fill="#FBBC05"
              d="M9.827 24c0-1.524.253-2.986.705-4.357L2.623 13.604C1.082 16.734.214 20.26.214 24c0 3.737.868 7.262 2.407 10.388l7.905-6.051A14.56 14.56 0 0 1 9.827 24"
            />
            <path
              fill="#EB4335"
              d="M23.714 10.133c3.311 0 6.302 1.173 8.652 3.093l6.836-6.827C35.036 2.773 29.695.533 23.714.533c-9.287 0-17.268 5.311-21.09 13.071l7.909 6.04C12.355 14.112 17.55 10.133 23.714 10.133"
            />
            <path
              fill="#34A853"
              d="M23.714 37.867c-6.165 0-11.36-3.979-13.182-9.511L2.623 34.395C6.445 42.156 14.427 47.467 23.714 47.467c5.732 0 11.204-2.035 15.312-5.849l-7.507-5.804a14.55 14.55 0 0 1-7.805 2.053"
            />
            <path
              fill="#4285F4"
              d="M46.145 24c0-1.387-.213-2.88-.534-4.267H23.714v9.067h12.604a11.98 11.98 0 0 1-4.8 7.014l7.507 5.804C43.339 37.614 46.145 31.65 46.145 24"
            />
          </svg>
          Đăng nhập bằng Google
        </Button>

        {/* Đăng ký */}
        <p
          className={`text-center text-sm mt-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            type="button"
            className={`font-medium hover:underline ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Đăng ký
          </button>
          
        </p>
      </DialogContent>
    </Dialog>
  );
}
