import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Report } from "@/types";

const statusFilters = ["all", "pending", "resolved", "dismissed"];

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report updated");
    },
    onError: () => {
      toast.error("Failed to update report");
    },
  });

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Admin: Reports</h1>

      <div className="flex gap-sm">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 font-label-md text-label-md rounded-full transition-colors capitalize ${
              statusFilter === s
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-surface rounded-xl p-lg text-center ambient-shadow border border-surface-container-high">
          <p className="text-on-surface-variant">No reports found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {data.map((report) => (
            <div
              key={report.id}
              className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high"
            >
              <div className="flex items-start justify-between gap-md mb-sm">
                <div className="flex items-center gap-sm">
                  <span className={`px-2 py-0.5 rounded-full text-label-sm font-label-sm capitalize ${
                    report.status === "pending"
                      ? "bg-warning/20 text-warning"
                      : report.status === "resolved"
                      ? "bg-success/20 text-success"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    {report.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-label-sm font-label-sm capitalize text-on-surface-variant">
                    {report.targetType}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface mb-sm">{report.reason}</p>

              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Reported by{" "}
                <Link to={`/profile/${report.reporter.id}`} className="text-primary hover:underline">
                  @{report.reporter.username}
                </Link>
              </div>

              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Target: <span className="text-on-surface font-medium">{report.targetId.slice(0, 12)}...</span>
              </div>

              {report.status === "pending" && (
                <div className="flex gap-sm mt-md pt-md border-t border-surface-container-high">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate({ id: report.id, status: "resolved" })}
                  >
                    Resolve
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
          ))}
        </div>
      )}
    </div>
  );
}
