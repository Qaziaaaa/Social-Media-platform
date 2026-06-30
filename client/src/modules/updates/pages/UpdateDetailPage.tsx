import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UpdateCard } from "@/modules/updates/components/UpdateCard";
import { CommentSection } from "@/modules/updates/components/CommentSection";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Update } from "@/types";

export function UpdateDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.updates.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Update>>(`/updates/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
        <p className="text-on-surface-variant">Update not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <UpdateCard update={data} />
      <CommentSection updateId={data.id} />
    </div>
  );
}
