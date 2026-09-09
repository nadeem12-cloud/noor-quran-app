import { Home as HomeIcon, BookOpen, Search } from "lucide-react";
import { useStore } from "../store/useStore";

const TABS = [
  { id: "home", label: "Today", icon: HomeIcon },
  { id: "browse", label: "Browse", icon: BookOpen },
  { id: "search", label: "Search", icon: Search },
];

export default function BottomNav() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  // The reader view is reached via Browse, so it stays highlighted there.
  const activeId = view === "reader" ? "browse" : view === "settings" ? null : view;

  return (
    <nav className="app-nav">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item ${activeId === id ? "active" : ""}`}
          onClick={() => setView(id)}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}
