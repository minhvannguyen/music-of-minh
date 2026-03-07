export interface Comment{
  id: number;
  userId?: number;
  userName?: string;
  avatarUser?: string;
  songId?: number;
  parentId: number | null;
  parentUserName?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  children: Comment[];
}

// Request types cho comment API create
export interface CreateCommentRequest {
  userId?: number | null;
  songId?: number | null;
  parentId: number | null;
  content?: string;
}