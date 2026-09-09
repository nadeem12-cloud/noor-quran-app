import { useState } from "react";
import { Shuffle } from "lucide-react";
import VotdBanner from "./VotdBanner";
import VerseCard from "./VerseCard";
import { getSurahs, getVerse, randomVerseKey } from "../lib/quranData";

export default function Home() {
  const [randomVerse, setRandomVerse] = useState(null);
  const [randomSurahName, setRandomSurahName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRandom = async () => {
    setLoading(true);
    try {
      const surahs = await getSurahs();
      const key = randomVerseKey(surahs);
      const verse = await getVerse(key);
      setRandomVerse(verse);
      setRandomSurahName(verse.surahName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <VotdBanner />

      <h2 className="section-title">Explore a random verse</h2>
      <p className="section-sub">Pulled from anywhere in the Quran — a way to encounter something new.</p>

      <button className="btn btn-ghost" onClick={handleRandom} disabled={loading} style={{ marginBottom: 18 }}>
        <Shuffle size={16} />
        {loading ? "Finding a verse…" : randomVerse ? "Show another" : "Show me a verse"}
      </button>

      {randomVerse && <VerseCard verse={randomVerse} surahName={randomSurahName} />}
    </div>
  );
}
