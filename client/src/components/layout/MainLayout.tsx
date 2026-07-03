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
    <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-container selection:text-on-primary">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pt-[72px] md:pt-0 pb-[80px] md:pb-0 min-h-screen flex gap-gutter">
        <Navbar />
        <main className="flex-1 max-w-[640px] w-full mx-auto py-lg min-h-screen">
          <Outlet />
        </main>
        <aside className="hidden xl:flex flex-col gap-lg py-lg w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto no-scrollbar">
          <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Trending</h3>
            {!trending ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : trending.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No trending topics yet</p>
            ) : (
              <div className="flex flex-col gap-md">
                {trending.map((t) => (
                  <Link
                    key={t.tag}
                    to={`/explore?q=${encodeURIComponent(t.tag)}`}
                    className="hover:bg-surface-container-low p-sm -mx-sm rounded-lg transition-colors"
                  >
                    <div className="font-label-md text-label-md text-on-surface font-bold">#{t.tag}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{t.count} posts</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Notifications</h3>
              <RecentNotifications />
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Suggested</h3>
              <div className="flex flex-col gap-md">
                {suggestions.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-sm hover:bg-surface-container-low p-sm -mx-sm rounded-lg transition-colors"
                  >
                    <Avatar src={u.avatar} alt={u.fullName} size="sm" />
                    <div className="min-w-0">
                      <div className="font-label-md text-label-md text-on-surface truncate">{u.fullName}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant truncate">@{u.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <footer className="flex flex-wrap gap-x-4 gap-y-2 px-md">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">About</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Help</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/legal/PRIVACY_POLICY.md">Privacy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/legal/TERMS_OF_SERVICE.md">Terms</a>
            <div className="w-full mt-xs font-body-sm text-body-sm text-on-surface-variant">© 2026 Forge</div>
          </footer>
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
    return <p className="font-body-sm text-body-sm text-on-surface-variant">No recent notifications</p>;
  }

  return (
    <div className="flex flex-col gap-sm">
      {data.map((n) => (
        <Link
          key={n.id}
          to={n.entityId ? `/updates/${n.entityId}` : `/profile/${n.actorId}`}
          className="flex items-center gap-sm hover:bg-surface-container-low p-sm -mx-sm rounded-lg transition-colors"
        >
          <Avatar src={n.actor.avatar} alt={n.actor.fullName} size="sm" />
          <div className="min-w-0 text-sm">
            <span className="font-medium text-on-surface">{n.actor.fullName}</span>{" "}
            <span className="text-on-surface-variant">
              {n.type === "like" ? "liked your post" : n.type === "follow" ? "followed you" : "interacted"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
