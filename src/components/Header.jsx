import { Bookmark, MapPin, Settings as SettingsIcon } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Header() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const openTray = useStore((s) => s.openTray);
  const openBookmarksTray = useStore((s) => s.openBookmarksTray);
  const favoritesCount = useStore((s) => s.favorites.length);
  const bookmarks = useStore((s) => s.bookmarks);
  const hasMainBookmark = bookmarks.some((b) => b.type === "main");

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 100 100">
            <path
              d="M50 20 C36 20 25 31 25 45 C25 62 40 72 50 82 C60 72 75 62 75 45 C75 31 64 20 50 20 Z"
              fill="none"
              stroke="#B98B3E"
              strokeWidth="6"
            />
          </svg>
        </span>
        Noor
      </div>
      <div className="header-actions">
        {/* Reading bookmarks / memories */}
        <button
          id="header-bookmarks-btn"
          className={`icon-button ${hasMainBookmark ? "active" : ""}`}
          onClick={openBookmarksTray}
          aria-label="Reading memories"
          title="Reading memories"
          style={{ position: "relative" }}
        >
          <MapPin size={19} />
          {hasMainBookmark && <span className="bm-header-dot" aria-hidden="true" />}
        </button>

        {/* Favourites */}
        <button
          id="header-favorites-btn"
          className="icon-button"
          onClick={openTray}
          aria-label={`Favorites (${favoritesCount})`}
        >
          <Bookmark size={19} />
        </button>

        <button
          id="header-settings-btn"
          className={`icon-button ${view === "settings" ? "active" : ""}`}
          onClick={() => setView("settings")}
          aria-label="Settings"
        >
          <SettingsIcon size={19} />
        </button>
      </div>
    </header>
  );
}
