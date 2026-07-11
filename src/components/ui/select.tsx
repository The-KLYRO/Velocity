import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, label, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 10, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.14)",
            border: `1px solid ${open ? "var(--stroke1)" : "var(--stroke0)"}`,
            borderRadius: 12,
            padding: "10px 14px",
            color: selected ? "var(--text0)" : "var(--text2)",
            fontSize: 13,
            outline: "none",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
        >
          <span>{selected?.label ?? placeholder ?? "Select..."}</span>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              color: "var(--text2)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          >
            expand_more
          </span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "var(--bg1)",
              border: "1px solid var(--stroke1)",
              borderRadius: 12,
              padding: 4,
              zIndex: 50,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: opt.value === value ? "rgba(255,255,255,0.08)" : "transparent",
                  color: "var(--text0)",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
