import { useState, useRef, useEffect } from "react";

interface ToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentChange?: () => void;
}

const fonts = ["Sans Serif", "Serif", "Monospace", "Arial", "Georgia", "Verdana"];
const fontSizes = [
  { label: "Small", value: "1" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "7" },
];
const colors = [
  "#ffffff", "#000000", "#ff4747", "#e6b857", "#2bdc6f",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4",
];

function ToolbarBtn({ icon, title, onClick, active }: { icon: string; title: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "none",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: "var(--text0)",
        cursor: "pointer",
        transition: "background 0.1s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  );
}

function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          background: "var(--bg1)",
          border: "1px solid var(--stroke1)",
          borderRadius: 10,
          padding: 6,
          zIndex: 100,
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          minWidth: 120,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

export function EditorToolbar({ editorRef, onContentChange }: ToolbarProps) {
  const [activeFont, setActiveFont] = useState("Sans Serif");
  const [activeColor, setActiveColor] = useState("#ffffff");
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageDialog, setImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const linkUrlRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const run = (cmd: string, value?: string) => {
    focusEditor();
    exec(cmd, value);
    onContentChange?.();
  };

  useEffect(() => {
    if (linkDialog && linkUrlRef.current) {
      linkUrlRef.current.focus();
    }
  }, [linkDialog]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.14)",
    border: "1px solid var(--stroke0)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text0)",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "var(--text2)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "6px 12px",
        background: "var(--bg1)",
        borderBottom: "1px solid var(--stroke0)",
        flexWrap: "wrap",
        minHeight: 40,
      }}>
        {/* Undo / Redo */}
        <ToolbarBtn icon="undo" title="Undo" onClick={() => run("undo")} />
        <ToolbarBtn icon="redo" title="Redo" onClick={() => run("redo")} />

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Font Family */}
        <Dropdown
          trigger={
            <button type="button" style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "none",
              background: "transparent",
              color: "var(--text0)",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}>
              {activeFont}
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>expand_more</span>
            </button>
          }
        >
          {fonts.map((f) => (
            <div
              key={f}
              onClick={() => { setActiveFont(f); run("fontName", f); }}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                color: f === activeFont ? "var(--text0)" : "var(--text1)",
                background: f === activeFont ? "rgba(255,255,255,0.08)" : "transparent",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: f,
              }}
            >
              {f}
            </div>
          ))}
        </Dropdown>

        {/* Font Size */}
        <Dropdown
          trigger={
            <button type="button" style={{
              padding: "4px 6px",
              borderRadius: 6,
              border: "none",
              background: "transparent",
              color: "var(--text0)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}>
              T
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text2)" }}>expand_more</span>
            </button>
          }
        >
          {fontSizes.map((s) => (
            <div
              key={s.value}
              onClick={() => run("fontSize", s.value)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                color: "var(--text1)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {s.label}
            </div>
          ))}
        </Dropdown>

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Bold / Italic / Underline */}
        <ToolbarBtn icon="format_bold" title="Bold" onClick={() => run("bold")} />
        <ToolbarBtn icon="format_italic" title="Italic" onClick={() => run("italic")} />
        <ToolbarBtn icon="format_underlined" title="Underline" onClick={() => run("underline")} />

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Text Color */}
        <Dropdown
          trigger={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", padding: "2px 6px" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: activeColor, lineHeight: 1 }}>A</span>
              <div style={{ width: 14, height: 3, background: activeColor, borderRadius: 2, marginTop: 1 }} />
            </div>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, padding: 4 }}>
            {colors.map((c) => (
              <div
                key={c}
                onClick={() => { setActiveColor(c); run("foreColor", c); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: c,
                  border: c === activeColor ? "2px solid var(--text0)" : "1px solid var(--stroke0)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </Dropdown>

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Alignment */}
        <ToolbarBtn icon="format_align_left" title="Align Left" onClick={() => run("justifyLeft")} />
        <ToolbarBtn icon="format_align_center" title="Align Center" onClick={() => run("justifyCenter")} />
        <ToolbarBtn icon="format_align_right" title="Align Right" onClick={() => run("justifyRight")} />

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Lists */}
        <ToolbarBtn icon="format_list_bulleted" title="Bullet List" onClick={() => run("insertUnorderedList")} />
        <ToolbarBtn icon="format_list_numbered" title="Numbered List" onClick={() => run("insertOrderedList")} />

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Indent */}
        <ToolbarBtn icon="format_indent_increase" title="Indent" onClick={() => run("indent")} />
        <ToolbarBtn icon="format_indent_decrease" title="Outdent" onClick={() => run("outdent")} />

        <div style={{ width: 1, height: 20, background: "var(--stroke0)", margin: "0 4px", flexShrink: 0 }} />

        {/* Link */}
        <ToolbarBtn icon="link" title="Insert Link" onClick={() => {
          const sel = window.getSelection();
          setLinkText(sel?.toString() ?? "");
          setLinkUrl("");
          setLinkDialog(true);
        }} />

        {/* Image */}
        <ToolbarBtn icon="image" title="Insert Image" onClick={() => {
          setImageUrl("");
          setImageDialog(true);
        }} />

        {/* Quote */}
        <ToolbarBtn icon="format_quote" title="Block Quote" onClick={() => run("formatBlock", "blockquote")} />

        {/* Clear Formatting */}
        <ToolbarBtn icon="format_clear" title="Clear Formatting" onClick={() => run("removeFormat")} />
      </div>

      {/* Link Dialog */}
      {linkDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setLinkDialog(false); }}
        >
          <div style={{
            background: "var(--bg1)",
            border: "1px solid var(--stroke1)",
            borderRadius: 16,
            padding: 24,
            width: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Insert Link</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Text to display</label>
              <input
                style={inputStyle}
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>URL</label>
              <input
                ref={linkUrlRef}
                style={inputStyle}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && linkUrl) {
                    focusEditor();
                    if (linkText) {
                      exec("insertHTML", `<a href="${linkUrl}">${linkText}</a>`);
                    } else {
                      exec("createLink", linkUrl);
                    }
                    onContentChange?.();
                    setLinkDialog(false);
                  }
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setLinkDialog(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--stroke0)",
                  background: "transparent",
                  color: "var(--text1)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrl}
                onClick={() => {
                  focusEditor();
                  if (linkText) {
                    exec("insertHTML", `<a href="${linkUrl}">${linkText}</a>`);
                  } else {
                    exec("createLink", linkUrl);
                  }
                  onContentChange?.();
                  setLinkDialog(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: linkUrl ? "var(--text0)" : "var(--panel2)",
                  color: linkUrl ? "var(--bg0)" : "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: linkUrl ? "pointer" : "default",
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {imageDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setImageDialog(false); }}
        >
          <div style={{
            background: "var(--bg1)",
            border: "1px solid var(--stroke1)",
            borderRadius: 16,
            padding: 24,
            width: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Insert Image</div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Image URL or Local File</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && imageUrl) {
                      focusEditor();
                      exec("insertImage", imageUrl);
                      onContentChange?.();
                      setImageDialog(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from computer"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid var(--stroke0)",
                    background: "rgba(0,0,0,0.14)",
                    color: "var(--text0)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.14)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setImageDialog(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--stroke0)",
                  background: "transparent",
                  color: "var(--text1)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!imageUrl}
                onClick={() => {
                  focusEditor();
                  exec("insertImage", imageUrl);
                  onContentChange?.();
                  setImageDialog(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: imageUrl ? "var(--text0)" : "var(--panel2)",
                  color: imageUrl ? "var(--bg0)" : "var(--text2)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: imageUrl ? "pointer" : "default",
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
