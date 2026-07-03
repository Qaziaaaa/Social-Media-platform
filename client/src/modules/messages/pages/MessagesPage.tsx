import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { fetchConversations, createConversation } from "../api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Conversation } from "@/types";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ConversationItem({ c, userId }: { c: Conversation; userId: string }) {
  const other = c.otherParticipants?.[0];
  const lastMsg = c.lastMessage;

  return (
    <Link
      to={`/messages/${c.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border last:border-b-0"
    >
      <div className="relative shrink-0">
        <Avatar src={other?.user.avatar ?? null} alt={other?.user.fullName ?? "?"} size="md" />
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-surface" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-text truncate">
            {other?.user.fullName ?? "Unknown"}
          </span>
          {lastMsg && (
            <span className="text-[11px] text-text-secondary shrink-0">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        {lastMsg ? (
          <div className="text-sm text-text-secondary truncate mt-0.5">
            <span className={lastMsg.senderId === userId ? "text-accent/70" : ""}>
              {lastMsg.senderId === userId ? "You: " : ""}
            </span>
            {lastMsg.content}
          </div>
        ) : (
          <div className="text-sm text-text-secondary italic mt-0.5">No messages yet</div>
        )}
      </div>
    </Link>
  );
}

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const { data: users, isFetching: searching } = useQuery({
    queryKey: ["users", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data } = await import("@/services/api").then((m) =>
        m.default.get("/search", { params: { q: searchTerm, type: "users" } }),
      );
      return data.data.users;
    },
    enabled: searchTerm.length >= 2,
  });

  const startMutation = useMutation({
    mutationFn: (userId: string) => createConversation([userId]),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowNew(false);
      setSearchTerm("");
      navigate(`/messages/${conv.id}`);
    },
    onError: () => toast.error("Failed to start conversation"),
  });

  useEffect(() => {
    if (showNew && searchRef.current) searchRef.current.focus();
  }, [showNew]);

  const autoStartRef = useRef(false);
  useEffect(() => {
    if (autoStartRef.current || !user) return;
    const targetId = searchParams.get("user");
    if (!targetId) return;
    autoStartRef.current = true;
    createConversation([targetId])
      .then((conv) => {
        navigate(`/messages/${conv.id}`, { replace: true });
      })
      .catch(() => {
        toast.error("Could not start conversation");
        navigate("/messages", { replace: true });
      });
  }, [user, searchParams, navigate]);

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-lg font-bold text-text">Messages</h1>
        <Button variant="secondary" size="sm" onClick={() => setShowNew((p) => !p)}>
          <span className="material-symbols-outlined text-lg mr-1">edit</span>
          New
        </Button>
      </div>

      {showNew && (
        <div className="mx-4 mt-4 mb-2 bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="p-3 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30 border border-border"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {searching && searchTerm.length >= 2 && (
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span className="text-sm text-text-secondary">Searching...</span>
              </div>
            )}
            {!searching && users && users.length > 0 && (
              (users as any[]).map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => startMutation.mutate(u.id)}
                  disabled={startMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left disabled:opacity-50"
                >
                  <Avatar src={u.avatar} alt={u.fullName} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-text">{u.fullName}</div>
                    <div className="text-xs text-text-secondary">@{u.username}</div>
                  </div>
                </button>
              ))
            )}
            {!searching && searchTerm.length >= 2 && users && users.length === 0 && (
              <p className="px-4 py-6 text-sm text-text-secondary text-center">No users found</p>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!conversations || conversations.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="h-16 w-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-text-secondary">chat</span>
          </div>
          <p className="text-text-secondary text-sm mb-1">No conversations yet</p>
          <p className="text-xs text-text-secondary/60">Click "New" to start messaging someone</p>
        </div>
      )}

      <div className="divide-y divide-border">
        {conversations?.map((c) => (
          <ConversationItem key={c.id} c={c} userId={user!.id} />
        ))}
      </div>
    </div>
  );
}
