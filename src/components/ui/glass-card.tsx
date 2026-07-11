import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${
        hover
          ? "hover:bg-white/[0.06] hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
