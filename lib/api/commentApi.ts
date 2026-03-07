import { Comment, CreateCommentRequest } from "@/types/comment";
import { toast } from "sonner";
import { api } from "./axiosClient";

export const commentAPI = {

  // Tạo comment mới
    createComment: async (data: CreateCommentRequest) => {
  const formData = new FormData();
  formData.append("content", data.content || "");
  if (data.userId) formData.append("userId", data.userId.toString());
  if (data.songId) formData.append("songId", data.songId.toString());
  if (data.parentId) formData.append("parentId", data.parentId.toString());

  try {
    const response = await api.post("/comment/Create", formData);
    return response.data;
  } catch (error: unknown) {
  console.error("Error creating comment:", error);

  if (error && typeof error === "object" && "response" in error) {
    const err = error as {
      response?: { data?: { message?: string } };
    };

    toast.error(err.response?.data?.message || "Bình luận chứa nội dung không phù hợp.");
  } else {
    toast.error("Có lỗi xảy ra khi tạo bình luận.");
  }

  throw error;
}
},

    // Lấy comments theo songId với phân trang
  getCommentsBySongId: async (songId: number, page = 1, pageSize = 20) => {
  try {
    const response = await api.get(`/comment/GetBySong/song/${songId}`, {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
},

  // sửa comment
    updateComment: async (data: Comment) => {
    const formData = new FormData();
    if (data.id) formData.append("id", data.id.toString());
    if (data.content) formData.append("content", data.content);
    try {
      const response = await api.put("/comment/Update", formData);
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Có lỗi xảy ra khi cập nhật bình luận.");
      throw error;
    }
  },

  // xoá comment
    deleteComment: async (commentId: number) => {
        const response = await api.delete(`/comment/Delete/${commentId}`, {
          headers: {
            accept: "text/plain",
          },
        });
        return response.data;
      },

  // Lấy số lượng comment của bài hát
  getCommentsCountBySongId: async (songId: number) => {
    try {
      const response = await api.get(`/comment/GetCountComments/${songId}`);
      return response.data.data; // Giả sử API trả về { count: number }
    } catch (error) {
      console.error("Error fetching comments count:", error);
      throw error;
    }
  },
};