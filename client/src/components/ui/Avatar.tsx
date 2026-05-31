import { cn } from "@/utils/cn";

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

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover ring-2 ring-border/50",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary-dark to-primary font-semibold text-white shadow-lg shadow-primary-dark/20",
        sizeClasses[size],
        className,
      )}
    >
      {alt.charAt(0).toUpperCase()}
    </div>
  );
}
