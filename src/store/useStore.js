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
  translationLang: "en",
  theme: "dark",
  fontScale: 1,
  favorites: [], // array of { verseKey, savedAt }
  trayOpen: false,
  bookmarksTrayOpen: false,
  hydrated: false,

  // Browse tab: "surah" | "juz"
  browseTab: "surah",

  // Named reading memories: [{ id, type, name, verseKey, surahNumber, ayah, savedAt }]
  bookmarks: [],

  // Recently opened surahs: [{ surahNumber, openedAt }]
  recentSurahs: [],

  // Daily Reading streak & habit metrics
  lastRead: null, // { surahNumber, surahName, ayahNumber, verseKey, updatedAt, totalVerses }
  streak: { currentStreak: 0, longestStreak: 0, todayVerses: 0 },
  weeklyActivity: [],
  dailyGoal: 10,

  translations: TRANSLATIONS,

  setView: (view, extra = {}) => set({ view, ...extra }),
  openSurah: (number) => set({ view: "reader", readerSurah: number }),
  openTray: () => set({ trayOpen: true }),
  closeTray: () => set({ trayOpen: false }),
  openBookmarksTray: () => set({ bookmarksTrayOpen: true }),
  closeBookmarksTray: () => set({ bookmarksTrayOpen: false }),
  setBrowseTab: (tab) => set({ browseTab: tab }),

  async hydrate() {
    const [
      favorites,
      theme,
      translationLang,
      fontScale,
      bookmarks,
      recentSurahs,
      lastRead,
      dailyGoal,
      readingLogs,
    ] = await Promise.all([
      db.favorites.orderBy("savedAt").reverse().toArray(),
      getSetting("theme", "dark"),
      getSetting("translationLang", "en"),
      getSetting("fontScale", 1),
      db.bookmarks.orderBy("savedAt").toArray(),
      db.recentSurahs.orderBy("openedAt").reverse().toArray(),
      getSetting("lastRead", null),
      getSetting("dailyGoal", 10),
      db.readingLogs ? db.readingLogs.toArray() : [],
    ]);

    const streak = calculateStreak(readingLogs);
    const weeklyActivity = get7DayActivity(readingLogs);

    document.documentElement.dataset.theme = theme;
    set({
      favorites,
      theme,
      translationLang,
      fontScale,
      bookmarks,
      recentSurahs,
      lastRead,
      dailyGoal,
      streak,
      weeklyActivity,
      hydrated: true,
    });
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

  // ---------- Reading Bookmarks ----------

  /** Set / update the single "main" reading position. Replaces any existing main bookmark. */
  async setMainBookmark(verseKey, surahNumber, ayah) {
    // Delete existing main bookmark(s)
    const existing = await db.bookmarks.where("type").equals("main").toArray();
    await Promise.all(existing.map((b) => db.bookmarks.delete(b.id)));
    await db.bookmarks.add({
      type: "main",
      name: "Main Reading",
      verseKey,
      surahNumber,
      ayah,
      savedAt: new Date().toISOString(),
    });
    const bookmarks = await db.bookmarks.orderBy("savedAt").toArray();
    set({ bookmarks });
  },

  /** Get the main bookmark (or null). */
  getMainBookmark: () => get().bookmarks.find((b) => b.type === "main") ?? null,

  /** Add a named study bookmark. Does NOT affect the main bookmark. */
  async addStudyBookmark(verseKey, surahNumber, ayah, surahName) {
    const name = `${surahName} ${surahNumber}:${ayah}`;
    await db.bookmarks.add({
      type: "study",
      name,
      verseKey,
      surahNumber,
      ayah,
      savedAt: new Date().toISOString(),
    });
    const bookmarks = await db.bookmarks.orderBy("savedAt").toArray();
    set({ bookmarks });
  },

  /** Remove a bookmark by id. */
  async removeBookmark(id) {
    await db.bookmarks.delete(id);
    const bookmarks = await db.bookmarks.orderBy("savedAt").toArray();
    set({ bookmarks });
  },

  /** Check whether a verse is bookmarked (any type). */
  isBookmarked: (verseKey) => get().bookmarks.some((b) => b.verseKey === verseKey),

  // ---------- Recent Surahs ----------

  /** Record that the user opened a surah. */
  async trackRecentSurah(surahNumber) {
    await db.recentSurahs.put({ surahNumber, openedAt: new Date().toISOString() });
    const recentSurahs = await db.recentSurahs.orderBy("openedAt").reverse().toArray();
    set({ recentSurahs });
  },

  // ---------- Reading Habits & Streak ----------

  /** Record a reading event when user views/reads an ayah */
  async recordReading(surahNumber, ayahNumber, surahName = null, totalVerses = null) {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const todayStr = getLocalDateString();

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

  async setDailyGoal(dailyGoal) {
    await setSetting("dailyGoal", dailyGoal);
    set({ dailyGoal });
  },

  // ---------- Settings ----------

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
}));
