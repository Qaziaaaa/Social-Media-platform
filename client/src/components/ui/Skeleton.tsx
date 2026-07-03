import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-surface-hover via-surface-elevated to-surface-hover bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
