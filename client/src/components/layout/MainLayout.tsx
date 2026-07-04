import { Outlet, Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useSocket } from "@/services/useSocket";
import type { ApiResponse, User, Notification } from "@/types";

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  useSocket();

  const { data: suggestions } = useQuery({
    queryKey: ["users", "suggestions"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>("/users/suggestions");
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: trending } = useQuery({
    queryKey: ["hashtags", "trending"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ tag: string; count: number }[]>>("/hashtags/trending");
      return data.data;
    },
  });

  return (
    <div className="min-h-screen bg-background text-text antialiased selection:bg-accent-subtle selection:text-accent-text bg-noise">
      <div className="fixed inset-0 pointer-events-none bg-grid" />
      <div className="fixed inset-0 pointer-events-none bg-glow" />
      <div className="relative max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pt-[72px] md:pt-0 pb-[80px] md:pb-0 min-h-screen flex gap-gutter">
        <Navbar />
        <main className="flex-1 max-w-[640px] w-full mx-auto py-lg min-h-screen">
          <Outlet />
        </main>
        <aside className="hidden xl:flex flex-col gap-lg py-lg w-[320px] shrink-0">
          <div className="sticky top-0 flex flex-col gap-lg max-h-screen overflow-y-auto pt-lg pb-lg">
            <div className="glass rounded-xl">
              <div className="p-lg">
                <h3 className="font-headline-md text-headline-md text-text font-semibold mb-md">
                  Trending
                </h3>
                {!trending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : trending.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-text-secondary">No trending topics yet</p>
                ) : (
                  <div className="flex flex-col gap-sm">
                    {trending.map((t, i) => (
                      <Link
                        key={t.tag}
                        to={`/explore?q=${encodeURIComponent(t.tag)}`}
                        className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-hover transition-all duration-200"
                      >
                        <span className="font-label-sm text-label-sm text-text-tertiary w-5 text-right shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-label-md text-label-md text-text font-medium group-hover:text-accent transition-colors truncate">
                            #{t.tag}
                          </div>
                          <div className="font-body-sm text-body-sm text-text-tertiary">
                            {t.count} {t.count === 1 ? "post" : "posts"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <div className="glass rounded-xl">
                <div className="p-lg">
                  <h3 className="font-headline-md text-headline-md text-text font-semibold mb-md">
                    Notifications
                  </h3>
                  <RecentNotifications />
                </div>
              </div>
            )}

            {suggestions && suggestions.length > 0 && (
              <div className="glass rounded-xl">
                <div className="p-lg">
                  <h3 className="font-headline-md text-headline-md text-text font-semibold mb-md">
                    Suggested
                  </h3>
                  <div className="flex flex-col gap-sm">
                    {suggestions.map((u) => (
                      <Link
                        key={u.id}
                        to={`/profile/${u.id}`}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-hover transition-all duration-200"
                      >
                        <Avatar src={u.avatar} alt={u.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="font-label-md text-label-md text-text truncate font-medium">{u.fullName}</div>
                          <div className="font-body-sm text-body-sm text-text-secondary truncate">@{u.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <footer className="flex flex-wrap gap-x-5 gap-y-2 px-lg py-sm">
              <a className="font-body-sm text-body-sm text-text-tertiary hover:text-text-secondary transition-colors" href="#">About</a>
              <a className="font-body-sm text-body-sm text-text-tertiary hover:text-text-secondary transition-colors" href="#">Help</a>
              <a className="font-body-sm text-body-sm text-text-tertiary hover:text-text-secondary transition-colors" href="/legal/PRIVACY_POLICY.md">Privacy</a>
              <a className="font-body-sm text-body-sm text-text-tertiary hover:text-text-secondary transition-colors" href="/legal/TERMS_OF_SERVICE.md">Terms</a>
              <div className="w-full mt-1 font-body-sm text-body-sm text-text-tertiary">© 2026 Forge</div>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RecentNotifications() {
  const { data } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ items: Notification[] }>>("/notifications?limit=3");
      return data.data.items;
    },
    enabled: true,
    refetchInterval: 30000,
  });

  if (!data || data.length === 0) {
    return <p className="font-body-sm text-body-sm text-text-secondary">No recent notifications</p>;
  }

  return (
    <div className="flex flex-col gap-sm">
      {data.map((n) => (
        <Link
          key={n.id}
          to={n.entityId ? `/updates/${n.entityId}` : `/profile/${n.actorId}`}
          className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-hover transition-all duration-200"
        >
          <Avatar src={n.actor.avatar} alt={n.actor.fullName} size="sm" />
          <div className="min-w-0 text-sm">
            <span className="font-medium text-text">{n.actor.fullName}</span>{" "}
            <span className="text-text-secondary">
              {n.type === "like" ? "liked your post" : n.type === "follow" ? "followed you" : "interacted"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
