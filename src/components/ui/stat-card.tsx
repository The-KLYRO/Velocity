import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: string;
  sparkline?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp = true,
  icon,
  sparkline,
  children,
  className = "",
}: StatCardProps) {
  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-label-sm text-outline uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined text-primary">{icon}</span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display-lg text-primary neon-text-glow">
          {value}
        </span>
        {trend && (
          <span
            className={`text-label-sm ${
              trendUp ? "text-green-400" : "text-error"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {sparkline && <div className="mt-4 h-12 w-full">{sparkline}</div>}
      {children}
    </div>
  );
}
