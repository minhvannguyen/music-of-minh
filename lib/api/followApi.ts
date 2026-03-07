import { toast } from "sonner";
import { api } from "./axiosClient";

export const followAPI = {
  // Theo dõi người dùng
  followUser: async (userId: number) => {
    try {
      const response = await api.post(`/Follow/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Có lỗi xảy ra khi theo dõi người dùng.");
      throw error;
    }
  },
  // Bỏ theo dõi người dùng
  unfollowUser: async (userId: number) => {
    try {
      const response = await api.delete(`/Follow/Unfollow/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Có lỗi xảy ra khi bỏ theo dõi người dùng.");
      throw error;
    }
  },

  // kiểm tra có đang theo dõi người dùng không
  isFollowing: async (userId: number) => {
    try {
      const response = await api.get(`/Follow/is-following/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error checking follow status:", error);
      throw error;
    }
  },

  // Lấy danh sách người dùng đang theo dõi
  getFollowingUsers: async (userId: number) => {
    try {
      const response = await api.get(`/Follow/GetFollowing/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching following users:", error);
      throw error;
    }
  },

  // Lấy danh sách người dùng theo dõi bạn
  getFollowers: async (userId: number) => {
    try {
      const response = await api.get(`/Follow/GetFollowers/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching followers:", error);
      throw error;
    }
  },


};
