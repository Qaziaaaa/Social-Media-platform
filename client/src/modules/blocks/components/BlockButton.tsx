import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";

interface BlockButtonProps {
  userId: string;
  isBlocked: boolean;
  onToggle?: () => void;
}

export function BlockButton({ userId, isBlocked, onToggle }: BlockButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (isBlocked) {
        await api.delete(`/users/${userId}/block`);
      } else {
        await api.post(`/users/${userId}/block`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.check(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      onToggle?.();
    },
    onError: () => {
      toast.error("Failed to update block status");
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="w-full flex items-center gap-sm px-md py-sm text-label-md text-error hover:bg-surface-container-low transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">block</span>
      {isBlocked ? "Unblock" : "Block"}
    </button>
  );
}
