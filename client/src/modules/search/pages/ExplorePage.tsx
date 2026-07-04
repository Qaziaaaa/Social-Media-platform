import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { UpdateCard } from "@/modules/updates/components/UpdateCard";
import api from "@/services/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, User, Update } from "@/types";

type SearchType = "all" | "users" | "updates";

export function ExplorePage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    setDebouncedQuery(query.trim());
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.search.all(debouncedQuery), searchType],
    queryFn: async () => {
      const params = new URLSearchParams({ q: debouncedQuery, type: searchType, limit: "20" });
      const { data } = await api.get<ApiResponse<any>>(`/search?${params}`);
      return data.data;
    },
    enabled: debouncedQuery.length > 0,
  });

  const users: User[] = data?.users ?? [];
  const updates: Update[] = data?.updates ?? [];

  const tabs: { key: SearchType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "users", label: "Users" },
    { key: "updates", label: "Updates" },
  ];

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="card p-lg">
        <h1 className="font-headline-lg text-headline-lg text-text mb-lg">Explore</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search users and updates..."
              className="w-full pl-10 pr-3 py-2.5 bg-surface border border-border rounded-md text-body-md text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
          <Button onClick={handleSearch} disabled={!query.trim()}>Search</Button>
        </div>
      </div>

      {debouncedQuery && (
        <div className="flex border-b border-border mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key)}
              className={`flex-1 py-3.5 font-label-md text-label-md transition-all duration-200 ${
                searchType === tab.key
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-secondary hover:text-text hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="card p-lg text-center">
          <p className="text-text-secondary">Searching...</p>
        </div>
      )}

      {!isLoading && debouncedQuery && users.length === 0 && updates.length === 0 && (
        <div className="card p-lg text-center">
          <p className="text-text-secondary">No results for "{debouncedQuery}"</p>
        </div>
      )}

      {(searchType === "all" || searchType === "users") && users.length > 0 && (
        <section>
          <h2 className="font-headline-md text-headline-md text-text mb-md">Users</h2>
          <div className="card divide-y divide-border overflow-hidden">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className="flex items-center gap-md p-md hover:bg-surface-hover transition-colors"
              >
                <Avatar src={u.avatar} alt={u.fullName} size="md" />
                <div>
                  <div className="font-label-md text-label-md text-text">{u.fullName}</div>
                  <div className="font-body-sm text-body-sm text-text-secondary">@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(searchType === "all" || searchType === "updates") && updates.length > 0 && (
        <section>
          <h2 className="font-headline-md text-headline-md text-text mb-md">Updates</h2>
          <div className="flex flex-col gap-md">
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
