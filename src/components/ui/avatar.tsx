interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const colorMap = [
  "bg-tertiary-container/20 text-tertiary",
  "bg-primary-container/20 text-primary",
  "bg-secondary-container/20 text-secondary",
  "bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim",
  "bg-error-container/20 text-error",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string): string {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colorMap.length;
  return colorMap[index];
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${sizeMap[size]} ${getColor(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
