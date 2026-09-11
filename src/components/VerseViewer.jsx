import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Check, Play, Pause } from "lucide-react";
import { getChapter, isChapterDownloaded } from "../lib/quranData";
import { useStore } from "../store/useStore";
import VerseCard from "./VerseCard";

export default function VerseViewer({ surahNumber }) {
  const [chapter, setChapter] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const setView = useStore((s) => s.setView);
  const targetAyah = useStore((s) => s.targetAyah);
  const recordReading = useStore((s) => s.recordReading);

  // Audio
  const playerVerseKey = useStore((s) => s.playerVerseKey);
  const isPlaying = useStore((s) => s.isPlaying);
  const playVerse = useStore((s) => s.playVerse);
  const pauseAudio = useStore((s) => s.pauseAudio);

  const observerRef = useRef(null);
  const lastRecordedAyahRef = useRef(null);

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
      // Start from verse 1 or target ayah
      playVerse(`${surahNumber}:${targetAyah || 1}`);
    }
  };

  // Load chapter data
  useEffect(() => {
    let cancelled = false;
    setChapter(null);
    lastRecordedAyahRef.current = null;

    (async () => {
      const c = await getChapter(surahNumber);
      const isDown = await isChapterDownloaded(surahNumber);
      if (!cancelled) {
        setChapter(c);
        setDownloaded(isDown);

        // Record initial reading on opening surah
        const initialAyah = targetAyah || 1;
        recordReading(surahNumber, initialAyah, c.nameTransliterated, c.versesCount);
        lastRecordedAyahRef.current = initialAyah;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  // Scroll to target ayah if requested
  useEffect(() => {
    if (chapter && targetAyah) {
      const el = document.getElementById(`verse-${surahNumber}:${targetAyah}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
    }
  }, [chapter, targetAyah, surahNumber]);

  // Track scrolling reading progress with IntersectionObserver
  useEffect(() => {
    if (!chapter || !chapter.verses) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const id = entry.target.id; // "verse-1:5"
          if (id && id.startsWith("verse-")) {
            const parts = id.replace("verse-", "").split(":");
            const ayah = Number(parts[1]);
            if (ayah && ayah !== lastRecordedAyahRef.current) {
              lastRecordedAyahRef.current = ayah;
              recordReading(surahNumber, ayah, chapter.nameTransliterated, chapter.versesCount);
            }
          }
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    });

    chapter.verses.forEach((v) => {
      const el = document.getElementById(`verse-${v.verseKey}`);
      if (el) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [chapter, surahNumber]);

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
