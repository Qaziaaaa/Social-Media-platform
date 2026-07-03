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
    if (!socket || !id) return;

    const handler = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === id) {
        setLiveMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("message", handler);
    return () => { socket.off("message", handler); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(id!, content),
    onSuccess: (msg) => {
      setContent("");
      setLiveMessages((prev) => [...prev, msg]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
      <div className="max-w-xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className={`h-10 w-48 rounded-2xl ${i % 2 === 0 ? "rounded-br-sm" : "rounded-bl-sm"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const other = (conversation as any)?.otherParticipants?.[0]?.user;

  return (
    <div className="max-w-xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-md shrink-0">
        <Link to="/messages" className="text-text-secondary hover:text-accent transition-colors -ml-1">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <Avatar src={other?.avatar ?? null} alt={other?.fullName ?? "?"} size="sm" />
        <div>
          <div className="text-sm font-semibold text-text">{other?.fullName ?? "Unknown"}</div>
          <div className="text-xs text-text-secondary">@{other?.username ?? "?"}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scroll-smooth">
        {liveMessages.map((m, i) => (
          <div key={m.id}>
            {shouldShowDate(liveMessages, i) && (
              <div className="flex justify-center my-3">
                <span className="text-[11px] text-text-secondary/60 bg-surface-hover px-3 py-1 rounded-full">
                  {formatDate(m.createdAt)}
                </span>
              </div>
            )}
            <div className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
              <div className="group max-w-[75%]">
                <div
                  className={`px-3.5 py-2 text-sm leading-relaxed ${
                    m.senderId === user?.id
                      ? "bg-accent text-black rounded-2xl rounded-br-sm"
                      : "bg-surface-hover text-text rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
                <div
                  className={`text-[10px] text-text-secondary/50 mt-0.5 px-1 ${
                    m.senderId === user?.id ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-md px-4 py-3">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="w-full bg-surface rounded-2xl px-4 py-2.5 text-sm outline-none border border-border focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim() || sendMutation.isPending}
            className="h-10 w-10 rounded-full bg-accent text-black flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sendMutation.isPending ? (
              <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
