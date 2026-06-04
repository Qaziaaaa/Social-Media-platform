import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/modules/auth/hooks/useAuth";
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

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar">
        <StoryUploadButton hasActiveStory={!!(myStories?.length)} />
        {allGroups.map((group, idx) => (
          <button
            key={group.user.id}
            onClick={() => setViewerIndex(idx)}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="rounded-full bg-surface p-[2px]">
                <img
                  src={group.user.avatar ?? "/default-avatar.png"}
                  alt={group.user.fullName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="max-w-[4rem] truncate text-xs text-on-surface-variant">
              {group.user.fullName.split(" ")[0]}
            </span>
          </button>
        ))}
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
