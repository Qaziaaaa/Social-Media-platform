import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-surface-container-low via-surface-container-high to-surface-container-low bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
