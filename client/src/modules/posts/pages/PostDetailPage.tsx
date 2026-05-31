import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/modules/posts/components/PostCard";
import { CommentSection } from "@/modules/posts/components/CommentSection";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Post } from "@/types";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Post>>(`/posts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">Post not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <PostCard post={data} />
      <CommentSection postId={data.id} />
    </div>
  );
}
