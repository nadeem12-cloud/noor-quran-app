import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search as SearchIcon } from "lucide-react";
import { getSearchIndex, getSurahs, getVerse } from "../lib/quranData";
import { useStore } from "../store/useStore";
import VerseCard from "./VerseCard";

const VERSE_KEY_RE = /^\s*(\d{1,3})\s*[:.]\s*(\d{1,3})\s*$/;

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(null);
  const [surahs, setSurahs] = useState(null);
  const [directVerse, setDirectVerse] = useState(null);
  const [results, setResults] = useState([]);
  const openSurah = useStore((s) => s.openSurah);

  useEffect(() => {
    getSearchIndex().then(setIndex);
    getSurahs().then(setSurahs);
  }, []);

  const fuse = useMemo(() => {
    if (!index) return null;
    return new Fuse(index, {
      keys: [
        { name: "textEn", weight: 0.7 },
        { name: "surahName", weight: 0.3 },
      ],
      threshold: 0.32,
      ignoreLocation: true,
    });
  }, [index]);

  const surahMatches = useMemo(() => {
    if (!surahs || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return surahs.filter((s) => s.nameTransliterated.toLowerCase().includes(q)).slice(0, 5);
  }, [surahs, query]);

  useEffect(() => {
    let cancelled = false;
    setDirectVerse(null);
    setResults([]);

    const trimmed = query.trim();
    if (!trimmed) return;

    const verseKeyMatch = trimmed.match(VERSE_KEY_RE);
    if (verseKeyMatch) {
      const key = `${verseKeyMatch[1]}:${verseKeyMatch[2]}`;
      getVerse(key)
        .then((v) => !cancelled && setDirectVerse(v))
        .catch(() => !cancelled && setDirectVerse(null));
      return;
    }

    if (fuse) {
      const hits = fuse.search(trimmed, { limit: 20 }).map((r) => r.item);
      if (!cancelled) setResults(hits);
    }
    return () => {
      cancelled = true;
    };
  }, [query, fuse]);

  return (
    <div>
      <h2 className="section-title">Search</h2>
      <p className="section-sub">By keyword, surah name, or verse key (e.g. "2:255").</p>

      <div className="search-input-row">
        <SearchIcon size={18} style={{ opacity: 0.6 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="patience, Al-Baqarah, 2:255…"
          aria-label="Search verses"
          autoFocus
        />
      </div>

      {directVerse && (
        <>
          <p className="section-sub" style={{ marginTop: 0 }}>Direct match</p>
          <VerseCard verse={directVerse} surahName={directVerse.surahName} />
        </>
      )}

      {surahMatches.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p className="section-sub" style={{ marginTop: 0 }}>Surahs</p>
          {surahMatches.map((s) => (
            <button
              key={s.number}
              className="surah-row"
              style={{ width: "100%", textAlign: "left" }}
              onClick={() => openSurah(s.number)}
            >
              <span className="surah-number">{s.number}</span>
              <span className="surah-info">
                <span className="surah-name-translit">{s.nameTransliterated}</span>
                <span className="surah-name-meta">{s.nameTranslated}</span>
              </span>
              <span className="surah-name-arabic">{s.nameArabic}</span>
            </button>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="section-sub" style={{ marginTop: 0 }}>Verses ({results.length})</p>
          {results.map((r) => (
            <ResultCard key={r.verseKey} row={r} />
          ))}
        </>
      )}

      {query.trim() && !directVerse && surahMatches.length === 0 && results.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No matches</p>
          <p>Try a different word, or search by surah name.</p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ row }) {
  const [verse, setVerse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getVerse(row.verseKey).then((v) => !cancelled && setVerse(v));
    return () => {
      cancelled = true;
    };
  }, [row.verseKey]);

  if (!verse) return null;
  return <VerseCard verse={verse} surahName={verse.surahName} compact />;
}
