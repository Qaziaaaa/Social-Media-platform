export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    detail: (id: string) => ["users", id] as const,
    updates: (id: string) => ["users", id, "updates"] as const,
  },
  updates: {
    feed: () => ["updates", "feed"] as const,
    detail: (id: string) => ["updates", id] as const,
    comments: (id: string) => ["updates", id, "comments"] as const,
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
  milestones: {
    my: () => ["milestones", "me"] as const,
    byProject: (projectId: string) => ["milestones", projectId] as const,
  },
  blocks: {
    all: () => ["blocks"] as const,
    check: (id: string) => ["blocks", id] as const,
  },
};
