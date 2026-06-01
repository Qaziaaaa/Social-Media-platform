import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { fetchConversations, createConversation } from "../api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Conversation } from "@/types";

function ConversationItem({ c, userId }: { c: Conversation; userId: string }) {
  const other = c.otherParticipants?.[0];
  const lastMsg = c.lastMessage;

  return (
    <Link
      to={`/messages/${c.id}`}
      className="flex items-center gap-md p-md rounded-xl hover:bg-surface-container-low transition-colors"
    >
      <Avatar src={other?.user.avatar ?? null} alt={other?.user.fullName ?? "?"} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-label-md text-label-md text-on-surface truncate">
          {other?.user.fullName ?? "Unknown"}
        </div>
        {lastMsg && (
          <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {lastMsg.senderId === userId ? "You: " : ""}{lastMsg.content}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const { data: users } = useQuery({
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
      navigate(`/messages/${conv.id}`);
    },
    onError: () => toast.error("Failed to start conversation"),
  });

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Messages</h1>
        <Button variant="secondary" size="sm" onClick={() => setShowNew(!showNew)}>
          New message
        </Button>
      </div>

      {showNew && (
        <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high space-y-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md"
            autoFocus
          />
          {users && users.length > 0 && (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {(users as any[]).map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => startMutation.mutate(u.id)}
                  className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors text-left"
                >
                  <Avatar src={u.avatar} alt={u.fullName} size="sm" />
                  <div>
                    <div className="font-label-md text-label-md text-on-surface">{u.fullName}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-md p-md">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!conversations || conversations.length === 0) && (
        <div className="bg-surface rounded-xl p-lg text-center ambient-shadow border border-surface-container-high">
          <p className="text-on-surface-variant">No conversations yet</p>
          <p className="text-body-sm text-on-surface-variant mt-1">Click "New message" to start one</p>
        </div>
      )}

      <div className="flex flex-col gap-xs">
        {conversations?.map((c) => (
          <ConversationItem key={c.id} c={c} userId={user!.id} />
        ))}
      </div>
    </div>
  );
}
