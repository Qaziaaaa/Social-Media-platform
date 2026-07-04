import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-label-sm font-label-sm text-on-surface ml-xs">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-body-md font-body-md text-text placeholder:text-text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
