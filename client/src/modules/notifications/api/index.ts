import api from "@/services/api";
import type { ApiResponse, Notification, PaginatedResponse } from "@/types";

export async function fetchNotifications(cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "20");
  const { data } = await api.get<ApiResponse<PaginatedResponse<Notification>>>(`/notifications?${params}`);
  return data.data;
}

export async function fetchUnreadCount() {
  const { data } = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
  return data.data.count;
}

export async function markNotificationRead(id: string) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}
