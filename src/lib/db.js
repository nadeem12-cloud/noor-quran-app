import Dexie from "dexie";

// Local-first storage. Everything here lives on-device — there is no
// account/sync layer in this MVP (see README for how to add one).
export const db = new Dexie("noor-quran-app");

db.version(1).stores({
  favorites: "verseKey, savedAt",
  chapters: "number", // cached full chapter JSON, keyed by surah number
  settings: "key",
});

// v2 — adds reading bookmark slots and recent-surah tracking
db.version(2).stores({
  favorites: "verseKey, savedAt",
  chapters: "number",
  settings: "key",
  bookmarks: "++id, type, savedAt", // { id, type:"main"|"study", name, verseKey, surahNumber, ayah, savedAt }
  recentSurahs: "surahNumber, openedAt", // { surahNumber, openedAt }
});

// v3 — adds daily reading logs for streak tracking
db.version(3).stores({
  favorites: "verseKey, savedAt",
  chapters: "number",
  settings: "key",
  bookmarks: "++id, type, savedAt",
  recentSurahs: "surahNumber, openedAt",
  readingLogs: "date", // keyed by YYYY-MM-DD: { date, count, verses: [] }
});

export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
