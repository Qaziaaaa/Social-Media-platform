import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none select-none";

const variants = {
  primary:
    "bg-accent text-white rounded-xl shadow-sm hover:bg-accent-hover hover:shadow-md active:scale-[0.97] active:shadow-none",
  secondary:
    "bg-surface text-text border border-border rounded-xl hover:border-accent hover:text-accent hover:bg-surface-hover active:scale-[0.97]",
  ghost:
    "bg-transparent text-text-secondary rounded-lg hover:bg-surface-hover hover:text-text active:bg-surface-hover/80",
  danger:
    "bg-danger-subtle text-danger rounded-xl hover:bg-danger hover:text-white active:scale-[0.97]",
  outline:
    "bg-transparent text-text border border-border rounded-xl hover:border-accent hover:bg-surface-hover active:scale-[0.97]",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-label-sm gap-1",
  md: "px-5 py-2 text-label-md gap-1.5",
  lg: "px-7 py-2.5 text-label-md gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], loading && "cursor-wait", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      <span className={cn("inline-flex items-center gap-inherit", loading && "opacity-85")}>
        {children}
      </span>
    </button>
  );
}
