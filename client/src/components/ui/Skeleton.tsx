import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "rounded-lg relative overflow-hidden",
        className,
      )}
      style={{ backgroundColor: "var(--color-skeleton)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--color-skeleton-shine) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-faster 0.9s ease-in-out infinite",
        }}
      />
    </div>
  );
}
