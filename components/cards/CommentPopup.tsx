"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle, Reply, Loader2, Send, Flag } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Comment } from "@/types/comment";
import { commentAPI } from "@/lib/api/commentApi";
import { useAuthContext } from "@/contexts/authContext";
import { useComments } from "@/hooks/useComments";
import ReportDialog from "../ReportDialog";

/* ============================================================
   Helpers
============================================================ */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const buildFullUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
};

const formatNumber = (num: number) =>
  num >= 1_000_000
    ? `${(num / 1_000_000).toFixed(1)}M`
    : num >= 1_000
    ? `${(num / 1_000).toFixed(1)}K`
    : num.toString();

/* ============================================================
   Component: UserAvatar
============================================================ */
const UserAvatar = ({ url }: { url?: string }) => (
  <Image
    src={buildFullUrl(url) || "/default-avatar.png"}
    width={34}
    height={34}
    alt="avatar"
    className="rounded-full bg-white border object-cover"
  />
);

/* ============================================================
   Component: CommentItem (recursive)
============================================================ */
function CommentItem({
  item,
  onReply,
}: {
  item: Comment;
  onReply: (item: Comment) => void;
}) {
  const CHILD_LIMIT = 2;
  const [visibleCount, setVisibleCount] = useState(CHILD_LIMIT);
  const hasMoreChild = visibleCount < item.children.length;
  const [openReport, setOpenReport] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-3"
    >
      <div className="flex gap-3">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar url={item.avatarUser} />
            <div className="mb-1 font-semibold">{item.userName}</div>
          </div>

          {/* Content */}
          <div className="p-3 bg-gray-100 rounded-xl">
            {item.parentUserName && (
              <span className="text-xs">@{item.parentUserName}</span>
            )}
            <p className="font-medium">{item.content}</p>

            <div className="flex justify-between items-center mt-2">
              <button
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                onClick={() => onReply(item)}
              >
                <Reply className="w-3 h-3" />
                Trả lời
              </button>
              <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {new Date(item.createdAt ?? "").toLocaleDateString("vi-VN")}
              </span>
              <button
                className="text-xs text-gray-600 hover:text-red-500"
                onClick={() => setOpenReport(true)}
              >
                <Flag className="w-3 h-3" />
              </button>
              </div>
            </div>
          </div>

          {/* Children */}
          {item.children.length > 0 && (
            <div className="ml-8 border-l pl-3 mt-5">
              {item.children.slice(0, visibleCount).map((child) => (
                <CommentItem key={child.id} item={child} onReply={onReply} />
              ))}

              {hasMoreChild && (
                <button
                  className="text-xs text-blue-600 hover:underline mt-1"
                  onClick={() => setVisibleCount(item.children.length)}
                >
                  Xem thêm {item.children.length - visibleCount} trả lời
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ReportDialog
              open={openReport}
              onOpenChange={setOpenReport}
              targetId={item.id}
              targetType="comment"
            />
    </motion.div>
  );
}

/* ============================================================
   Main Popup Component
============================================================ */
export default function CommentPopup({
  songId,
}: {
  songId: number;
}) {
  const { user, isLoggedIn } = useAuthContext();
  const {
    page,
    setPage,
    commentTree,
    loading,
    hasMore,
    loadPage,
    resetAndLoad,
    totalComments,
    fetchTotalComments,
  } = useComments(songId);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [parentReply, setParentReply] = useState<Comment | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ========== Load comments khi mở popup ========== */
  useEffect(() => {
    if (open) resetAndLoad();
  }, [open, songId]);

  /* ========== Infinite scroll ========== */
  useEffect(() => {
    const div = scrollRef.current;
    if (!div) return;

    const onScroll = () => {
      if (!hasMore || loading) return;
      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 40) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    };

    div.addEventListener("scroll", onScroll);
    return () => div.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loading]);

  /* ========== Submit comment ========== */
  const handleSubmit = async () => {
    if (!isLoggedIn || !user?.id) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }

    if (!content.trim()) {
      toast.error("Bạn chưa nhập nội dung!");
      return;
    }

    await commentAPI.createComment({
      userId: user.id,
      songId,
      content,
      parentId: parentReply?.id ?? null,
    });

    toast.success("Đã gửi bình luận!");
    fetchTotalComments();
    setContent("");
    setParentReply(null);
    resetAndLoad();
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center">
          <div className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 hover:scale-110 transition">
            <MessageCircle className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-xs font-medium mt-2 text-gray-700">
            {formatNumber(totalComments || 0)}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Bình luận{" "}
            <span className="text-xs text-gray-500">
              ({formatNumber(totalComments || 0)})
            </span>
          </DialogTitle>
        </DialogHeader>

        {parentReply && (
          <div className="bg-blue-50 p-2 rounded-lg mb-2 text-sm flex justify-between items-center">
            <span>
              Đang trả lời: <b>{parentReply.content}</b>
            </span>
            <button
              className="text-red-500 text-xs"
              onClick={() => setParentReply(null)}
            >
              Hủy
            </button>
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <Textarea
            ref={inputRef}
            rows={1}
            placeholder="Nhập nội dung bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="pr-12"
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
              content.trim()
                ? "text-primary hover:scale-110"
                : "text-gray-400 opacity-50 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Comment list */}
        <div
          ref={scrollRef}
          className="border-t pt-3 max-h-[65vh] overflow-y-auto"
        >
          {commentTree.length === 0 && !loading ? (
            <p className="text-sm text-gray-500">Chưa có bình luận nào</p>
          ) : (
            commentTree.map((item) => (
              <CommentItem
                key={item.id}
                item={item}
                onReply={(c) => {
                  setParentReply(c);
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }}
              />
            ))
          )}

          {loading && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          {!hasMore && commentTree.length > 0 && (
            <p className="text-gray-500 text-center py-2 text-xs">
              Hết bình luận
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
