export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: Pick<User, "id" | "username" | "fullName" | "avatar">;
  content: string;
  imageUrl: string | null;
  _count: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: Pick<User, "id" | "username" | "fullName" | "avatar">;
  content: string;
  parentId?: string | null;
  isLiked?: boolean;
  replies?: Comment[];
  _count: {
    likes: number;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
