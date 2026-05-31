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
          <label htmlFor={id} className="block text-sm font-medium text-[#cbd5e1]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] shadow-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/30",
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
