import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20",
  secondary:
    "border border-glass-stroke text-on-surface hover:bg-surface-bright transition-all",
  ghost: "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/10 transition-colors",
  danger: "border border-error/30 text-error hover:bg-error/5 transition-all",
};

const sizes = {
  sm: "px-3 py-1.5 text-label-sm",
  md: "px-4 py-2 text-label-md",
  lg: "px-5 py-3 text-label-md",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}
