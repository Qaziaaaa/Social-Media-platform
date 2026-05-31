import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Post } from "@/types";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl = post.imageUrl ?? undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { data: uploadRes } = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const { data } = await api.patch<ApiResponse<Post>>(`/posts/${post.id}`, { content, imageUrl });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(post.id) });
      toast.success("Post updated");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-md"
    >
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high w-full max-w-lg animate-scale-in">
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface">Edit post</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-inverse-primary outline-none transition-all resize-none placeholder:text-on-surface-variant mb-md"
        />

        {(preview || post.imageUrl) && (
          <div className="relative rounded-xl overflow-hidden border border-surface-container-high mb-md">
            <img
              src={preview ?? post.imageUrl!}
              alt="Preview"
              className="max-h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white/80 backdrop-blur-sm hover:bg-black/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-sm border-t border-outline-variant">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:bg-surface-container-low p-sm rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-sm">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={mutation.isPending}
              disabled={!content.trim() && !file}
              onClick={() => mutation.mutate()}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
