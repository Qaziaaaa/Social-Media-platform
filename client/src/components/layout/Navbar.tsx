import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const navItems = [
  { icon: "home", label: "Home", path: "/" },
  { icon: "explore", label: "Explore", path: "/explore" },
  { icon: "notifications", label: "Notifications", path: "/notifications" },
  { icon: "mail", label: "Messages", path: "/messages" },
  { icon: "bookmark", label: "Bookmarks", path: "/bookmarks" },
];

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm flex justify-between items-center px-margin-mobile py-sm">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
          Lumina Social
        </Link>
        <div className="flex items-center gap-md">
          {isLoading ? null : isAuthenticated && user ? (
            <>
              <button className="text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
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
            Lumina Social
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
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
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
        </nav>

        {isAuthenticated && (
          <div className="px-md mt-auto flex flex-col gap-sm">
            <Link
              to="/"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-full hover:bg-on-primary-fixed-variant transition-colors shadow-sm text-center block"
            >
              Create Post
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
