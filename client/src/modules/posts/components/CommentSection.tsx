import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
        `/posts/${postId}/comments`,
      );
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: string) => {
      const { data } = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content: body });
      return data.data;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate(content);
  };

  const comments = data?.items ?? [];

  return (
    <div className="card p-4 animate-fade-in">
      <h3 className="mb-4 font-display text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
        Comments
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <Avatar src={user.avatar} alt={user.fullName} size="sm" />
          <div className="flex flex-1 gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <Button
              type="submit"
              size="sm"
              loading={createMutation.isPending}
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-2" style={{ animationDelay: `${i * 100}ms` }}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-[#64748b]">Failed to load comments</p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-sm text-[#475569]">No comments yet. Start the conversation.</p>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="mb-3 flex gap-2 last:mb-0 group">
          <Avatar src={comment.author.avatar} alt={comment.author.fullName} size="sm" />
          <div className="flex-1 rounded-lg bg-surface px-3 py-2">
            <p className="text-sm font-medium text-[#e2e8f0]">{comment.author.fullName}</p>
            <p className="text-sm text-[#94a3b8] leading-relaxed">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
