"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAuthContext } from "@/contexts/authContext";
import { reportAPI } from "@/lib/api/reportApi";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: number;
  targetType: "song" | "user" | "playlist" | "comment";
}

const reportSchema = z
  .object({
    reason: z.string().min(1, "Vui lòng chọn lý do"),
    otherReason: z.string().optional(),
  })
  .refine(
    (data) =>
      data.reason !== "other" ||
      (data.otherReason && data.otherReason.trim().length > 0),
    {
      message: "Vui lòng nhập lý do cụ thể",
      path: ["otherReason"],
    }
  );

type ReportFormValues = z.infer<typeof reportSchema>;

const REPORT_REASONS = [
  { value: "copyright", label: "Vi phạm bản quyền" },
  { value: "inappropriate", label: "Nội dung phản cảm" },
  { value: "spam", label: "Spam" },
  { value: "misleading", label: "Thông tin sai lệch" },
  { value: "other", label: "Khác" },
];

export default function ReportDialog({
  targetId,
  targetType,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [checking, setChecking] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      otherReason: "",
    },
  });

  const reasonValue = form.watch("reason");

  // ===============================
  // CHECK ALREADY REPORTED
  // ===============================
  const checkReported = useCallback(async () => {
    if (!user?.id) return;

    try {
      setChecking(true);

      const res = await reportAPI.checkAlreadyReported({
        targetId,
      });

      setAlreadyReported(res?.data ?? false);
    } catch (err) {
      console.error("Check report error", err);
    } finally {
      setChecking(false);
    }
  }, [user?.id, targetId]);

  // Khi mở modal -> check
  useEffect(() => {
    if (open) {
      checkReported();
    }
  }, [open, checkReported]);

  // Reset khi đổi target
  useEffect(() => {
    setAlreadyReported(false);
    form.reset();
  }, [targetId]);

  // ===============================
  // SUBMIT
  // ===============================
  const onSubmit = async (values: ReportFormValues) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để báo cáo");
      return;
    }

    if (alreadyReported) {
      toast.error("Bạn đã báo cáo nội dung này rồi");
      return;
    }

    try {
      setLoading(true);

      await reportAPI.create({
        targetId,
        targetType,
        reason:
          values.reason === "other"
            ? values.otherReason!.trim()
            : values.reason,
      });

      toast.success("Báo cáo đã được gửi thành công");

      setAlreadyReported(true);
      handleClose();
    } catch (error: unknown) {
      toast.error(
          "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (state: boolean) => {
    if (!state) {
      form.reset();
    }
    onOpenChange(state);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Báo cáo nội dung</DialogTitle>
        </DialogHeader>

        {checking ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Đang kiểm tra...
          </div>
        ) : alreadyReported ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn đã báo cáo nội dung này trước đó.
            </p>
            <Button onClick={handleClose} className="w-full">
              Đóng
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== "other") {
                            form.setValue("otherReason", "");
                          }
                        }}
                        value={field.value}
                      >
                        {REPORT_REASONS.map((item) => (
                          <div
                            key={item.value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={item.value}
                              id={item.value}
                            />
                            <Label htmlFor={item.value}>
                              {item.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {reasonValue === "other" && (
                <FormField
                  control={form.control}
                  name="otherReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập lý do báo cáo..."
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}