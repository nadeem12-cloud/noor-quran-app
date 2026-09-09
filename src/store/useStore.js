import { create } from "zustand";
import { db, getSetting, setSetting } from "../lib/db";

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
  hydrated: false,

  translations: TRANSLATIONS,

  setView: (view, extra = {}) => set({ view, ...extra }),
  openSurah: (number) => set({ view: "reader", readerSurah: number }),
  openTray: () => set({ trayOpen: true }),
  closeTray: () => set({ trayOpen: false }),

  async hydrate() {
    const [favorites, theme, translationLang, fontScale, savedReciter] = await Promise.all([
      db.favorites.orderBy("savedAt").reverse().toArray(),
      getSetting("theme", "dark"),
      getSetting("translationLang", "en"),
      getSetting("fontScale", 1),
      getSetting("reciter", "Alafasy_128kbps"),
    ]);
    const { RECITERS, DEFAULT_RECITER } = await import("../lib/audio");
    const reciter = RECITERS.some((r) => r.id === savedReciter) ? savedReciter : DEFAULT_RECITER;
    document.documentElement.dataset.theme = theme;
    set({ favorites, theme, translationLang, fontScale, reciter, hydrated: true });
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
  // playerVerseKey: "surah:ayah" of the track currently loaded in the player.
  // isPlaying: whether the audio element should be playing right now.
  // reciter: everyayah.com reciter ID string.
  playerVerseKey: null,
  isPlaying: false,
  reciter: "Alafasy_128kbps",

  /** Start playing a verse (loads it if different from current). */
  playVerse(verseKey) {
    const { playerVerseKey } = get();
    if (playerVerseKey === verseKey) {
      // Same track — just resume
      set({ isPlaying: true });
    } else {
      set({ playerVerseKey: verseKey, isPlaying: true });
    }
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
      set({ playerVerseKey: `${surah}:${ayah + 1}`, isPlaying: true });
    } else if (surah < 114) {
      set({ playerVerseKey: `${surah + 1}:1`, isPlaying: true });
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
    // Reload same verse with new reciter
    const { playerVerseKey } = get();
    set({ reciter: id });
    if (playerVerseKey) {
      // Force audio src reload by briefly stopping and restarting
      set({ isPlaying: false });
      setTimeout(() => set({ isPlaying: true }), 80);
    }
  },
}));
