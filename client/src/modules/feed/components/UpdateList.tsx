import { useInfiniteQuery } from "@tanstack/react-query";
import { UpdateCard } from "@/modules/updates/components/UpdateCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, Update } from "@/types";

async function fetchFeed({ pageParam }: { pageParam?: string }) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  params.set("limit", "10");

  const { data } = await api.get<ApiResponse<PaginatedResponse<Update>>>(
    `/updates?${params}`,
  );
  return data.data;
}

export function UpdateList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKeys.updates.feed(),
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
        <p className="text-on-surface-variant">Failed to load updates</p>
      </div>
    );
  }

  const updates = data?.pages.flatMap((page) => page.items) ?? [];

  if (updates.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">No updates yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      {updates.map((update) => (
        <UpdateCard key={update.id} update={update} />
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
