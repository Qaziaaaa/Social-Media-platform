import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { UpdateCard } from "@/modules/updates/components/UpdateCard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, User, Update, PaginatedResponse, Report, Project } from "@/types";
import { BlockButton } from "@/modules/blocks/components/BlockButton";

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700",
  in_progress: "bg-blue-100 text-blue-700",
  testing: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  archived: "bg-surface-hover text-text-secondary",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  archived: "Archived",
};

type Tab = "updates" | "likes" | "media";

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?.id === id;
  const [activeTab, setActiveTab] = useState<Tab>("updates");
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
        if (data.isFollowing) {
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
    updates: `/users/${id}/updates`,
    likes: `/users/${id}/liked-updates`,
    media: `/users/${id}/media-updates`,
  };

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.users.updates(id!), activeTab],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", "10");
      const { data } = await api.get<ApiResponse<PaginatedResponse<Update>>>(
        `${endpointMap[activeTab]}?${params}`,
      );
      return data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!id,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", "user", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>(`/projects/user/${id}`);
      return data.data;
    },
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
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card p-lg text-center">
        <p className="text-text-secondary">User not found</p>
      </div>
    );
  }

  const isFollowing = data.isFollowing ?? false;
  const isBlocked = data.isBlocked ?? false;
  const updates = postsData?.pages.flatMap((p) => p.items) ?? [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "updates", label: "Updates" },
    { key: "likes", label: "Likes" },
    { key: "media", label: "Media" },
  ];

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      {/* Profile Header */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-48 md:h-56 w-full bg-surface-hover relative overflow-hidden">
          {data.coverImage && (
            <img src={data.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-lg pb-lg relative">
          <div className="absolute -top-14 left-lg">
            <div className="flex items-center justify-center w-28 h-28 rounded-full border-[3px] border-bg overflow-hidden bg-surface shadow-lg">
              <Avatar src={data.avatar} alt={data.fullName} size="lg" className="w-full h-full" />
            </div>
          </div>

          <div className="flex justify-end pt-3 mb-4">
            {isOwnProfile ? (
              <Link to={`/profile/${id}/edit`}>
                <Button variant="secondary" size="sm">Edit Profile</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
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
                    className="text-text-secondary hover:text-text hover:bg-surface-hover p-2 rounded-full transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-surface-elevated rounded-xl shadow-lg border border-border py-1 min-w-[150px] z-10 animate-scale-in">
                      <BlockButton
                        userId={id!}
                        isBlocked={isBlocked}
                        onToggle={() => setMoreOpen(false)}
                      />
                      <button
                        onClick={() => { setMoreOpen(false); setReportOpen(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-label-md text-text-secondary hover:bg-surface-hover transition-colors"
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

          <div className="mt-1">
            <h1 className="font-headline-lg text-headline-lg text-text">{data.fullName}</h1>
            <p className="font-body-md text-body-md text-text-secondary mb-4">@{data.username}</p>
            {data.bio && (
              <p className="font-body-md text-body-md text-text mb-4 max-w-2xl leading-relaxed">{data.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
              {data.location && (
                <span className="flex items-center gap-1 text-body-sm text-text-secondary">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {data.location}
                </span>
              )}
              {data.website && (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-body-sm text-accent hover:text-accent-hover transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  {data.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
            {data.skills && data.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge badge-surface"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-6 flex-wrap border-t border-border pt-4">
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-text">{data._count.updates}</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Updates</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-text">{data._count.projects}</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Projects</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-text">{data._count.followers}</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Followers</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-label-md text-label-md text-text">{data._count.following}</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Following</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="card p-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-label-lg text-label-lg text-text font-semibold">Projects</h2>
            {isOwnProfile && (
              <Link to="/projects">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                  <span className="font-body-md text-body-md text-text truncate">{project.name}</span>
                  {project.description && (
                    <span className="text-body-sm text-text-secondary truncate hidden sm:inline">
                      — {project.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {projects.length > 5 && (
              <p className="text-body-sm text-text-secondary text-center pt-1">
                +{projects.length - 5} more projects
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSetTab(tab.key)}
            className={`flex-1 py-3.5 font-label-md text-label-md transition-all duration-200 ${
              activeTab === tab.key
                ? "text-accent border-b-2 border-accent"
                : "text-text-secondary hover:text-text hover:bg-surface-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Updates List */}
      <div className="flex flex-col gap-md">
        {postsLoading && (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        )}
        {!postsLoading && updates.length === 0 && (
          <div className="card p-lg text-center">
            <p className="text-text-secondary">
              {activeTab === "likes" ? "No liked updates yet" : activeTab === "media" ? "No media updates yet" : "No updates yet"}
            </p>
          </div>
        )}
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

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => { setReportOpen(false); setReportReason(""); }}
        >
          <div
            className="bg-surface-elevated rounded-xl p-lg shadow-modal border border-border w-full max-w-md mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-text font-semibold mb-md">Report user</h3>
            <div className="space-y-1 mb-lg">
              {["Spam","Harassment","Hate speech","Misinformation","Violence","Inappropriate content","Other"].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-surface-hover transition-colors"
                >
                  <input
                    type="radio"
                    name="profileReportReason"
                    value={r}
                    checked={reportReason === r}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-accent"
                  />
                  <span className="font-body-md text-body-md text-text">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => { setReportOpen(false); setReportReason(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => reportMutation.mutate()}
                loading={reportMutation.isPending}
                disabled={!reportReason}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
