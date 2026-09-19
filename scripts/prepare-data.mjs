// Prepares static Quran data from the `quran-json` npm package (CC BY-4.0,
// Arabic text via The Noble Qur'an Encyclopedia, transliteration via Tanzil.net)
// into the shape this app consumes. Run with: npm run prepare-data
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDist = path.resolve(__dirname, "../node_modules/quran-json/dist");
const outDir = path.resolve(__dirname, "../public/data");
const chaptersOutDir = path.join(outDir, "chapters");

fs.mkdirSync(chaptersOutDir, { recursive: true });

const REVELATION_MAP = { meccan: "makkah", medinan: "madinah" };

const indexAr = JSON.parse(fs.readFileSync(path.join(pkgDist, "chapters/index.json"), "utf8"));
const indexEn = JSON.parse(fs.readFileSync(path.join(pkgDist, "chapters/en/index.json"), "utf8"));

const surahs = indexAr.map((s, i) => ({
  number: s.id,
  nameArabic: s.name,
  nameTransliterated: s.transliteration,
  nameTranslated: indexEn[i]?.translation ?? "",
  versesCount: s.total_verses,
  revelationPlace: REVELATION_MAP[s.type] ?? s.type,
}));

fs.writeFileSync(path.join(outDir, "surahs.json"), JSON.stringify(surahs));
console.log(`Wrote surahs.json (${surahs.length} surahs)`);

let totalVerses = 0;
for (const s of surahs) {
  const n = s.number;
  const ar = JSON.parse(fs.readFileSync(path.join(pkgDist, `chapters/${n}.json`), "utf8"));
  const en = JSON.parse(fs.readFileSync(path.join(pkgDist, `chapters/en/${n}.json`), "utf8"));
  const ur = JSON.parse(fs.readFileSync(path.join(pkgDist, `chapters/ur/${n}.json`), "utf8"));

  const verses = ar.verses.map((v, i) => ({
    ayah: v.id,
    verseKey: `${n}:${v.id}`,
    textAr: v.text,
    transliteration: v.transliteration,
    translations: [
      { lang: "en", translator: "Saheeh International (via quranenc.com)", text: en.verses[i]?.translation ?? "" },
      { lang: "ur", translator: "Fateh Muhammad Jalandhari (via quranenc.com)", text: ur.verses[i]?.translation ?? "" },
    ],
  }));

  fs.writeFileSync(
    path.join(chaptersOutDir, `${n}.json`),
    JSON.stringify({
      number: n,
      nameArabic: s.nameArabic,
      nameTransliterated: s.nameTransliterated,
      nameTranslated: s.nameTranslated,
      revelationPlace: s.revelationPlace,
      versesCount: s.versesCount,
      verses,
    })
  );
  totalVerses += verses.length;
}
console.log(`Wrote ${surahs.length} chapter files (${totalVerses} verses total)`);

// Lightweight search index: one row per verse, translation text only
// (kept separate from the full chapter files so search doesn't require
// downloading all 114 chapters up front).
const searchIndex = [];
for (const s of surahs) {
  const n = s.number;
  const chapter = JSON.parse(fs.readFileSync(path.join(chaptersOutDir, `${n}.json`), "utf8"));
  for (const v of chapter.verses) {
    searchIndex.push({
      verseKey: v.verseKey,
      surah: n,
      ayah: v.ayah,
      surahName: s.nameTransliterated,
      textEn: v.translations[0]?.text ?? "",
    });
  }
}
fs.writeFileSync(path.join(outDir, "search-index.json"), JSON.stringify(searchIndex));
console.log(`Wrote search-index.json (${searchIndex.length} rows)`);
