"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { followAPI } from "@/lib/api/followApi";

interface FollowUser {
  userId: number;
  username: string;
  avatar?: string;
}

type FollowType = "followers" | "following";

export default function FollowPopup({
  userId,
  type,
  onClose,
}: {
  userId: number;
  type: FollowType;
  onClose: () => void;
}) {
  const router = useRouter();

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  const buildFullUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;

        if (type === "followers") {
          res = await followAPI.getFollowers(userId);
        } else {
          res = await followAPI.getFollowingUsers(userId);
        }

        setUsers(res);
      } catch (err) {
        console.error("Fetch follow error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, type]);

  const handleClickUser = (id: number) => {
    router.push(`/profile/${id}`);
    onClose();
  };

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">

      <div className="w-[420px] max-h-[520px] bg-slate-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 mb-4">
          <h2 className="text-2xl font-semibold text-yellow-500">{title}</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-yellow-500 hover:bg-neutral-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar">

          {loading && (
            <div className="p-6 text-center text-gray-400">
              Loading...
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              chơi mình!
            </div>
          )}

          {!loading &&
            users.map((user) => (
              <div
                key={user.userId}
                onClick={() => handleClickUser(user.userId)}
                className="flex items-center gap-4 px-8 py-3 hover:bg-neutral-200 transition cursor-pointer"
              >
                <img
                  src={buildFullUrl(user.avatar || "")}
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-lg">
                    {user.username}
                  </span>
                </div>
              </div>
            ))}

        </div>
      </div>
    </div>
  );
}