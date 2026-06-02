export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    detail: (id: string) => ["users", id] as const,
    posts: (id: string) => ["users", id, "posts"] as const,
  },
  posts: {
    feed: () => ["posts", "feed"] as const,
    detail: (id: string) => ["posts", id] as const,
    comments: (id: string) => ["posts", id, "comments"] as const,
  },
  search: {
    all: (q: string) => ["search", q] as const,
  },
  bookmarks: {
    all: () => ["bookmarks"] as const,
  },
  reports: {
    all: (status?: string) => ["reports", status ?? "all"] as const,
  },
  blocks: {
    all: () => ["blocks"] as const,
    check: (id: string) => ["blocks", id] as const,
  },
};
