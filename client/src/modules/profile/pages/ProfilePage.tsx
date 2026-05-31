import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PostCard } from "@/modules/posts/components/PostCard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, User, Post, PaginatedResponse } from "@/types";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?.id === id;

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.users.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (data) {
        const isFollowing = (data as any).isFollowing ?? false;
        if (isFollowing) {
          await api.delete(`/users/${id}/follow`);
        } else {
          await api.post(`/users/${id}/follow`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id!) });
      toast.success("Follow updated");
    },
    onError: () => {
      toast.error("Failed to update follow");
    },
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.users.posts(id!),
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "10");
      const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>(
        `/users/${id}/posts?${params}`,
      );
      return data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[#64748b]">User not found</p>
      </div>
    );
  }

  const isFollowing = (data as any).isFollowing ?? false;
  const posts = postsData?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-dark via-primary to-[#22d3ee]">
          {data.coverImage && (
            <img
              src={data.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-12 mb-4">
            <Avatar src={data.avatar} alt={data.fullName} size="lg" className="ring-4 ring-[#0b0b10]" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-xl font-bold">{data.fullName}</h1>
              <p className="text-sm text-[#64748b]">@{data.username}</p>
            </div>
            {isOwnProfile ? (
              <Link to={`/profile/${id}/edit`}>
                <Button variant="secondary" size="sm">Edit profile</Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                size="sm"
                loading={followMutation.isPending}
                onClick={() => followMutation.mutate()}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          {data.bio && <p className="mt-2 text-sm text-[#94a3b8] leading-relaxed">{data.bio}</p>}

          <div className="mt-4 flex gap-6 text-sm">
            <span className="font-semibold text-[#e2e8f0]">{data._count.posts} <span className="font-normal text-[#64748b]">posts</span></span>
            <span className="font-semibold text-[#e2e8f0]">{data._count.followers} <span className="font-normal text-[#64748b]">followers</span></span>
            <span className="font-semibold text-[#e2e8f0]">{data._count.following} <span className="font-normal text-[#64748b]">following</span></span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {postsLoading && (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        )}
        {!postsLoading && posts.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-[#475569]">No posts yet</p>
          </div>
        )}
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
    </div>
  );
}
