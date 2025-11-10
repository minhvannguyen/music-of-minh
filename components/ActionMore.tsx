import { useState, useRef, useEffect, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Copy, Download, Repeat, MoreHorizontal, Ellipsis } from "lucide-react";

// Hook giúp tự đóng popup khi click ra ngoài
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

interface ActionMoreProps {
  onShare?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onRepeat?: () => void;
  className?: string;
}

export default function ActionMore({
  onShare,
  onCopy,
  onDownload,
  onRepeat,
  className = "",
}: ActionMoreProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef , () => setOpen(false));

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Nút ba chấm */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Ellipsis className="w-6 h-6 text-gray-600" />
      </motion.button>

      {/* Popup menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-14 right-0 z-50 w-44 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col text-sm text-gray-700">
              <button
                onClick={() => {
                  setOpen(false);
                  onShare?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <Share className="w-4 h-4 text-gray-500" />
                Chia sẻ
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onCopy?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                Sao chép liên kết
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDownload?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500" />
                Tải xuống
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onRepeat?.();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <Repeat className="w-4 h-4 text-gray-500" />
                Lặp lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
