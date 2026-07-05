import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Report, User } from "@/types";

const statusFilters = ["pending", "resolved", "dismissed"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TargetPreview({ report }: { report: Report }) {
  const target = report.target as Record<string, unknown> | null;
  const author = target?.author as Partial<User> | null;

  if (!target) {
    return (
      <div className="px-4 py-3 bg-surface-hover/50 rounded-lg border border-border italic text-text-secondary text-sm">
        Content was deleted
      </div>
    );
  }

  if (report.targetType === "update") {
    return (
      <div className="px-4 py-3 bg-surface-hover/50 rounded-lg border border-border">
        {author && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={author.avatar ?? null} alt={author.fullName ?? ""} size="sm" />
            <div>
              <span className="text-sm font-medium text-text">{author.fullName}</span>
              <span className="text-xs text-text-secondary ml-1.5">@{author.username}</span>
            </div>
          </div>
        )}
        <p className="text-sm text-text leading-relaxed line-clamp-3">
          {target.content as string}
        </p>
      </div>
    );
  }

  if (report.targetType === "user") {
    return (
      <div className="px-4 py-3 bg-surface-hover/50 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Avatar src={(target.avatar as string) ?? null} alt={(target.fullName as string) ?? ""} size="sm" />
          <div>
            <Link to={`/profile/${target.id}`} className="text-sm font-medium text-text hover:text-accent">
              {target.fullName as string}
            </Link>
            <div className="text-xs text-text-secondary">@{target.username as string}</div>
          </div>
        </div>
        {(target.bio as string) && (
          <p className="text-sm text-text-secondary mt-1.5 line-clamp-2">{target.bio as string}</p>
        )}
      </div>
    );
  }

  return null;
}

export function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.reports.all(statusFilter),
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get<ApiResponse<Report[]>>(`/admin/reports${params}`);
      return data.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/reports/${id}`, { status });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(variables.status === "resolved" ? "Action taken — content removed or user suspended" : "Report dismissed");
    },
    onError: () => {
      toast.error("Failed to update report");
    },
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-lg animate-fade-in">
        <h1 className="font-headline-lg text-headline-lg font-bold text-text">Admin: Reports</h1>

        <div className="flex gap-sm flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 font-label-md text-label-md rounded-full transition-colors capitalize ${
                statusFilter === s
                  ? "bg-accent text-white"
                  : "bg-surface-hover text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="card p-lg text-center">
            <p className="text-text-secondary capitalize">No {statusFilter} reports</p>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {data.map((report) => (
              <div key={report.id} className="card">
                <div className="p-lg space-y-4">
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex items-center gap-sm flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-label-sm font-label-sm capitalize ${
                        report.status === "pending"
                          ? "bg-warning/20 text-warning"
                          : report.status === "resolved"
                          ? "bg-success/20 text-success"
                          : "bg-surface-hover text-text-secondary"
                      }`}>
                        {report.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-hover text-label-sm font-label-sm capitalize text-text-secondary">
                        {report.targetType}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-text-secondary shrink-0">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>

                  <p className="font-body-md text-body-md text-text">{report.reason}</p>

                  <TargetPreview report={report} />

                  <div className="flex items-center justify-between gap-sm flex-wrap">
                    <div className="font-body-sm text-body-sm text-text-secondary">
                      Reported by{" "}
                      <Link to={`/profile/${report.reporter.id}`} className="text-accent hover:underline font-medium">
                        @{report.reporter.username}
                      </Link>
                    </div>

                    {report.status === "pending" && (
                      <div className="flex gap-sm">
                        <Button
                          size="sm"
                          variant="danger"
                          loading={resolveMutation.isPending}
                          onClick={() => resolveMutation.mutate({ id: report.id, status: "resolved" })}
                        >
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          Action
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={resolveMutation.isPending}
                          onClick={() => resolveMutation.mutate({ id: report.id, status: "dismissed" })}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
