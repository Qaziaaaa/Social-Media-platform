import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
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
          className="text-accent hover:text-accent-hover font-medium"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
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
      <div className="card animate-fade-in">
        <div className="p-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-3 items-center">
              <Link to={`/profile/${update.author.id}`}>
                <Avatar src={update.author.avatar} alt={update.author.fullName} />
              </Link>
              <div>
                <Link to={`/profile/${update.author.id}`} className="font-label-lg text-label-lg text-text hover:text-accent transition-colors">
                  {update.author.fullName}
                </Link>
                <div className="font-body-sm text-body-sm text-text-secondary">@{update.author.username}</div>
              </div>
            </div>
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-text-secondary hover:text-text hover:bg-surface-hover p-1.5 rounded-full transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-elevated rounded-xl shadow-lg border border-border py-1 min-w-[150px] z-10 animate-scale-in">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-label-md text-text hover:bg-surface-hover transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          if (confirm("Delete this update?")) deleteMutation.mutate();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-label-md text-danger hover:bg-surface-hover transition-colors"
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-label-md text-text hover:bg-surface-hover transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        Message
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-label-md text-text-secondary hover:bg-surface-hover transition-colors"
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
              className="block mb-3 cursor-pointer"
            >
              <p className="font-body-md text-body-md text-text whitespace-pre-wrap leading-relaxed">
                {renderContent(update.content)}
              </p>
            </div>
          )}

          {update.imageUrl && (
            <div
              onClick={() => navigate(`/updates/${update.id}`)}
              className="rounded-lg overflow-hidden mb-3 border border-border cursor-pointer"
            >
              <img
                src={update.imageUrl}
                alt="Update image"
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-text-secondary pt-3 border-t border-border">
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-1.5 hover:text-accent hover:bg-accent-subtle px-2.5 py-1.5 rounded-full transition-all group ${
                update.isLiked ? "text-accent" : ""
              }`}
            >
              <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${update.isLiked ? "text-accent" : ""}`} style={update.isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
              <span className="font-label-sm text-label-sm">{update._count.likes}</span>
            </button>
            <Link
              to={`/updates/${update.id}`}
              className="flex items-center gap-1.5 hover:text-accent hover:bg-accent-subtle px-2.5 py-1.5 rounded-full transition-all group"
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
              <span className="font-label-sm text-label-sm">{update._count.comments}</span>
            </Link>
            <button
              onClick={() => bookmarkMutation.mutate()}
              className={`flex items-center gap-1.5 hover:text-accent hover:bg-accent-subtle px-2.5 py-1.5 rounded-full transition-all group ${
                update.isBookmarked ? "text-accent" : ""
              }`}
            >
              <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${update.isBookmarked ? "text-accent" : ""}`} style={update.isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                bookmark
              </span>
            </button>
          </div>
        </div>
      </div>

      {editOpen && <EditUpdateModal update={update} onClose={() => setEditOpen(false)} />}

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => { setReportOpen(false); setReportReason(""); }}
        >
          <div
            className="bg-surface-elevated rounded-xl p-lg shadow-modal border border-border w-full max-w-md mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-text font-semibold mb-md">Report update</h3>
            <div className="space-y-1 mb-lg">
              {["Spam","Harassment","Hate speech","Misinformation","Violence","Inappropriate content","Other"].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-surface-hover transition-colors"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reportReason === r}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-accent"
                  />
                  <span className="font-body-md text-body-md text-text">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => { setReportOpen(false); setReportReason(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => reportMutation.mutate()}
                loading={reportMutation.isPending}
                disabled={!reportReason}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
