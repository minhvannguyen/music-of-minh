"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useTheme } from "@/contexts/themeContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm({
  onSuccess,
  onSwitchToForgot,
}: {
  onSuccess: () => void;
  onSwitchToForgot: () => void;
}) {
  const { theme } = useTheme();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        toast.success("Đăng nhập thành công!");
        onSuccess();
      } else {
        toast.error(result.message || "Đăng nhập thất bại! sai tài khoản hoặc mặt khẩu!");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại!"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label>Mật khẩu</Label>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu..."
                    {...field}
                    className={`${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-sm text-blue-600 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          {loading && <Loader2 className="animate-spin mr-2" />} Đăng nhập
        </Button>
      </form>
    </Form>
  );
}
