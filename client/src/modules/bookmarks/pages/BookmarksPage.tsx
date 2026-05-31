import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PostCard } from "@/modules/posts/components/PostCard";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Post, PaginatedResponse } from "@/types";

export function BookmarksPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "10");
      const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>(`/bookmarks?${params}`);
      return data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Bookmarks</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface rounded-xl p-lg text-center ambient-shadow border border-surface-container-high">
          <p className="text-on-surface-variant">No bookmarks yet. Save posts to read later.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasNextPage && (
            <div className="flex justify-center py-4">
              <Button variant="ghost" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
