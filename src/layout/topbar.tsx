import { useNavigate } from "react-router-dom";
import { SearchInput } from "../components/ui/search-input";

interface TopBarProps {
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function TopBar({ title, searchPlaceholder = "Search...", onSearch }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 sticky top-0 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md border-b border-glass-stroke z-40">
      <div className="flex items-center gap-6">
        <h2 className="font-headline-md text-headline-md text-on-surface whitespace-nowrap">
          {title}
        </h2>
        <div className="w-64">
          <SearchInput placeholder={searchPlaceholder} onSearch={onSearch} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate("/reports")}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all"
          >
            Analytics
          </button>
          <button
            onClick={() => navigate("/templates")}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all"
          >
            Templates
          </button>
        </nav>
        <div className="h-6 w-[1px] bg-glass-stroke" />
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-glass-stroke">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
