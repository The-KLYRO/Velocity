import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/compose", label: "Compose", icon: "edit_square" },
  { path: "/recipients", label: "Recipients", icon: "group" },
  { path: "/campaigns", label: "Campaigns", icon: "send" },
  { path: "/smtp", label: "SMTP Accounts", icon: "dns" },
];

const bottomItems = [
  { path: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[280px] h-screen border-r border-glass-stroke bg-surface-container-low/80 backdrop-blur-xl">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <h1 className="font-display-lg text-headline-lg tracking-tighter text-primary leading-none">
              Lumina
            </h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase">
              Velocity
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => navigate("/compose")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Quick Send
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/10"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-glass-stroke space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
