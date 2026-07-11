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
  className = "",
}: StatCardProps) {
  return (
    <div className={`card kpi ${className}`}>
      <div className="kpiLabel">{label}</div>
      <div className="kpiValueRow">
        <div className="kpiValue">{value}</div>
        {trend && (
          <div className={`delta ${trendUp ? "delta--pos" : "delta--neg"}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
