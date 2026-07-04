import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Milestone } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-surface-hover text-text-secondary",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

function groupByMonth(milestones: Milestone[]): Map<string, Milestone[]> {
  const groups = new Map<string, Milestone[]>();
  for (const m of milestones) {
    const key = m.dueDate
      ? new Date(m.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "No due date";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return groups;
}

export function RoadmapPage() {
  const { isAuthenticated } = useAuth();

  const { data: milestones, isLoading } = useQuery({
    queryKey: queryKeys.milestones.my(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Milestone[]>>("/milestones/me");
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const grouped = useMemo(() => milestones ? groupByMonth(milestones) : new Map(), [milestones]);

  const stats = useMemo(() => {
    if (!milestones) return { total: 0, completed: 0, inProgress: 0, planned: 0 };
    return {
      total: milestones.length,
      completed: milestones.filter((m) => m.status === "completed").length,
      inProgress: milestones.filter((m) => m.status === "in_progress").length,
      planned: milestones.filter((m) => m.status === "planned").length,
    };
  }, [milestones]);

  if (!isAuthenticated) {
    return (
      <div className="card p-lg text-center">
        <p className="text-text-secondary">Sign in to view your roadmap</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-text">Roadmap</h1>
        <p className="font-body-sm text-body-sm text-text-secondary mt-xs">
          Timeline of milestones across your projects
        </p>
      </div>

      {isLoading && (
        <div className="space-y-md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && milestones && milestones.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="card p-md flex-1 min-w-[120px]">
            <p className="font-label-lg text-label-lg text-text font-semibold">{stats.total}</p>
            <p className="text-body-sm text-text-secondary">Total</p>
          </div>
          <div className="card p-md flex-1 min-w-[120px]">
            <p className="font-label-lg text-label-lg text-text font-semibold text-emerald-600">{stats.completed}</p>
            <p className="text-body-sm text-text-secondary">Completed</p>
          </div>
          <div className="card p-md flex-1 min-w-[120px]">
            <p className="font-label-lg text-label-lg text-text font-semibold text-blue-600">{stats.inProgress}</p>
            <p className="text-body-sm text-text-secondary">In Progress</p>
          </div>
          <div className="card p-md flex-1 min-w-[120px]">
            <p className="font-label-lg text-label-lg text-text font-semibold text-text-secondary">{stats.planned}</p>
            <p className="text-body-sm text-text-secondary">Planned</p>
          </div>
        </div>
      )}

      {!isLoading && (!milestones || milestones.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-surface-hover flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-3xl text-text-secondary">timeline</span>
          </div>
          <p className="text-text-secondary text-sm mb-xs">No milestones yet</p>
          <p className="text-xs text-text-secondary/60">
            Create milestones in your projects to build your roadmap
          </p>
        </div>
      )}

      {milestones && milestones.length > 0 && (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-surface-hover" />
          <div className="space-y-lg">
            {Array.from(grouped.entries()).map(([month, items]) => (
              <div key={month}>
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 relative z-10">
                    <span className="material-symbols-outlined text-lg text-text-secondary">
                      {month === "No due date" ? "event_busy" : "event"}
                    </span>
                  </div>
                  <h2 className="font-label-lg text-label-lg text-text font-semibold">{month}</h2>
                </div>
                <div className="ml-[52px] space-y-sm">
                  {items.map((milestone: Milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-surface rounded-lg p-md border border-border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-sm mb-0.5">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[milestone.status]}`}>
                              {STATUS_LABELS[milestone.status]}
                            </span>
                            <span className="font-label-md text-label-md text-text truncate">
                              {milestone.name}
                            </span>
                          </div>
                          {milestone.project && (
                            <Link
                              to={`/projects/${milestone.projectId}`}
                              className="text-body-sm text-accent hover:underline inline-flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">folder</span>
                              {milestone.project.name}
                            </Link>
                          )}
                          {milestone.description && (
                            <p className="text-body-sm text-text-secondary mt-0.5 line-clamp-1">
                              {milestone.description}
                            </p>
                          )}
                          {milestone.dueDate && (
                            <p className="text-[11px] text-text-secondary/60 mt-0.5">
                              {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
