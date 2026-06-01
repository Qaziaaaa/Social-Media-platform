import api from "@/services/api";
import type { ApiResponse, Conversation, Message, PaginatedResponse } from "@/types";

export async function fetchConversations() {
  const { data } = await api.get<ApiResponse<Conversation[]>>("/messages/conversations");
  return data.data;
}

export async function fetchConversation(id: string) {
  const { data } = await api.get<ApiResponse<Conversation>>(`/messages/conversations/${id}`);
  return data.data;
}

export async function createConversation(participantIds: string[]) {
  const { data } = await api.post<ApiResponse<Conversation>>("/messages/conversations", { participantIds });
  return data.data;
}

export async function fetchMessages(conversationId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "30");
  const { data } = await api.get<ApiResponse<PaginatedResponse<Message>>>(`/messages/conversations/${conversationId}/messages?${params}`);
  return data.data;
}

export async function sendMessage(conversationId: string, content: string) {
  const { data } = await api.post<ApiResponse<Message>>(`/messages/conversations/${conversationId}/messages`, { content });
  return data.data;
}
