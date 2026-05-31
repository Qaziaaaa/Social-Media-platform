import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-[#0b0b10]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          to="/"
          className="font-display text-xl font-extrabold bg-gradient-to-r from-primary to-[#22d3ee] bg-clip-text text-transparent"
        >
          Social
        </Link>

        <nav className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#94a3b8] transition-colors hover:bg-surface-hover hover:text-[#e2e8f0]"
              >
                <Avatar src={user.avatar} alt={user.fullName} size="sm" />
                <span className="hidden sm:inline font-medium">{user.fullName}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-colors hover:bg-surface-hover hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-surface-hover hover:text-[#e2e8f0]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-primary-dark/25 transition-all hover:shadow-primary/20"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
