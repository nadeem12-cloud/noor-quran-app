import { BookOpen, ArrowRight, Play } from "lucide-react";
import { useStore } from "../store/useStore";

export default function ContinueReadingCard() {
  const lastRead = useStore((s) => s.lastRead);
  const resumeReading = useStore((s) => s.resumeReading);
  const playVerse = useStore((s) => s.playVerse);

  if (!lastRead) {
    return null;
  }

  const { surahNumber, surahName, ayahNumber, totalVerses, verseKey } = lastRead;
  const progressPercent = totalVerses
    ? Math.round((ayahNumber / totalVerses) * 100)
    : 0;

  const handlePlayDirect = (e) => {
    e.stopPropagation();
    playVerse(verseKey || `${surahNumber}:${ayahNumber}`);
  };

  return (
    <div className="continue-card" onClick={resumeReading} role="button" tabIndex={0}>
      <div className="continue-card-content">
        <div className="continue-icon-box">
          <BookOpen size={20} />
        </div>

        <div className="continue-details">
          <div className="continue-kicker">Continue Reading</div>
          <div className="continue-title">
            {surahName} · <span className="continue-verse-num">Ayah {ayahNumber}</span>
          </div>
          <div className="continue-progress-text">
            Verse {ayahNumber} of {totalVerses || "?"} · {progressPercent}% of Surah
          </div>
        </div>

        <div className="continue-actions">
          <button
            className="continue-play-btn"
            onClick={handlePlayDirect}
            title="Play recitation from here"
            aria-label="Play recitation"
          >
            <Play size={14} fill="currentColor" />
          </button>
          <button className="continue-resume-btn" aria-label="Resume reading">
            <span>Resume</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="continue-track">
        <div
          className="continue-fill"
          style={{ width: `${Math.max(4, progressPercent)}%` }}
        />
      </div>
    </div>
  );
}
