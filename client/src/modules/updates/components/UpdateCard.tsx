import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import { EditUpdateModal } from "@/modules/updates/components/EditUpdateModal";
import type { ApiResponse, Update, Report } from "@/types";

const HASHTAG_REGEX = /(#\w+)/g;

function renderContent(text: string) {
  const parts = text.split(HASHTAG_REGEX);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return (
        <Link
          key={i}
          to={`/explore?q=${encodeURIComponent(tag)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-primary hover:underline"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface UpdateCardProps {
  update: Update;
}

export function UpdateCard({ update }: UpdateCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user?.id === update.authorId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/updates/${update.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
      toast.success("Update deleted");
    },
    onError: () => {
      toast.error("Failed to delete update");
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (update.isBookmarked) {
        await api.delete(`/bookmarks/updates/${update.id}/bookmark`);
      } else {
        await api.post(`/bookmarks/updates/${update.id}/bookmark`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all() });
      toast.success(update.isBookmarked ? "Bookmark removed" : "Bookmarked");
    },
    onError: () => {
      toast.error("Failed to update bookmark");
    },
  });

  const [reportReason, setReportReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Report>>("/reports", {
        targetType: "update",
        targetId: update.id,
        reason: reportReason,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Report submitted");
      setReportOpen(false);
      setReportReason("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to submit report");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (update.isLiked) {
        await api.delete(`/updates/${update.id}/like`);
      } else {
        await api.post(`/updates/${update.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.updates.feed() });
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  return (
    <>
      <article className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high animate-fade-in">
        <div className="flex justify-between items-start mb-md">
          <div className="flex gap-md items-center">
            <Link to={`/profile/${update.author.id}`}>
              <Avatar src={update.author.avatar} alt={update.author.fullName} />
            </Link>
            <div>
              <Link to={`/profile/${update.author.id}`} className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors">
                {update.author.fullName}
              </Link>
              <div className="font-body-sm text-body-sm text-on-surface-variant">@{update.author.username}</div>
            </div>
          </div>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low p-xs rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-xs bg-surface rounded-lg shadow-lg border border-surface-container-high py-xs min-w-[140px] z-10 animate-fade-in">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                      className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (confirm("Delete this update?")) deleteMutation.mutate();
                      }}
                      className="w-full flex items-center gap-sm px-md py-sm text-label-md text-error hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(`/messages?user=${update.authorId}`);
                      }}
                      className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                      Message
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                      className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      Report
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      {update.content && (
        <div
          onClick={() => navigate(`/updates/${update.id}`)}
          className="block mb-md cursor-pointer"
        >
          <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
            {renderContent(update.content)}
          </p>
        </div>
      )}

      {update.imageUrl && (
        <div
          onClick={() => navigate(`/updates/${update.id}`)}
          className="rounded-lg overflow-hidden mb-md border border-surface-container-high cursor-pointer"
        >
          <img
            src={update.imageUrl}
            alt="Update image"
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-on-surface-variant pt-xs border-t border-surface-container-high">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group ${
            update.isLiked ? "text-tertiary" : ""
          }`}
        >
          <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${update.isLiked ? "text-tertiary" : ""}`} style={update.isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            favorite
          </span>
          <span className="font-label-sm text-label-sm">{update._count.likes}</span>
        </button>
        <Link
          to={`/updates/${update.id}`}
          className="flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
          <span className="font-label-sm text-label-sm">{update._count.comments}</span>
        </Link>
        <button
          onClick={() => bookmarkMutation.mutate()}
          className={`flex items-center gap-xs hover:text-primary hover:bg-surface-container-low px-sm py-xs rounded-full transition-colors group ${
            update.isBookmarked ? "text-primary" : ""
          }`}
        >
          <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${update.isBookmarked ? "text-primary" : ""}`} style={update.isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            bookmark
          </span>
        </button>
      </div>
    </article>

      {editOpen && <EditUpdateModal update={update} onClose={() => setEditOpen(false)} />}

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => { setReportOpen(false); setReportReason(""); }}
        >
          <div
            className="bg-surface rounded-xl p-lg shadow-xl border border-surface-container-high w-full max-w-md mx-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">Report update</h3>
            <div className="space-y-sm mb-lg">
              {["Spam","Harassment","Hate speech","Misinformation","Violence","Inappropriate content","Other"].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-sm p-sm rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reportReason === r}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => { setReportOpen(false); setReportReason(""); }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason || reportMutation.isPending}
                className="px-4 py-2 font-label-md text-label-md bg-error text-on-error rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
