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
    const [favorites, theme, translationLang, fontScale] = await Promise.all([
      db.favorites.orderBy("savedAt").reverse().toArray(),
      getSetting("theme", "dark"),
      getSetting("translationLang", "en"),
      getSetting("fontScale", 1),
    ]);
    document.documentElement.dataset.theme = theme;
    set({ favorites, theme, translationLang, fontScale, hydrated: true });
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
}));
