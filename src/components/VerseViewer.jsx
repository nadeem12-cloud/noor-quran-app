import { useEffect, useState } from "react";
import { ChevronLeft, Check, MapPin, BookMarked } from "lucide-react";
import { getChapter, isChapterDownloaded } from "../lib/quranData";
import { useStore } from "../store/useStore";
import VerseCard from "./VerseCard";

/**
 * VerseViewer — reads a full surah chapter.
 * Tracks visit in recentSurahs automatically on mount.
 * Each verse card row gets a "Set Main Bookmark" and "Study Bookmark" action.
 */
export default function VerseViewer({ surahNumber }) {
  const [chapter, setChapter] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const setView = useStore((s) => s.setView);
  const trackRecentSurah = useStore((s) => s.trackRecentSurah);
  const recordReading = useStore((s) => s.recordReading);

  useEffect(() => {
    let cancelled = false;
    setChapter(null);
    (async () => {
      const c = await getChapter(surahNumber);
      const isDown = await isChapterDownloaded(surahNumber);
      if (!cancelled) {
        setChapter(c);
        setDownloaded(isDown);
        recordReading(surahNumber, 1, c.nameTransliterated, c.versesCount);
      }
    })();
    // Record visit
    trackRecentSurah(surahNumber);
    return () => {
      cancelled = true;
    };
  }, [surahNumber, trackRecentSurah, recordReading]);

  return (
    <div>
      <div className="back-row">
        <button className="btn btn-subtle" onClick={() => setView("browse")}>
          <ChevronLeft size={16} />
          Browse
        </button>
      </div>

      {!chapter && <p className="text-dim">Loading surah…</p>}

      {chapter && (
        <>
          <div className="chapter-header">
            <span className="surah-name-arabic">{chapter.nameArabic}</span>
            <span className="surah-name-translit">{chapter.nameTransliterated}</span>
            <p className="section-sub" style={{ marginTop: 6 }}>
              {chapter.nameTranslated} · {chapter.versesCount} verses ·{" "}
              {chapter.revelationPlace === "makkah" ? "Revealed in Makkah" : "Revealed in Madinah"}
              {downloaded && (
                <>
                  {" · "}
                  <Check size={13} style={{ verticalAlign: "-2px" }} /> saved offline
                </>
              )}
            </p>
          </div>

          {chapter.verses.map((v) => (
            <VerseWithBookmarks
              key={v.verseKey}
              verse={v}
              surahName={chapter.nameTransliterated}
              surahNumber={surahNumber}
            />
          ))}
        </>
      )}
    </div>
  );
}

/** Wraps VerseCard with bookmark action buttons below it. */
function VerseWithBookmarks({ verse, surahName, surahNumber }) {
  const setMainBookmark = useStore((s) => s.setMainBookmark);
  const addStudyBookmark = useStore((s) => s.addStudyBookmark);
  const recordReading = useStore((s) => s.recordReading);
  const bookmarks = useStore((s) => s.bookmarks);
  const [mainSet, setMainSet] = useState(false);
  const [studySet, setStudySet] = useState(false);

  const isMainHere = bookmarks.some(
    (b) => b.type === "main" && b.verseKey === verse.verseKey
  );
  const isStudyHere = bookmarks.some(
    (b) => b.type === "study" && b.verseKey === verse.verseKey
  );

  const handleMain = async () => {
    await setMainBookmark(verse.verseKey, surahNumber, verse.ayah);
    recordReading(surahNumber, verse.ayah, surahName);
    setMainSet(true);
    setTimeout(() => setMainSet(false), 1800);
  };

  const handleStudy = async () => {
    if (isStudyHere) return; // already saved
    await addStudyBookmark(verse.verseKey, surahNumber, verse.ayah, surahName);
    recordReading(surahNumber, verse.ayah, surahName);
    setStudySet(true);
    setTimeout(() => setStudySet(false), 1800);
  };

  return (
    <div className="verse-with-bm">
      <VerseCard verse={verse} surahName={surahName} />
      <div className="verse-bm-row">
        <button
          className={`btn btn-subtle verse-bm-btn ${isMainHere ? "is-active" : ""}`}
          onClick={handleMain}
          title="Update your main reading position to this verse"
        >
          <MapPin size={13} fill={isMainHere ? "currentColor" : "none"} />
          {mainSet ? "Main bookmark set!" : isMainHere ? "Main bookmark here" : "Set Main Bookmark"}
        </button>
        <button
          className={`btn btn-subtle verse-bm-btn ${isStudyHere ? "is-active" : ""}`}
          onClick={handleStudy}
          title="Save this verse as an independent study bookmark"
          disabled={isStudyHere}
        >
          <BookMarked size={13} fill={isStudyHere ? "currentColor" : "none"} />
          {studySet ? "Study bookmark saved!" : isStudyHere ? "Study bookmarked" : "Study Bookmark"}
        </button>
      </div>
    </div>
  );
}
