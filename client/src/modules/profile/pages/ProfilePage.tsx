import { useState, useCallback, useRef, useEffect } from "react";
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
import type { ApiResponse, User, Post, PaginatedResponse, Report } from "@/types";
import { BlockButton } from "@/modules/blocks/components/BlockButton";

type Tab = "posts" | "likes" | "media";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?.id === id;
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const endpointMap: Record<Tab, string> = {
    posts: `/users/${id}/posts`,
    likes: `/users/${id}/liked-posts`,
    media: `/users/${id}/media-posts`,
  };

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.users.posts(id!), activeTab],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "10");
      const { data } = await api.get<ApiResponse<PaginatedResponse<Post>>>(
        `${endpointMap[activeTab]}?${params}`,
      );
      return data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!id,
  });

  const handleSetTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Report>>("/reports", {
        targetType: "user",
        targetId: id,
        reason: reportReason,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Report submitted");
      setReportOpen(false);
      setReportReason("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to submit report");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">User not found</p>
      </div>
    );
  }

  const isFollowing = (data as any).isFollowing ?? false;
  const isBlocked = (data as any).isBlocked ?? false;
  const posts = postsData?.pages.flatMap((p) => p.items) ?? [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "likes", label: "Likes" },
    { key: "media", label: "Media" },
  ];

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <section className="bg-surface rounded-xl ambient-shadow overflow-hidden border border-surface-container-high">
        <div className="h-48 md:h-64 w-full bg-surface-variant relative">
          {data.coverImage && (
            <img src={data.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-lg pb-lg relative">
          <div className="absolute -top-16 left-lg">
            <div className="relative w-32 h-32 rounded-full border-4 border-surface overflow-hidden bg-surface shadow-sm">
              <Avatar src={data.avatar} alt={data.fullName} size="lg" className="w-full h-full" />
            </div>
          </div>

          <div className="flex justify-end pt-4 mb-4">
            {isOwnProfile ? (
              <Link to={`/profile/${id}/edit`}>
                <Button variant="secondary" size="sm">Edit Profile</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-sm">
                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  size="sm"
                  loading={followMutation.isPending}
                  onClick={() => followMutation.mutate()}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <div ref={moreRef} className="relative">
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low p-sm rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 top-full mt-xs bg-surface rounded-lg shadow-lg border border-surface-container-high py-xs min-w-[140px] z-10 animate-fade-in">
                      <BlockButton
                        userId={id!}
                        isBlocked={isBlocked}
                        onToggle={() => setMoreOpen(false)}
                      />
                      <button
                        onClick={() => { setMoreOpen(false); setReportOpen(true); }}
                        className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">flag</span>
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{data.fullName}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">@{data.username}</p>
            {data.bio && (
              <p className="font-body-md text-body-md text-on-surface mb-4 max-w-2xl">{data.bio}</p>
            )}
            <div className="flex gap-6 border-t border-surface-container-high pt-4">
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-on-surface">{data._count.posts}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Posts</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-on-surface">{data._count.followers}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Followers</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-on-surface">{data._count.following}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Following</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex border-b border-surface-container-high mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSetTab(tab.key)}
            className={`flex-1 py-4 font-label-md text-label-md transition-colors ${
              activeTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-md">
        {postsLoading && (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        )}
        {!postsLoading && posts.length === 0 && (
          <div className="bg-surface rounded-xl p-lg text-center ambient-shadow border border-surface-container-high">
            <p className="text-on-surface-variant">
              {activeTab === "likes" ? "No liked posts yet" : activeTab === "media" ? "No media posts yet" : "No posts yet"}
            </p>
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

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => { setReportOpen(false); setReportReason(""); }}
        >
          <div
            className="bg-surface rounded-xl p-lg shadow-xl border border-surface-container-high w-full max-w-md mx-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Report user</h3>
            <div className="space-y-sm mb-lg">
              {["Spam","Harassment","Hate speech","Misinformation","Violence","Inappropriate content","Other"].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-sm p-sm rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <input
                    type="radio"
                    name="profileReportReason"
                    value={r}
                    checked={reportReason === r}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => { setReportOpen(false); setReportReason(""); }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason || reportMutation.isPending}
                className="px-4 py-2 font-label-md text-label-md bg-error text-on-error rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
