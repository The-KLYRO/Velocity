import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div className={`card card--pad ${className}`}>
      {children}
    </div>
  );
}
