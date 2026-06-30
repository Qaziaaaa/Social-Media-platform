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
      <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Explore</h1>
        <div className="flex gap-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search users and updates..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-inverse-primary outline-none transition-all placeholder:text-on-surface-variant"
            />
          </div>
          <Button onClick={handleSearch} disabled={!query.trim()}>Search</Button>
        </div>
      </div>

      {debouncedQuery && (
        <div className="flex border-b border-surface-container-high mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key)}
              className={`flex-1 py-4 font-label-md text-label-md transition-colors ${
                searchType === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
          <p className="text-on-surface-variant">Searching...</p>
        </div>
      )}

      {!isLoading && debouncedQuery && users.length === 0 && updates.length === 0 && (
        <div className="bg-surface rounded-xl p-lg ambient-shadow border border-surface-container-high text-center">
          <p className="text-on-surface-variant">No results for "{debouncedQuery}"</p>
        </div>
      )}

      {(searchType === "all" || searchType === "users") && users.length > 0 && (
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Users</h2>
          <div className="bg-surface rounded-xl ambient-shadow border border-surface-container-high divide-y divide-surface-container-high">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className="flex items-center gap-md p-md hover:bg-surface-container-low transition-colors"
              >
                <Avatar src={u.avatar} alt={u.fullName} size="md" />
                <div>
                  <div className="font-label-md text-label-md text-on-surface">{u.fullName}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(searchType === "all" || searchType === "updates") && updates.length > 0 && (
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Updates</h2>
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
