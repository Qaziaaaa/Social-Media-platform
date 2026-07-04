import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchNotifications, markAllNotificationsRead } from "../api";
import type { Notification } from "@/types";

function NotificationItem({ n }: { n: Notification }) {
  const typeLabel = (type: string) => {
    switch (type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "follow": return "started following you";
      case "comment_like": return "liked your comment";
      default: return "interacted with you";
    }
  };

  return (
    <Link
      to={n.entityId ? `/updates/${n.entityId}` : `/profile/${n.actorId}`}
      className={`flex items-center gap-md p-md rounded-xl transition-colors hover:bg-surface-hover ${
        n.read ? "" : "bg-primary-container/10"
      }`}
    >
      <Avatar src={n.actor.avatar} alt={n.actor.fullName} size="md" />
      <div className="flex-1 min-w-0">
        <span className="font-label-md text-label-md text-text">{n.actor.fullName}</span>{" "}
        <span className="font-body-md text-body-md text-text-secondary">{typeLabel(n.type)}</span>
      </div>
      {!n.read && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
    </Link>
  );
}

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }: { pageParam?: string }) => fetchNotifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const hasUnread = (data?.pages[0]?.items ?? []).some((n) => !n.read);
  useEffect(() => {
    if (hasUnread && !markAllMutation.isPending) {
      markAllMutation.mutate();
    }
  }, [hasUnread]);

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-text">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-md p-md">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="card p-lg text-center">
          <p className="text-text-secondary">No notifications yet</p>
        </div>
      )}

      <div className="flex flex-col gap-xs">
        {notifications.map((n) => (
          <NotificationItem key={n.id} n={n} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button variant="ghost" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
