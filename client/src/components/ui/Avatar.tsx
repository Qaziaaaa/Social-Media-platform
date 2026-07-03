import { cn } from "@/utils/cn";
import { AnonymousAvatar } from "./AnonymousAvatar";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

const sizeMap = { sm: 32, md: 40, lg: 64 } as const;

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover ring-2 ring-surface",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <AnonymousAvatar
      size={sizeMap[size]}
      className={cn("ring-2 ring-surface", className)}
    />
  );
}
