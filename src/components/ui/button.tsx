import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  children: ReactNode;
}

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
      className={`pillBtn transition-all active:scale-95 ${sizes[size]} ${className}`}
      type="button"
      {...props}
    >
      {icon && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>}
      {children}
    </button>
  );
}
