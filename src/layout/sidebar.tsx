import { useLocation, useNavigate } from "react-router-dom";

const mainNavItems = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/campaigns", label: "Campaigns", icon: "send" },
  { path: "/compose", label: "Compose", icon: "edit_square" },
  { path: "/recipients", label: "Recipients", icon: "group" },
];

const bottomNavItems = [
  { path: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <div className="brand">
          <img src="/icon.png" alt="Velocity" className="brandMark" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "contain" }} />
          <span className="brandText">Velocity</span>
        </div>
      </div>

      <nav className="nav">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`navItem${isActive ? " navItem--active" : ""}`}
              type="button"
            >
              <span className="navIcon" aria-hidden>
                <span className="material-symbols-outlined">{item.icon}</span>
              </span>
              <span className="navLabel">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`navItem${isActive ? " navItem--active" : ""}`}
              type="button"
            >
              <span className="navIcon" aria-hidden>
                <span className="material-symbols-outlined">{item.icon}</span>
              </span>
              <span className="navLabel">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
