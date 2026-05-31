import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-surface via-surface-hover to-surface bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
