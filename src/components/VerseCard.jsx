import { Bookmark, Share2 } from "lucide-react";
import { useStore } from "../store/useStore";

/**
 * Renders one verse: Arabic text, transliteration, the selected translation,
 * and quick actions (save / share). Used in the reader, search results,
 * favorites tray, and the Verse of the Day banner.
 */
export default function VerseCard({ verse, surahName, showTransliteration = true, compact = false }) {
  const translationLang = useStore((s) => s.translationLang);
  const translations = useStore((s) => s.translations);
  const isFavorite = useStore((s) => s.isFavorite(verse.verseKey));
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const fontScale = useStore((s) => s.fontScale);

  const translation =
    verse.translations.find((t) => t.lang === translationLang) ?? verse.translations[0];
  const translationLabel = translations.find((t) => t.lang === translation.lang)?.label;

  const handleShare = async () => {
    const text = `${verse.textAr}\n\n"${translation.text}"\n— Quran ${verse.verseKey}${
      surahName ? ` (${surahName})` : ""
    }`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* user cancelled — no-op */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="verse-card">
      <div className="verse-refline">
        <span className="verse-key">
          {verse.verseKey}
          {surahName ? ` · ${surahName}` : ""}
        </span>
      </div>

      <p className="verse-arabic" style={{ fontSize: `${1.7 * fontScale}rem` }} lang="ar" dir="rtl">
        {verse.textAr}
      </p>

      {showTransliteration && verse.transliteration && (
        <p className="verse-transliteration">{verse.transliteration}</p>
      )}

      <p className="verse-translation" style={{ fontSize: `${1.02 * fontScale}rem` }}>
        {translation.text}
      </p>

      {!compact && translationLabel && <p className="verse-translator">{translationLabel}</p>}

      <div className="verse-actions">
        <button
          className={`btn btn-subtle ${isFavorite ? "is-active" : ""}`}
          onClick={() => toggleFavorite(verse.verseKey)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Saved" : "Save"}
        </button>
        <button className="btn btn-subtle" onClick={handleShare} aria-label="Share verse">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
