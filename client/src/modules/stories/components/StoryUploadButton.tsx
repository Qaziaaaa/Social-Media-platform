import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { AnonymousAvatar } from "@/components/ui/AnonymousAvatar";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Story } from "@/types";

interface Props {
  hasActiveStory?: boolean;
  onViewStory?: () => void;
}

export function StoryUploadButton({ hasActiveStory, onViewStory }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [inputKey, setInputKey] = useState(0);
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
      setInputKey((k) => k + 1);
    },
  });

  return (
    <>
      <input
        key={inputKey}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (mutation.isPending) return;
          const file = e.target.files?.[0];
          if (file) mutation.mutate(file);
        }}
      />
      <button
        onClick={() => {
          if (hasActiveStory && onViewStory) {
            onViewStory();
          } else {
            fileRef.current?.click();
          }
        }}
        disabled={mutation.isPending}
        className="flex shrink-0 flex-col items-center gap-1 group"
      >
        {hasActiveStory ? (
          <div className="relative rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-surface p-[2px]">
              {user?.avatar ? (
                <Avatar src={user.avatar} alt={user.fullName ?? ""} size="lg" className="h-14 w-14" />
              ) : (
                <AnonymousAvatar size={56} />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold shadow-md">
              +
            </div>
          </div>
        ) : (
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-dashed border-on-surface-variant/60 group-hover:border-on-surface-variant transition-colors">
            {mutation.isPending ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <svg className="h-6 w-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
        )}
        <span className="text-[10px] text-on-surface-variant/60 group-hover:text-on-surface-variant transition-colors">
          {hasActiveStory ? "You" : "Add"}
        </span>
      </button>
    </>
  );
}
