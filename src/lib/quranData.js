import { db } from "./db";

let surahsCache = null;
let votdPoolCache = null;
let searchIndexCache = null;

/** List of all 114 surahs with metadata. Small file, fetched once and kept in memory. */
export async function getSurahs() {
  if (surahsCache) return surahsCache;
  const res = await fetch("/data/surahs.json");
  surahsCache = await res.json();
  return surahsCache;
}

/** Curated Verse-of-the-Day pool: verses chosen to make sense standalone. */
export async function getVotdPool() {
  if (votdPoolCache) return votdPoolCache;
  const res = await fetch("/data/votd-pool.json");
  votdPoolCache = await res.json();
  return votdPoolCache;
}

/** Lightweight index (verse key + surah name + English text) for search. */
export async function getSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const res = await fetch("/data/search-index.json");
  searchIndexCache = await res.json();
  return searchIndexCache;
}

/**
 * Full chapter (all verses, Arabic + translations). Checks IndexedDB first
 * so a chapter someone has already opened — or downloaded for offline use —
 * never needs a second network request.
 */
export async function getChapter(number) {
  const cached = await db.chapters.get(number);
  if (cached) return cached;

  const res = await fetch(`/data/chapters/${number}.json`);
  if (!res.ok) throw new Error(`Could not load chapter ${number}`);
  const chapter = await res.json();
  await db.chapters.put(chapter);
  return chapter;
}

/** Fetch a single verse by "surah:ayah" key, e.g. "2:255". */
export async function getVerse(verseKey) {
  const [surah, ayah] = verseKey.split(":").map(Number);
  const chapter = await getChapter(surah);
  const verse = chapter.verses.find((v) => v.ayah === ayah);
  if (!verse) throw new Error(`Verse ${verseKey} not found`);
  return { ...verse, surahName: chapter.nameTransliterated, surahNumber: surah };
}

export async function isChapterDownloaded(number) {
  return Boolean(await db.chapters.get(number));
}

export async function getDownloadedChapterCount() {
  return db.chapters.count();
}

/** Downloads every chapter for full offline reading. Reports progress via onProgress(done, total). */
export async function downloadAllChapters(onProgress) {
  const surahs = await getSurahs();
  let done = 0;
  for (const s of surahs) {
    await getChapter(s.number);
    done += 1;
    onProgress?.(done, surahs.length);
  }
}

export function randomVerseKey(surahs) {
  const surah = surahs[Math.floor(Math.random() * surahs.length)];
  const ayah = 1 + Math.floor(Math.random() * surah.versesCount);
  return `${surah.number}:${ayah}`;
}
