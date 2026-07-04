import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchConversation, fetchMessages, sendMessage } from "../api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getSocket } from "@/services/socket";
import type { Message } from "@/types";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function shouldShowDate(messages: Message[], index: number) {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt);
  const curr = new Date(messages[index].createdAt);
  return prev.toDateString() !== curr.toDateString();
}

function isSameSender(messages: Message[], index: number) {
  if (index === 0) return false;
  return messages[index].senderId === messages[index - 1].senderId;
}

export function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversations", id],
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["conversations", id, "messages"],
    queryFn: () => fetchMessages(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (messagesData?.items) {
      setLiveMessages(messagesData.items);
    }
  }, [messagesData]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id || !user) return;

    const handler = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === id && data.message.senderId !== user.id) {
        setLiveMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("message", handler);
    return () => { socket.off("message", handler); };
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(id!, content),
    onSuccess: (msg) => {
      setContent("");
      setLiveMessages((prev) => [...prev, msg]);
      queryClient.invalidateQueries({ queryKey: ["conversations"], exact: true });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className={`h-11 w-56 rounded-2xl ${i % 2 === 0 ? "rounded-br-md" : "rounded-bl-md"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const other = (conversation as any)?.otherParticipants?.[0]?.user;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface/90 backdrop-blur-md shrink-0">
        <Link to="/messages" className="text-text-secondary hover:text-accent transition-colors -ml-1 p-1 rounded-lg hover:bg-surface-hover">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <Avatar src={other?.avatar ?? null} alt={other?.fullName ?? "?"} size="sm" />
        <div className="min-w-0">
          <div className="font-label-md text-label-md text-text truncate">{other?.fullName ?? "Unknown"}</div>
          <div className="font-body-sm text-body-sm text-text-secondary truncate">@{other?.username ?? "?"}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scroll-smooth">
        {liveMessages.map((m, i) => {
          const isOwn = m.senderId === user?.id;
          const grouped = isSameSender(liveMessages, i);
          const showAvatar = !grouped && !isOwn;

          return (
            <div key={m.id}>
              {shouldShowDate(liveMessages, i) && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-text-secondary/50 bg-surface-hover px-3 py-1 rounded-full font-medium">
                    {formatDate(m.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex items-end gap-2.5 mb-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {showAvatar && (
                  <Avatar src={other?.avatar ?? null} alt={other?.fullName ?? "?"} size="sm" className="mb-0.5 shrink-0" />
                )}
                {!showAvatar && !isOwn && <div className="w-8 shrink-0" />}
                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-accent text-white rounded-2xl rounded-br-sm"
                        : "bg-surface-hover text-text rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-text-secondary/40 mt-0.5 px-1">
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-surface/90 backdrop-blur-md px-5 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              className="w-full bg-surface-hover border border-border/60 rounded-2xl px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim() || sendMutation.isPending}
            className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95"
          >
            {sendMutation.isPending ? (
              <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
