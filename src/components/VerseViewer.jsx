import { useEffect, useState } from "react";
import { ChevronLeft, Check, Play, Pause } from "lucide-react";
import { getChapter, isChapterDownloaded } from "../lib/quranData";
import { useStore } from "../store/useStore";
import VerseCard from "./VerseCard";

export default function VerseViewer({ surahNumber }) {
  const [chapter, setChapter] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const setView = useStore((s) => s.setView);

  // Audio
  const playerVerseKey = useStore((s) => s.playerVerseKey);
  const isPlaying = useStore((s) => s.isPlaying);
  const playVerse = useStore((s) => s.playVerse);
  const pauseAudio = useStore((s) => s.pauseAudio);

  // Is this surah currently being played?
  const playingSurah = playerVerseKey ? Number(playerVerseKey.split(":")[0]) : null;
  const isSurahPlaying = playingSurah === surahNumber && isPlaying;

  const handleSurahPlay = () => {
    if (isSurahPlaying) {
      pauseAudio();
    } else if (playingSurah === surahNumber && !isPlaying) {
      // Resume same surah where it left off
      playVerse(playerVerseKey);
    } else {
      // Start from verse 1
      playVerse(`${surahNumber}:1`);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setChapter(null);
    (async () => {
      const c = await getChapter(surahNumber);
      const isDown = await isChapterDownloaded(surahNumber);
      if (!cancelled) {
        setChapter(c);
        setDownloaded(isDown);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  return (
    <div>
      <div className="back-row">
        <button className="btn btn-subtle" onClick={() => setView("browse")}>
          <ChevronLeft size={16} />
          All Surahs
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

            {/* Play whole surah button */}
            <button
              className={`btn ${isSurahPlaying ? "btn-ghost" : "btn-primary"}`}
              onClick={handleSurahPlay}
              style={{ marginTop: 14 }}
              aria-label={isSurahPlaying ? "Pause surah" : "Play surah from beginning"}
            >
              {isSurahPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              {isSurahPlaying
                ? "Pause"
                : playingSurah === surahNumber
                ? "Resume Surah"
                : "Play Surah"}
            </button>
          </div>

          {chapter.verses.map((v) => (
            <VerseCard key={v.verseKey} verse={v} />
          ))}
        </>
      )}
    </div>
  );
}
