import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse } from "@/types";

const navItems = [
  { icon: "home", label: "Home", path: "/" },
  { icon: "explore", label: "Explore", path: "/explore" },
  { icon: "timeline", label: "Roadmap", path: "/roadmap" },
  { icon: "folder", label: "Projects", path: "/projects" },
  { icon: "notifications", label: "Notifications", path: "/notifications" },
  { icon: "mail", label: "Messages", path: "/messages" },
  { icon: "bookmark", label: "Bookmarks", path: "/bookmarks" },
];

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
      return data.data.count;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const notifCount = notifData ?? 0;

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border flex items-center justify-between px-margin-mobile py-3">
        <Link to="/" className="font-headline-lg text-headline-lg font-bold text-accent tracking-tight">
          Forge
        </Link>
        <div className="flex items-center gap-2">
          {isLoading ? null : isAuthenticated && user ? (
            <>
              <Link to="/notifications" className="relative flex items-center justify-center h-9 w-9 rounded-full text-text-secondary hover:text-text hover:bg-surface-hover transition-all active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger text-[9px] text-white font-bold flex items-center justify-center ring-2 ring-bg">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <Link to={`/profile/${user.id}`} className="shrink-0">
                <Avatar src={user.avatar} alt={user.fullName} size="sm" />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-accent text-white rounded-xl shadow-sm hover:bg-accent-hover hover:shadow-md transition-all duration-150 text-label-sm px-4 py-1.5"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col gap-1 py-lg sticky top-0 h-screen w-64 shrink-0">
        <div className="mb-2 px-3">
          <Link to="/" className="font-headline-xl text-headline-xl font-bold text-accent tracking-tight block mb-6">
            Forge
          </Link>
          {!isLoading && isAuthenticated && user && (
            <Link to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-all duration-200 group">
              <Avatar src={user.avatar} alt={user.fullName} size="md" />
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-text truncate">{user.fullName}</div>
                <div className="font-body-sm text-body-sm text-text-secondary truncate">@{user.username}</div>
              </div>
            </Link>
          )}
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-accent-subtle text-accent font-semibold"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
              >
                <span className="relative">
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.icon === "notifications" && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-bg">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
          {isAuthenticated && user && (
            <Link
              to={`/profile/${user.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                location.pathname === `/profile/${user.id}`
                  ? "bg-accent-subtle text-accent font-semibold"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={location.pathname === `/profile/${user.id}` ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                person
              </span>
              <span className="font-label-md text-label-md">Profile</span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin/reports"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                location.pathname === "/admin/reports"
                  ? "bg-accent-subtle text-accent font-semibold"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={location.pathname === "/admin/reports" ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                admin_panel_settings
              </span>
              <span className="font-label-md text-label-md">Admin</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto px-3 pt-2 border-t border-border">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-3">
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="w-full justify-start text-left font-label-md text-label-md"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3">
              <Link
                to="/login"
                className="block w-full text-center bg-accent text-white rounded-xl shadow-sm hover:bg-accent-hover hover:shadow-md transition-all duration-150 px-5 py-2 font-label-md"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block w-full text-center bg-transparent text-text border border-border rounded-xl hover:border-accent hover:bg-surface-hover transition-all duration-150 px-5 py-2 font-label-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav — 5 fixed items, no scroll, guaranteed symmetry */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border grid grid-cols-5 items-center py-1">
        {[
          { icon: "home", label: "Home", path: "/" },
          { icon: "explore", label: "Explore", path: "/explore" },
          { icon: "notifications", label: "Alerts", path: "/notifications", count: notifCount },
          { icon: "mail", label: "Messages", path: "/messages" },
          { icon: "person", label: "Profile", path: isAuthenticated && user ? `/profile/${user.id}` : "/login", check: (p: string) => p.startsWith("/profile") },
        ].map((item) => {
          const isActive = "check" in item ? (item as any).check(location.pathname) : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}
            >
              <span className="relative flex items-center justify-center h-5 w-5">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {"count" in item && (item as any).count > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-danger text-[7px] text-white font-bold flex items-center justify-center ring-[1.5px] ring-bg">
                    {(item as any).count > 9 ? "9+" : (item as any).count}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-medium leading-none tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
