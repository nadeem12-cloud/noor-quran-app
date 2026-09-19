import { X, MapPin, BookOpen, Trash2, Navigation } from "lucide-react";
import { useStore } from "../store/useStore";

export default function BookmarksTray() {
  const open = useStore((s) => s.bookmarksTrayOpen);
  const close = useStore((s) => s.closeBookmarksTray);
  const bookmarks = useStore((s) => s.bookmarks);
  const removeBookmark = useStore((s) => s.removeBookmark);
  const openSurah = useStore((s) => s.openSurah);

  const mainBookmark = bookmarks.find((b) => b.type === "main") ?? null;
  const studyBookmarks = bookmarks.filter((b) => b.type === "study");

  if (!open) return null;

  const handleResume = () => {
    if (mainBookmark) {
      openSurah(mainBookmark.surahNumber);
      close();
    }
  };

  const handleOpenStudy = (bm) => {
    openSurah(bm.surahNumber);
    close();
  };

  return (
    <div className="tray-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Reading bookmarks">
      <div className="tray-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="tray-handle" />

        <div className="tray-title-row">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={18} style={{ color: "var(--accent)" }} />
            <span className="section-title" style={{ margin: 0 }}>Reading Memories</span>
          </div>
          <button className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Main Reading Bookmark ── */}
        <div className="bm-section-label">
          <BookOpen size={13} />
          Main Reading
        </div>

        {mainBookmark ? (
          <div className="bm-card bm-card-main">
            <div className="bm-card-inner">
              <div className="bm-verse-key">{mainBookmark.verseKey}</div>
              <div className="bm-name">{mainBookmark.name}</div>
              <div className="bm-date">
                Saved {new Date(mainBookmark.savedAt).toLocaleDateString(undefined, {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </div>
            </div>
            <div className="bm-card-actions">
              <button className="btn btn-primary bm-resume-btn" onClick={handleResume}>
                <Navigation size={14} />
                Resume
              </button>
              <button
                className="icon-button"
                onClick={() => removeBookmark(mainBookmark.id)}
                aria-label="Remove main bookmark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bm-empty">
            <p>No main bookmark yet.</p>
            <p className="text-dim" style={{ fontSize: "0.82rem" }}>
              Open any surah and tap <strong>Set Main Bookmark</strong> on a verse to save your place.
            </p>
          </div>
        )}

        {/* ── Study Bookmarks ── */}
        <div className="bm-section-label" style={{ marginTop: 20 }}>
          <MapPin size={13} />
          Study Bookmarks
          {studyBookmarks.length > 0 && (
            <span className="bm-count">{studyBookmarks.length}</span>
          )}
        </div>

        {studyBookmarks.length === 0 ? (
          <div className="bm-empty">
            <p>No study bookmarks yet.</p>
            <p className="text-dim" style={{ fontSize: "0.82rem" }}>
              Tap <strong>Study Bookmark</strong> on any verse to save it independently — won't affect your main reading progress.
            </p>
          </div>
        ) : (
          <div className="bm-study-list">
            {studyBookmarks.map((bm) => (
              <div key={bm.id} className="bm-study-row">
                <button className="bm-study-info" onClick={() => handleOpenStudy(bm)}>
                  <span className="bm-verse-key">{bm.verseKey}</span>
                  <span className="bm-name">{bm.name}</span>
                </button>
                <button
                  className="icon-button"
                  onClick={() => removeBookmark(bm.id)}
                  aria-label={`Remove bookmark ${bm.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
