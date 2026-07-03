interface AnonymousAvatarProps {
  size?: number;
  className?: string;
}

export function AnonymousAvatar({ size = 56, className }: AnonymousAvatarProps) {
  return (
    <div
      className={`rounded-full bg-surface-container-high flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-on-surface-variant/60" style={{ width: size * 0.5, height: size * 0.5 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  );
}
