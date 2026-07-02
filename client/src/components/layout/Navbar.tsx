import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
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
      <header className="md:hidden fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm flex justify-between items-center px-margin-mobile py-sm">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
          Forge
        </Link>
        <div className="flex items-center gap-md">
          {isLoading ? null : isAuthenticated && user ? (
            <>
              <Link to="/notifications" className="relative text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-error text-[9px] text-on-error font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <Link to={`/profile/${user.id}`}>
                <Avatar src={user.avatar} alt={user.fullName} size="sm" />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="font-label-md text-label-md text-primary hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col gap-md py-lg sticky top-0 h-screen w-64 bg-surface shrink-0 no-scrollbar overflow-y-auto">
        <div className="mb-lg px-md">
          <Link to="/" className="font-headline-lg text-headline-lg font-bold text-primary mb-xl block">
            Forge
          </Link>
          {!isLoading && isAuthenticated && user && (
            <Link to={`/profile/${user.id}`} className="flex items-center gap-md mb-xl hover:bg-surface-container-low p-sm -mx-sm rounded-xl transition-colors">
              <Avatar src={user.avatar} alt={user.fullName} size="md" />
              <div>
                <div className="font-label-md text-label-md text-on-surface">{user.fullName}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">@{user.username}</div>
              </div>
            </Link>
          )}
        </div>

        <nav className="flex flex-col gap-xs flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-md px-md py-sm rounded-full transition-all active:scale-98 ${
                  isActive
                    ? "text-primary font-bold bg-surface-container-low"
                    : "text-on-surface-variant hover:bg-surface-container-high"
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
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error text-[10px] text-on-error font-bold flex items-center justify-center">
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
              className={`flex items-center gap-md px-md py-sm rounded-full transition-all active:scale-98 ${
                location.pathname === `/profile/${user.id}`
                  ? "text-primary font-bold bg-surface-container-low"
                  : "text-on-surface-variant hover:bg-surface-container-high"
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
              className={`flex items-center gap-md px-md py-sm rounded-full transition-all active:scale-98 ${
                location.pathname === "/admin/reports"
                  ? "text-primary font-bold bg-surface-container-low"
                  : "text-on-surface-variant hover:bg-surface-container-high"
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

        {isAuthenticated && (
          <div className="px-md mt-auto flex flex-col gap-sm">
            <Link
              to="/"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm text-center block"
            >
              Create Update
            </Link>
            <button
              onClick={() => logout()}
              className="w-full text-left px-md py-sm rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md"
            >
              Logout
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="px-md mt-auto flex flex-col gap-sm">
            <Link
              to="/login"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm text-center block"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full text-center border border-outline-variant text-on-surface font-label-md text-label-md py-sm rounded-full hover:bg-surface-container-low transition-colors block"
            >
              Register
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-outline-variant flex justify-around items-center px-sm py-sm pb-safe">
        <Link
          to="/"
          className={`flex flex-col items-center gap-xs p-sm ${
            location.pathname === "/" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={location.pathname === "/" ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            home
          </span>
        </Link>
        <Link
          to="/explore"
          className="flex flex-col items-center gap-xs p-sm text-on-surface-variant"
        >
          <span className="material-symbols-outlined">explore</span>
        </Link>
        <Link
          to={isAuthenticated && user ? `/profile/${user.id}` : "/login"}
          className={`flex flex-col items-center gap-xs p-sm ${
            location.pathname.startsWith("/profile") ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={location.pathname.startsWith("/profile") ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            person
          </span>
        </Link>
      </nav>
    </>
  );
}
