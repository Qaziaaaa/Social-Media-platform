import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { AnonymousAvatar } from "@/components/ui/AnonymousAvatar";
import type { ApiResponse, Story, StoryGroup } from "@/types";
import { StoryViewer } from "./StoryViewer";
import { StoryUploadButton } from "./StoryUploadButton";

export function StoryRing() {
  const { user, isAuthenticated } = useAuth();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const { data: groups } = useQuery({
    queryKey: queryKeys.stories.following(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<StoryGroup[]>>("/stories/following");
      return data.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const { data: myStories } = useQuery({
    queryKey: queryKeys.stories.user(user!.id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Story[]>>(`/stories/user/${user!.id}`);
      return data.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const allGroups = useMemo(() => {
    const result: StoryGroup[] = [];
    if (myStories?.length && user) {
      result.push({
        user: { id: user.id, username: user.username, fullName: user.fullName, avatar: user.avatar },
        stories: myStories,
      });
    }
    if (groups) result.push(...groups);
    return result;
  }, [myStories, groups, user]);

  const otherGroups = useMemo(() => {
    if (!user || !allGroups) return allGroups;
    return allGroups.filter((g) => g.user.id !== user.id);
  }, [allGroups, user]);

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="bg-surface rounded-xl ambient-shadow border border-surface-container-high p-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <StoryUploadButton hasActiveStory={!!(myStories?.length)} onViewStory={() => setViewerIndex(0)} />
          {otherGroups.map((group) => {
            const actualIdx = allGroups.findIndex((g) => g.user.id === group.user.id);
            return (
              <button
                key={group.user.id}
                onClick={() => setViewerIndex(actualIdx)}
                className="flex shrink-0 flex-col items-center gap-1 group"
              >
                <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                  <div className="rounded-full bg-surface p-[2px]">
                    {group.user.avatar ? (
                      <Avatar
                        src={group.user.avatar}
                        alt={group.user.fullName}
                        size="lg"
                        className="h-14 w-14"
                      />
                    ) : (
                      <AnonymousAvatar size={56} />
                    )}
                  </div>
                </div>
                <span className="max-w-[4rem] truncate text-[10px] text-on-surface-variant/60 group-hover:text-on-surface-variant transition-colors">
                  {group.user.fullName.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewerIndex !== null && allGroups[viewerIndex] && (
        <StoryViewer
          groups={allGroups}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
