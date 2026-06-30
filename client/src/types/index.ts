export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  role: string;
  suspended?: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: Pick<User, "id" | "username" | "fullName">;
  targetType: "post" | "comment" | "user";
  targetId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface BlockedUser {
  blockerId: string;
  blockedId: string;
  blocked: Pick<User, "id" | "username" | "fullName" | "avatar">;
  createdAt: string;
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
  isBookmarked?: boolean;
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

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  actor: Pick<User, "id" | "username" | "fullName" | "avatar">;
  type: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: { userId: string; user: Pick<User, "id" | "username" | "fullName" | "avatar">; lastReadAt: string | null }[];
  otherParticipants?: { userId: string; user: Pick<User, "id" | "username" | "fullName" | "avatar">; lastReadAt: string | null }[];
  lastMessage?: Message | null;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: Pick<User, "id" | "username" | "fullName" | "avatar">;
  mediaUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  user: Pick<User, "id" | "username" | "fullName" | "avatar">;
  stories: Story[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  techStack: string[];
  status: "idea" | "in_progress" | "testing" | "completed" | "archived";
  visibility: "public" | "private";
  userId: string;
  user?: Pick<User, "id" | "username" | "fullName" | "avatar">;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Pick<User, "id" | "username" | "fullName" | "avatar">;
  content: string;
  createdAt: string;
}
