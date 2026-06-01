import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchConversation, fetchMessages, sendMessage } from "../api";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getSocket } from "@/services/socket";
import type { Message } from "@/types";

export function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Skeleton className="h-12 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-xl mx-auto bg-surface rounded-xl p-lg text-center ambient-shadow border border-surface-container-high">
        <p className="text-on-surface-variant">Conversation not found</p>
        <Link to="/messages" className="text-primary hover:underline mt-2 inline-block">Back to messages</Link>
      </div>
    );
  }

  const other = (conversation as any).otherParticipants?.[0]?.user;

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      <div className="flex items-center gap-md p-md border-b border-surface-container-high mb-4">
        <Link to="/messages" className="text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <Avatar src={other?.avatar ?? null} alt={other?.fullName ?? "?"} size="sm" />
        <div className="font-label-md text-label-md text-on-surface">{other?.fullName ?? "Unknown"}</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-sm">
        {liveMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                m.senderId === user?.id
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-container-high text-on-surface rounded-bl-sm"
              }`}
            >
              <p className="font-body-md text-body-md">{m.content}</p>
              <p className="font-body-sm text-body-sm opacity-60 mt-1">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) sendMutation.mutate();
        }}
        className="flex gap-3 items-end"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md"
        />
        <button
          type="submit"
          disabled={!content.trim() || sendMutation.isPending}
          className="bg-primary text-on-primary rounded-full p-3 hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
