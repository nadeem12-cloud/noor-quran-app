import { useEffect, useState } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { getVotdPool, getVerse } from "../lib/quranData";
import { pickVerseOfTheDay } from "../lib/dailyVerse";
import { useStore } from "../store/useStore";

export default function VotdBanner() {
  const [entry, setEntry] = useState(null);
  const [verse, setVerse] = useState(null);
  const translationLang = useStore((s) => s.translationLang);
  const isFavorite = useStore((s) => (verse ? s.isFavorite(verse.verseKey) : false));
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pool = await getVotdPool();
      const picked = pickVerseOfTheDay(pool);
      if (cancelled || !picked) return;
      setEntry(picked);
      const v = await getVerse(picked.verseKey);
      if (!cancelled) setVerse(v);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!entry || !verse) {
    return (
      <div className="votd-banner" aria-busy="true">
        <div className="votd-eyebrow">
          <span>Verse of the Day</span>
        </div>
        <p className="text-dim">Loading today's verse…</p>
      </div>
    );
  }

  const translation =
    verse.translations.find((t) => t.lang === translationLang) ?? verse.translations[0];

  const handleShare = async () => {
    const text = `${verse.textAr}\n\n"${translation.text}"\n— Quran ${verse.verseKey} (${verse.surahName})`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="votd-banner">
      <div className="votd-eyebrow">
        <span>Verse of the Day</span>
        <span className="votd-theme-pill">{entry.theme}</span>
      </div>

      <p className="verse-arabic" lang="ar" dir="rtl" style={{ margin: "4px 0 14px" }}>
        {verse.textAr}
      </p>
      <p className="verse-translation">{translation.text}</p>
      <p className="verse-translator" style={{ opacity: 0.75 }}>
        {verse.verseKey} · {verse.surahName}
      </p>

      <p className="votd-context">{entry.context}</p>

      <div className="votd-actions">
        <button className="btn btn-primary" onClick={() => toggleFavorite(verse.verseKey)}>
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Saved" : "Save"}
        </button>
        <button className="btn btn-ghost-on-dark" onClick={handleShare}>
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
