import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import { EditPostModal } from "@/modules/posts/components/EditPostModal";
import type { ApiResponse, Post } from "@/types";

const HASHTAG_REGEX = /(#\w+)/g;

function renderContent(text: string) {
  const parts = text.split(HASHTAG_REGEX);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return (
        <Link
          key={i}
          to={`/explore?q=${encodeURIComponent(tag)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-primary hover:underline"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user?.id === post.authorId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const repostMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Post>>(`/posts/${post.id}/repost`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      toast.success("Reposted");
    },
    onError: () => {
      toast.error("Failed to repost");
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (post.isBookmarked) {
        await api.delete(`/bookmarks/posts/${post.id}/bookmark`);
      } else {
        await api.post(`/bookmarks/posts/${post.id}/bookmark`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() });
      toast.success(post.isBookmarked ? "Bookmark removed" : "Bookmarked");
    },
    onError: () => {
      toast.error("Failed to update bookmark");
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
    <>
      <article className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high animate-fade-in">
        <div className="flex justify-between items-start mb-md">
          <div className="flex gap-md items-center">
            <Link to={`/profile/${post.author.id}`}>
              <Avatar src={post.author.avatar} alt={post.author.fullName} />
            </Link>
            <div>
              <Link to={`/profile/${post.author.id}`} className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors">
                {post.author.fullName}
              </Link>
              <div className="font-body-sm text-body-sm text-on-surface-variant">@{post.author.username}</div>
            </div>
          </div>
          {isOwner && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-on-surface-variant hover:text-error hover:bg-surface-container-low p-xs rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-xs bg-surface rounded-lg shadow-lg border border-surface-container-high py-xs min-w-[120px] z-10 animate-fade-in">
                  <button
                    onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                    className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (confirm("Delete this post?")) deleteMutation.mutate();
                    }}
                    className="w-full flex items-center gap-sm px-md py-sm text-label-md text-error hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      {post.content && (
        <div
          onClick={() => navigate(`/posts/${post.id}`)}
          className="block mb-md cursor-pointer"
        >
          <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
            {renderContent(post.content)}
          </p>
        </div>
      )}

      {post.imageUrl && (
        <div
          onClick={() => navigate(`/posts/${post.id}`)}
          className="rounded-lg overflow-hidden mb-md border border-surface-container-high cursor-pointer"
        >
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-on-surface-variant pt-xs border-t border-surface-container-high">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group ${
            post.isLiked ? "text-tertiary" : ""
          }`}
        >
          <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${post.isLiked ? "text-tertiary" : ""}`} style={post.isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            favorite
          </span>
          <span className="font-label-sm text-label-sm">{post._count.likes}</span>
        </button>
        <Link
          to={`/posts/${post.id}`}
          className="flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
          <span className="font-label-sm text-label-sm">{post._count.comments}</span>
        </Link>
        <button
          onClick={() => repostMutation.mutate()}
          className="flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">repeat</span>
        </button>
        <button
          onClick={() => bookmarkMutation.mutate()}
          className={`flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group ${
            post.isBookmarked ? "text-primary" : ""
          }`}
        >
          <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${post.isBookmarked ? "text-primary" : ""}`} style={post.isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            bookmark
          </span>
        </button>
      </div>
    </article>

      {editOpen && <EditPostModal post={post} onClose={() => setEditOpen(false)} />}
    </>
  );
}
