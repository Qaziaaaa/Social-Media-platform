import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.id === post.authorId;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        await api.delete(`/posts/${post.id}/like`);
      } else {
        await api.post(`/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  return (
    <article className="card animate-fade-in overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <Link to={`/profile/${post.author.id}`}>
          <Avatar src={post.author.avatar} alt={post.author.fullName} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link
              to={`/profile/${post.author.id}`}
              className="text-sm font-medium text-[#e2e8f0] hover:text-primary transition-colors"
            >
              {post.author.fullName}
            </Link>
            {isOwner && (
              <button
                onClick={() => {
                  if (confirm("Delete this post?")) deleteMutation.mutate();
                }}
                className="text-sm text-[#475569] hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          {post.content && (
            <Link to={`/posts/${post.id}`}>
              <p className="mt-1.5 text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </Link>
          )}

          {post.imageUrl && (
            <Link to={`/posts/${post.id}`}>
              <img
                src={post.imageUrl}
                alt="Post image"
                className="mt-3 rounded-xl object-cover max-h-96 w-full ring-1 ring-border-subtle"
              />
            </Link>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-[#64748b]">
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-1.5 transition-colors ${
                post.isLiked
                  ? "text-red-400 hover:text-red-300"
                  : "hover:text-red-400"
              }`}
            >
              <svg className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={post.isLiked ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {post._count.likes} {post._count.likes === 1 ? "like" : "likes"}
            </button>
            <Link
              to={`/posts/${post.id}`}
              className="flex items-center gap-1.5 hover:text-[#22d3ee] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              {post._count.comments}{" "}
              {post._count.comments === 1 ? "comment" : "comments"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
