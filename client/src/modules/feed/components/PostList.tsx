import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard } from "@/modules/posts/components/PostCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, Post } from "@/types";

async function fetchFeed({ pageParam }: { pageParam?: string }) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  params.set("limit", "10");

  const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>(
    `/posts?${params}`,
  );
  return data.data;
}

export function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKeys.posts.feed(),
    queryFn: fetchFeed,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[#64748b]">Failed to load posts</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[#475569]">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
