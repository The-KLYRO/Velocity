interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "secondary" | "tertiary" | "success";
  showGlow?: boolean;
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  success: "bg-green-500",
};

export function ProgressBar({
  value,
  max = 100,
  color = "primary",
  showGlow = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={`w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colorMap[color]} ${
          showGlow ? "progress-glow" : ""
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
