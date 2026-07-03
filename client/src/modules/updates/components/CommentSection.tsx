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
  updateId: string;
}

function CommentItem({
  comment,
  updateId,
  onReply,
  currentUserId,
  onLike,
  onDelete,
}: {
  comment: Comment;
  updateId: string;
  currentUserId?: string;
  onReply: (id: string, username: string) => void;
  onLike: (commentId: string, isLiked: boolean) => void;
  onDelete: (commentId: string) => void;
}) {
  return (
    <div className="flex gap-sm mb-lg last:mb-0">
      <Avatar src={comment.author.avatar} alt={comment.author.fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-surface-hover p-md rounded-xl rounded-tl-none">
          <div className="flex justify-between items-start mb-xs">
            <div className="flex items-baseline gap-xs min-w-0">
              <span className="font-label-md text-label-md text-text truncate">{comment.author.fullName}</span>
              <span className="font-body-sm text-body-sm text-text-secondary shrink-0">@{comment.author.username}</span>
            </div>
            {currentUserId === comment.authorId && (
              <button
                onClick={() => { if (confirm("Delete this comment?")) onDelete(comment.id); }}
                className="text-text-secondary hover:text-danger p-xs rounded-full transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
          <p className="font-body-md text-body-md text-text">{comment.content}</p>
        </div>
        <div className="flex items-center gap-md mt-sm ml-sm text-text-secondary">
          <button
            onClick={() => onLike(comment.id, !!comment.isLiked)}
            className={`flex items-center gap-xs hover:text-accent transition-colors font-label-sm text-label-sm ${comment.isLiked ? "text-tertiary" : ""}`}
          >
            <span className={`material-symbols-outlined text-[16px] ${comment.isLiked ? "text-tertiary" : ""}`} style={comment.isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              favorite
            </span>
            <span>{comment._count.likes}</span>
          </button>
          <button
            onClick={() => onReply(comment.id, comment.author.username)}
            className="flex items-center gap-xs hover:text-accent transition-colors font-label-sm text-label-sm"
          >
            <span className="material-symbols-outlined text-[16px]">reply</span> Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-md pl-md border-l-2 border-border mt-md space-y-md">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                updateId={updateId}
                currentUserId={currentUserId}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ updateId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.updates.comments(updateId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
        `/updates/${updateId}/comments`,
      );
      return data.data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (isLiked) {
        await api.delete(`/comments/${commentId}/like`);
      } else {
        await api.post(`/comments/${commentId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.comments(updateId) });
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.comments(updateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.detail(updateId) });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ body, parentId }: { body: string; parentId?: string }) => {
      const { data } = await api.post<ApiResponse<Comment>>(`/updates/${updateId}/comments`, {
        content: body,
        parentId,
      });
      return data.data;
    },
    onSuccess: () => {
      setContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.comments(updateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.detail(updateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ body: content, parentId: replyTo?.id });
  };

  const comments = data?.items ?? [];

  return (
    <section className="bg-surface rounded-xl p-lg border border-border animate-fade-in">
      <h3 className="font-headline-md text-headline-md text-text mb-lg">
        Comments {data && `(${data.items.length})`}
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-sm mb-xl">
          <Avatar src={user.avatar} alt={user.fullName} size="sm" />
          <div className="flex-1">
            {replyTo && (
              <div className="flex items-center gap-xs mb-xs text-body-sm text-text-secondary">
                <span>Replying to @{replyTo.username}</span>
                <button
                  type="button"
                  onClick={() => { setReplyTo(null); setContent(""); }}
                  className="text-accent hover:underline ml-auto"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Post your reply..."}
              rows={2}
              className="w-full bg-surface border border-border rounded-lg px-md py-sm font-body-md text-body-md text-text focus:border-accent focus:ring-2 focus:ring-accent-subtle outline-none transition-all resize-none placeholder:text-text-secondary"
            />
            <div className="flex justify-end mt-sm">
              <Button
                type="submit"
                size="sm"
                loading={createMutation.isPending}
                disabled={!content.trim()}
              >
                Reply
              </Button>
            </div>
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
        <p className="font-body-sm text-body-sm text-text-secondary">Failed to load comments</p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="font-body-sm text-body-sm text-text-secondary text-center py-lg">No comments yet. Start the conversation.</p>
      )}

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          updateId={updateId}
          currentUserId={user?.id}
          onReply={(id, username) => setReplyTo({ id, username })}
          onLike={(commentId, isLiked) => likeMutation.mutate({ commentId, isLiked })}
          onDelete={(commentId) => deleteMutation.mutate(commentId)}
        />
      ))}
    </section>
  );
}
