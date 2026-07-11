import { forwardRef, type InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = "", onSearch, ...props }, ref) => {
    return (
      <div className={`relative group ${className}`}>
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          search
        </span>
        <input
          ref={ref}
          className="w-full bg-surface-container-highest/50 border border-glass-stroke rounded-full py-2 pl-10 pr-4 text-label-md focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
          onChange={(e) => onSearch?.(e.target.value)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
