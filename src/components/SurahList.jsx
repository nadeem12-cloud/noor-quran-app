import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getSurahs } from "../lib/quranData";
import { useStore } from "../store/useStore";

export default function SurahList() {
  const [surahs, setSurahs] = useState(null);
  const openSurah = useStore((s) => s.openSurah);

  useEffect(() => {
    getSurahs().then(setSurahs);
  }, []);

  return (
    <div>
      <h2 className="section-title">All Surahs</h2>
      <p className="section-sub">114 chapters, in Quran order.</p>

      {!surahs && <p className="text-dim">Loading…</p>}

      {surahs?.map((s) => (
        <button key={s.number} className="surah-row" style={{ width: "100%", textAlign: "left" }} onClick={() => openSurah(s.number)}>
          <span className="surah-number">{s.number}</span>
          <span className="surah-info">
            <span className="surah-name-translit">{s.nameTransliterated}</span>
            <span className="surah-name-meta">
              {s.nameTranslated} · {s.versesCount} verses · {s.revelationPlace === "makkah" ? "Meccan" : "Medinan"}
            </span>
          </span>
          <span className="surah-name-arabic">{s.nameArabic}</span>
          <ChevronRight size={18} style={{ marginLeft: 8, opacity: 0.5, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}
