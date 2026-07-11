interface BadgeProps {
  status: "running" | "paused" | "completed" | "failed" | "valid" | "invalid" | "active" | "bounced" | "pending" | "unsubscribed";
  className?: string;
}

const statusStyles = {
  running: "bg-primary/10 border-primary/20 text-primary",
  paused: "bg-tertiary/10 border-tertiary/20 text-tertiary",
  completed: "bg-green-500/10 border-green-500/20 text-green-400",
  failed: "bg-error/10 border-error/20 text-error",
  valid: "bg-green-500/10 border-green-500/20 text-green-400",
  invalid: "bg-error/10 border-error/20 text-error",
  active: "bg-green-500/10 border-green-500/20 text-green-400",
  bounced: "bg-error/10 border-error/20 text-error",
  pending: "bg-surface-bright/30 border-glass-stroke text-on-surface-variant",
  unsubscribed: "bg-orange-500/10 border-orange-500/20 text-orange-400",
};

export function Badge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
