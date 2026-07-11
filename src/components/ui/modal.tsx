import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative glass-panel rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-on-surface">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-md text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
