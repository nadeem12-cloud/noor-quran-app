import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getVerse } from "../lib/quranData";
import { useStore } from "../store/useStore";
import VerseCard from "./VerseCard";

export default function FavoritesTray() {
  const trayOpen = useStore((s) => s.trayOpen);
  const closeTray = useStore((s) => s.closeTray);
  const favorites = useStore((s) => s.favorites);
  const [verses, setVerses] = useState([]);

  useEffect(() => {
    if (!trayOpen) return;
    let cancelled = false;
    Promise.all(favorites.map((f) => getVerse(f.verseKey).catch(() => null))).then((list) => {
      if (!cancelled) setVerses(list.filter(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [trayOpen, favorites]);

  if (!trayOpen) return null;

  return (
    <div className="tray-overlay" onClick={closeTray}>
      <div className="tray-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Favorites">
        <div className="tray-handle" />
        <div className="tray-title-row">
          <h2 className="section-title" style={{ margin: 0 }}>
            Favorites ({favorites.length})
          </h2>
          <button className="icon-button" onClick={closeTray} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {favorites.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-title">No saved verses yet</p>
            <p>Tap "Save" on any verse to keep it here — available offline too.</p>
          </div>
        )}

        {verses.map((v) => (
          <VerseCard key={v.verseKey} verse={v} surahName={v.surahName} compact />
        ))}
      </div>
    </div>
  );
}
