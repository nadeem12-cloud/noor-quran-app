import { create } from "zustand";
import { db, getSetting, setSetting } from "../lib/db";
import { calculateStreak, get7DayActivity, getLocalDateString } from "../lib/readingTracker";

const TRANSLATIONS = [
  { lang: "en", label: "English — Saheeh International" },
  { lang: "ur", label: "اردو — Fateh Muhammad Jalandhari" },
];

export const useStore = create((set, get) => ({
  view: "home", // home | browse | reader | search | settings
  readerSurah: null, // surah number currently open in the reader
  targetAyah: null, // ayah number to scroll to when opening reader
  translationLang: "en",
  theme: "dark",
  fontScale: 1,
  favorites: [], // array of { verseKey, savedAt }
  trayOpen: false,
  hydrated: false,

  translations: TRANSLATIONS,

  // ── Reading progress & streak ────────────────────────────────
  lastRead: null, // { surahNumber, surahName, ayahNumber, verseKey, updatedAt, totalVerses }
  streak: { currentStreak: 0, longestStreak: 0, todayVerses: 0 },
  weeklyActivity: [],
  dailyGoal: 10,

  setView: (view, extra = {}) => set({ view, ...extra }),
  openSurah: (number, targetAyah = null) =>
    set({ view: "reader", readerSurah: number, targetAyah }),
  openTray: () => set({ trayOpen: true }),
  closeTray: () => set({ trayOpen: false }),

  async hydrate() {
    const [
      favorites,
      theme,
      translationLang,
      fontScale,
      savedReciter,
      lastRead,
      dailyGoal,
      readingLogs,
    ] = await Promise.all([
      db.favorites.orderBy("savedAt").reverse().toArray(),
      getSetting("theme", "dark"),
      getSetting("translationLang", "en"),
      getSetting("fontScale", 1),
      getSetting("reciter", "Alafasy_128kbps"),
      getSetting("lastRead", null),
      getSetting("dailyGoal", 10),
      db.readingLogs ? db.readingLogs.toArray() : [],
    ]);

    const { RECITERS, DEFAULT_RECITER } = await import("../lib/audio");
    const reciter = RECITERS.some((r) => r.id === savedReciter) ? savedReciter : DEFAULT_RECITER;
    const streak = calculateStreak(readingLogs);
    const weeklyActivity = get7DayActivity(readingLogs);

    document.documentElement.dataset.theme = theme;
    set({
      favorites,
      theme,
      translationLang,
      fontScale,
      reciter,
      lastRead,
      dailyGoal,
      streak,
      weeklyActivity,
      hydrated: true,
    });
  },

  /** Record a reading event when user views or plays a verse */
  async recordReading(surahNumber, ayahNumber, surahName = null, totalVerses = null) {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const todayStr = getLocalDateString();

    // 1. Update lastRead
    let currentLastRead = get().lastRead;
    if (!surahName && currentLastRead?.surahNumber === surahNumber) {
      surahName = currentLastRead.surahName;
      totalVerses = currentLastRead.totalVerses;
    }

    const newLastRead = {
      surahNumber,
      surahName: surahName || currentLastRead?.surahName || `Surah ${surahNumber}`,
      ayahNumber,
      verseKey,
      totalVerses: totalVerses || currentLastRead?.totalVerses || 7,
      updatedAt: new Date().toISOString(),
    };

    set({ lastRead: newLastRead });
    await setSetting("lastRead", newLastRead);

    // 2. Log to Dexie readingLogs
    try {
      if (db.readingLogs) {
        const existing = await db.readingLogs.get(todayStr);
        const versesSet = new Set(existing?.verses || []);
        const alreadyCounted = versesSet.has(verseKey);
        versesSet.add(verseKey);

        const count = versesSet.size;
        await db.readingLogs.put({
          date: todayStr,
          count,
          verses: Array.from(versesSet),
        });

        // Recalculate streak & weekly activity if new verse read
        if (!alreadyCounted) {
          const allLogs = await db.readingLogs.toArray();
          const streak = calculateStreak(allLogs);
          const weeklyActivity = get7DayActivity(allLogs);
          set({ streak, weeklyActivity });
        }
      }
    } catch (err) {
      console.warn("Error recording reading log:", err);
    }
  },

  /** Resume reading from last saved position */
  resumeReading() {
    const { lastRead } = get();
    if (lastRead) {
      set({
        view: "reader",
        readerSurah: lastRead.surahNumber,
        targetAyah: lastRead.ayahNumber,
      });
    }
  },

  async toggleFavorite(verseKey) {
    const exists = await db.favorites.get(verseKey);
    if (exists) {
      await db.favorites.delete(verseKey);
    } else {
      await db.favorites.add({ verseKey, savedAt: new Date().toISOString() });
    }
    const favorites = await db.favorites.orderBy("savedAt").reverse().toArray();
    set({ favorites });
  },

  isFavorite: (verseKey) => get().favorites.some((f) => f.verseKey === verseKey),

  async setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    await setSetting("theme", theme);
    set({ theme });
  },

  async setTranslationLang(lang) {
    await setSetting("translationLang", lang);
    set({ translationLang: lang });
  },

  async setFontScale(scale) {
    await setSetting("fontScale", scale);
    set({ fontScale: scale });
  },

  // ── Audio player ──────────────────────────────────────────────
  playerVerseKey: null,
  isPlaying: false,
  reciter: "Alafasy_128kbps",

  /** Start playing a verse (loads it if different from current). */
  playVerse(verseKey) {
    const { playerVerseKey } = get();
    if (playerVerseKey === verseKey) {
      set({ isPlaying: true });
    } else {
      set({ playerVerseKey: verseKey, isPlaying: true });
    }
    // Also record as read
    const [surah, ayah] = verseKey.split(":").map(Number);
    get().recordReading(surah, ayah);
  },

  pauseAudio() {
    set({ isPlaying: false });
  },

  resumeAudio() {
    set({ isPlaying: true });
  },

  stopAudio() {
    set({ playerVerseKey: null, isPlaying: false });
  },

  /** Advance to the next ayah, or the first ayah of the next surah. */
  async nextVerse() {
    const { playerVerseKey } = get();
    if (!playerVerseKey) return;
    const [surah, ayah] = playerVerseKey.split(":").map(Number);
    const { getSurahs } = await import("../lib/quranData");
    const surahs = await getSurahs();
    const surahData = surahs.find((s) => s.number === surah);
    if (!surahData) return;
    if (ayah < surahData.versesCount) {
      const nextKey = `${surah}:${ayah + 1}`;
      set({ playerVerseKey: nextKey, isPlaying: true });
      get().recordReading(surah, ayah + 1, surahData.nameTransliterated, surahData.versesCount);
    } else if (surah < 114) {
      const nextKey = `${surah + 1}:1`;
      const nextSurah = surahs.find((s) => s.number === surah + 1);
      set({ playerVerseKey: nextKey, isPlaying: true });
      get().recordReading(surah + 1, 1, nextSurah?.nameTransliterated, nextSurah?.versesCount);
    } else {
      // End of Quran
      set({ isPlaying: false });
    }
  },

  /** Go back to the previous ayah, or the last ayah of the previous surah. */
  async prevVerse() {
    const { playerVerseKey } = get();
    if (!playerVerseKey) return;
    const [surah, ayah] = playerVerseKey.split(":").map(Number);
    const { getSurahs } = await import("../lib/quranData");
    const surahs = await getSurahs();
    if (ayah > 1) {
      set({ playerVerseKey: `${surah}:${ayah - 1}`, isPlaying: true });
    } else if (surah > 1) {
      const prevSurah = surahs.find((s) => s.number === surah - 1);
      if (prevSurah) {
        set({ playerVerseKey: `${surah - 1}:${prevSurah.versesCount}`, isPlaying: true });
      }
    }
  },

  async setReciter(id) {
    await setSetting("reciter", id);
    const { playerVerseKey } = get();
    set({ reciter: id });
    if (playerVerseKey) {
      set({ isPlaying: false });
      setTimeout(() => set({ isPlaying: true }), 80);
    }
  },
}));
