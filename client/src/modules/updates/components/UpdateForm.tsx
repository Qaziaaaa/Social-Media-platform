import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import api from "@/services/api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Update } from "@/types";

export function UpdateForm() {
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

      const { data } = await api.post<ApiResponse<Update>>("/updates", { content, imageUrl });
      return data.data;
    },
    onSuccess: () => {
      setContent("");
      setFile(null);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
      toast.success("Update created");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create update";
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
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high animate-fade-in">
      <div className="flex gap-md">
        <Avatar src={user?.avatar} alt={user?.fullName ?? "You"} size="md" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant resize-none min-h-[80px]"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-surface-container-high mb-sm">
              <img src={preview} alt="Preview" className="max-h-48 w-full object-cover" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white/80 backdrop-blur-sm hover:bg-black/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-sm pt-sm border-t border-outline-variant">
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:bg-surface-container-low p-sm rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">image</span>
              </button>
              <button type="button" className="text-primary hover:bg-surface-container-low p-sm rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">mood</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="submit"
              size="sm"
              loading={mutation.isPending}
              disabled={!content.trim() && !file}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
