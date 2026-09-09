import Dexie from "dexie";

// Local-first storage. Everything here lives on-device — there is no
// account/sync layer in this MVP (see README for how to add one).
export const db = new Dexie("noor-quran-app");

db.version(1).stores({
  favorites: "verseKey, savedAt",
  chapters: "number", // cached full chapter JSON, keyed by surah number
  settings: "key",
});

export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
