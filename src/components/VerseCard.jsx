import { Bookmark, Share2, Play, Pause } from "lucide-react";
import { useStore } from "../store/useStore";

/**
 * Renders one verse: Arabic text, transliteration, the selected translation,
 * and quick actions (play / save / share). Used in the reader, search results,
 * favorites tray, and the Verse of the Day banner.
 */
export default function VerseCard({ verse, surahName, showTransliteration = true, compact = false }) {
  const translationLang = useStore((s) => s.translationLang);
  const translations = useStore((s) => s.translations);
  const isFavorite = useStore((s) => s.isFavorite(verse.verseKey));
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const fontScale = useStore((s) => s.fontScale);

  // Audio state
  const playerVerseKey = useStore((s) => s.playerVerseKey);
  const isPlaying = useStore((s) => s.isPlaying);
  const playVerse = useStore((s) => s.playVerse);
  const pauseAudio = useStore((s) => s.pauseAudio);

  const isThisVersePlaying = playerVerseKey === verse.verseKey && isPlaying;
  const isThisVerseLoaded = playerVerseKey === verse.verseKey;

  const handlePlayPause = () => {
    if (isThisVersePlaying) {
      pauseAudio();
    } else {
      playVerse(verse.verseKey);
    }
  };

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
    <div
      id={`verse-${verse.verseKey}`}
      className={`verse-card ${isThisVerseLoaded ? "verse-card--active" : ""}`}
    >
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
        {/* Play / Pause */}
        <button
          className={`btn btn-subtle ${isThisVerseLoaded ? "is-active" : ""}`}
          onClick={handlePlayPause}
          aria-label={isThisVersePlaying ? "Pause recitation" : "Play recitation"}
        >
          {isThisVersePlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill={isThisVerseLoaded ? "currentColor" : "none"} />
          )}
          {isThisVersePlaying ? "Pause" : "Play"}
        </button>

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
