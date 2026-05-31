import { z } from "zod";

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export function paginatedResponse<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  if (hasMore) {
    items.pop();
  }
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}
