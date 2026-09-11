import Dexie from "dexie";

// Local-first storage. Everything here lives on-device.
export const db = new Dexie("noor-quran-app");

db.version(1).stores({
  favorites: "verseKey, savedAt",
  chapters: "number", // cached full chapter JSON, keyed by surah number
  settings: "key",
});

db.version(2).stores({
  favorites: "verseKey, savedAt",
  chapters: "number",
  settings: "key",
  readingLogs: "date", // keyed by YYYY-MM-DD: { date, count, verses: [] }
});

export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
