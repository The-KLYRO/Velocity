import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-surface-container-high/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-label-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all neon-border-glow ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
