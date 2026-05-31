import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import api from "@/services/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Post } from "@/types";

export function PostForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { data: uploadRes } = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const { data } = await api.post<ApiResponse<Post>>("/posts", { content, imageUrl });
      return data.data;
    },
    onSuccess: () => {
      setContent("");
      setFile(null);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      toast.success("Post created");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create post";
      toast.error(msg);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 animate-fade-in">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.fullName ?? "You"} size="md" />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden ring-1 ring-border-subtle">
              <img src={preview} alt="Preview" className="max-h-48 w-full object-cover" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white/80 backdrop-blur-sm hover:bg-black/80 hover:text-white transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[#64748b] transition-colors hover:bg-surface-hover hover:text-[#22d3ee]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              Photo
            </button>
            <Button
              type="submit"
              size="sm"
              loading={mutation.isPending}
              disabled={!content.trim() && !file}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
