import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  description?: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const typeStyles = {
  success: "border-green-500 shadow-green-500/20",
  error: "border-error shadow-error/20",
  info: "border-primary shadow-primary/20",
};

const iconMap = {
  success: "check_circle",
  error: "error",
  info: "info",
};

export function Toast({ message, description, type = "success", onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-8 right-8 z-[60] glass-panel px-6 py-4 rounded-2xl border shadow-2xl transition-all duration-500 flex items-center gap-4 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      } ${typeStyles[type]}`}
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          {iconMap[type]}
        </span>
      </div>
      <div>
        <p className="font-label-md text-on-surface">{message}</p>
        {description && (
          <p className="text-label-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 500);
        }}
        className="ml-4 text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
