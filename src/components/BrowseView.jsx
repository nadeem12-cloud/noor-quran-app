import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Star, BookMarked } from "lucide-react";
import { getSurahs, getVerse } from "../lib/quranData";
import { useStore } from "../store/useStore";
import { JUZ_DATA, FREQUENTLY_READ_SURAHS, FREQUENTLY_READ_VERSES } from "../lib/juzData";
import VerseCard from "./VerseCard";

// ─── Frequently Read Verses mini-loader ────────────────────────────────────
function FrequentVerseCard({ verseKey, label }) {
  const [verse, setVerse] = useState(null);
  useEffect(() => {
    getVerse(verseKey).then(setVerse).catch(() => {});
  }, [verseKey]);

  if (!verse) return (
    <div className="freq-verse-skeleton">
      <span className="freq-verse-label">{label}</span>
    </div>
  );
  return <VerseCard verse={verse} surahName={verse.surahName} compact />;
}

// ─── Surah Tab ──────────────────────────────────────────────────────────────
function SurahTab({ surahs, openSurah }) {
  const recentSurahs = useStore((s) => s.recentSurahs);

  // Build a map of surahNumber → surah metadata
  const surahMap = surahs ? Object.fromEntries(surahs.map((s) => [s.number, s])) : {};

  // Dynamic recently-opened surahs (up to 5)
  const recentNumbers = recentSurahs.slice(0, 5).map((r) => r.surahNumber);

  // Curated frequently read, excluding ones already in recent
  const curatedPinned = FREQUENTLY_READ_SURAHS.filter((n) => !recentNumbers.includes(n)).slice(0, 6);
  const pinnedSurahs = [...new Set([...recentNumbers, ...curatedPinned])].slice(0, 8);

  return (
    <div>
      {/* Frequently Read Surahs */}
      <div className="freq-section">
        <div className="freq-header">
          <Star size={14} className="freq-icon" />
          <span>Frequently Read Surahs</span>
        </div>
        <div className="freq-chips-scroll">
          {pinnedSurahs.map((num) => {
            const s = surahMap[num];
            if (!s) return null;
            return (
              <button
                key={num}
                className="freq-chip"
                onClick={() => openSurah(num)}
              >
                <span className="freq-chip-arabic">{s.nameArabic}</span>
                <span className="freq-chip-name">{s.nameTransliterated}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frequently Read Verses */}
      <div className="freq-section">
        <div className="freq-header">
          <BookMarked size={14} className="freq-icon" />
          <span>Frequently Read Verses</span>
        </div>
        <div className="freq-verses-list">
          {FREQUENTLY_READ_VERSES.map(({ verseKey, label }) => (
            <FrequentVerseCard key={verseKey} verseKey={verseKey} label={label} />
          ))}
        </div>
      </div>

      {/* Full surah list */}
      <h2 className="section-title" style={{ marginTop: 24 }}>All Surahs</h2>
      <p className="section-sub">114 chapters, in Quran order.</p>
      {!surahs && <p className="text-dim">Loading…</p>}
      {surahs?.map((s) => (
        <button
          key={s.number}
          className="surah-row"
          style={{ width: "100%", textAlign: "left" }}
          onClick={() => openSurah(s.number)}
        >
          <span className="surah-number">{s.number}</span>
          <span className="surah-info">
            <span className="surah-name-translit">{s.nameTransliterated}</span>
            <span className="surah-name-meta">
              {s.nameTranslated} · {s.versesCount} verses ·{" "}
              {s.revelationPlace === "makkah" ? "Meccan" : "Medinan"}
            </span>
          </span>
          <span className="surah-name-arabic">{s.nameArabic}</span>
          <ChevronRight size={18} style={{ marginLeft: 8, opacity: 0.5, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

// ─── Juz Tab ────────────────────────────────────────────────────────────────
function JuzTab({ surahs, openSurah }) {
  const [expanded, setExpanded] = useState(null);

  const surahMap = surahs ? Object.fromEntries(surahs.map((s) => [s.number, s])) : {};

  const toggle = (num) => setExpanded((prev) => (prev === num ? null : num));

  return (
    <div>
      <h2 className="section-title">By Juz (Para)</h2>
      <p className="section-sub">30 divisions of the Quran.</p>
      <div className="juz-list">
        {JUZ_DATA.map((juz) => {
          const isOpen = expanded === juz.number;
          // Surahs contained in this juz
          const surahsInJuz = surahs
            ? surahs.filter((s) => s.number >= juz.surahStart && s.number <= juz.surahEnd)
            : [];

          return (
            <div key={juz.number} className={`juz-item ${isOpen ? "is-open" : ""}`}>
              <button
                className="juz-header-row"
                onClick={() => toggle(juz.number)}
                aria-expanded={isOpen}
              >
                <div className="juz-badge">
                  <span className="juz-num">{juz.number}</span>
                </div>
                <div className="juz-info">
                  <span className="juz-name-arabic">{juz.nameArabic}</span>
                  <span className="juz-desc">
                    Surah {juz.surahStart}
                    {juz.surahEnd !== juz.surahStart ? `–${juz.surahEnd}` : ""}
                    {surahsInJuz[0] ? ` · ${surahsInJuz[0].nameTransliterated}` : ""}
                    {surahsInJuz.length > 1 && surahsInJuz[surahsInJuz.length - 1]
                      ? ` to ${surahsInJuz[surahsInJuz.length - 1].nameTransliterated}`
                      : ""}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className="juz-chevron"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              {isOpen && (
                <div className="juz-surah-list">
                  {surahsInJuz.map((s) => (
                    <button
                      key={s.number}
                      className="juz-surah-row"
                      onClick={() => openSurah(s.number)}
                    >
                      <span className="juz-surah-num">{s.number}</span>
                      <span className="juz-surah-name">{s.nameTransliterated}</span>
                      <span className="juz-surah-arabic">{s.nameArabic}</span>
                      <ChevronRight size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                    </button>
                  ))}
                  <button
                    className="btn btn-ghost juz-open-btn"
                    onClick={() => openSurah(juz.startSurah)}
                  >
                    Open Juz {juz.number} from start
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main BrowseView ────────────────────────────────────────────────────────
export default function BrowseView() {
  const [surahs, setSurahs] = useState(null);
  const openSurah = useStore((s) => s.openSurah);
  const browseTab = useStore((s) => s.browseTab);
  const setBrowseTab = useStore((s) => s.setBrowseTab);

  useEffect(() => {
    getSurahs().then(setSurahs);
  }, []);

  return (
    <div>
      {/* Tab bar */}
      <div className="browse-tabs">
        <button
          id="browse-tab-surah"
          className={`browse-tab ${browseTab === "surah" ? "is-active" : ""}`}
          onClick={() => setBrowseTab("surah")}
        >
          Surah
        </button>
        <button
          id="browse-tab-juz"
          className={`browse-tab ${browseTab === "juz" ? "is-active" : ""}`}
          onClick={() => setBrowseTab("juz")}
        >
          Juz (Para)
        </button>
      </div>

      {browseTab === "surah" && <SurahTab surahs={surahs} openSurah={openSurah} />}
      {browseTab === "juz" && <JuzTab surahs={surahs} openSurah={openSurah} />}
    </div>
  );
}
