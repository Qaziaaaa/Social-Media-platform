import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, Update } from "@/types";

interface EditUpdateModalProps {
  update: Update;
  onClose: () => void;
}

export function EditUpdateModal({ update, onClose }: EditUpdateModalProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(update.content);
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
      let imageUrl = update.imageUrl ?? undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { data: uploadRes } = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.url;
      }

      const { data } = await api.patch<ApiResponse<Update>>(`/updates/${update.id}`, { content, imageUrl });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.detail(update.id) });
      toast.success("Update updated");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update update");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-md"
    >
      <div className="bg-surface-elevated rounded-xl p-lg shadow-xl border border-border w-full max-w-lg animate-scale-in">
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-headline-md text-headline-md text-text">Edit update</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text p-xs rounded-full hover:bg-surface-hover transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full bg-surface border border-border rounded-lg px-md py-sm font-body-md text-body-md text-text focus:border-accent focus:ring-2 focus:ring-accent-subtle outline-none transition-all resize-none placeholder:text-text-secondary mb-md"
        />

        {(preview || update.imageUrl) && (
          <div className="relative rounded-xl overflow-hidden border border-border mb-md">
            <img
              src={preview ?? update.imageUrl!}
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

        <div className="flex items-center justify-between pt-sm border-t border-border">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-accent hover:bg-surface-hover p-sm rounded-full transition-colors flex items-center justify-center"
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
