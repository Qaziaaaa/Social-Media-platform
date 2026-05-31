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
      <div className="flex flex-col gap-lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high space-y-3">
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
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">Failed to load posts</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (posts.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
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
