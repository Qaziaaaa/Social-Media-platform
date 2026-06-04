import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Story } from "@/types";

interface Props {
  hasActiveStory?: boolean;
}

export function StoryUploadButton({ hasActiveStory }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploadRes } = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await api.post<ApiResponse<Story>>("/stories", { mediaUrl: uploadRes.data.url });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.following() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.user(user!.id) });
      toast.success("Story created");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create story";
      toast.error(msg);
    },
    onSettled: () => {
      submittingRef.current = false;
      if (fileRef.current) fileRef.current.value = "";
    },
  });

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (submittingRef.current) return;
          const file = e.target.files?.[0];
          if (file) {
            submittingRef.current = true;
            mutation.mutate(file);
          }
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={mutation.isPending}
        className="flex shrink-0 flex-col items-center gap-1"
      >
        {hasActiveStory ? (
          <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-surface p-[2px]">
              <img
                src={user?.avatar ?? "/default-avatar.png"}
                alt={user?.fullName ?? ""}
                className="h-14 w-14 rounded-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-dashed border-on-surface-variant">
            {mutation.isPending ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <svg className="h-6 w-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
        )}
        <span className="text-xs text-on-surface-variant">{hasActiveStory ? "You" : "Add"}</span>
      </button>
    </>
  );
}
