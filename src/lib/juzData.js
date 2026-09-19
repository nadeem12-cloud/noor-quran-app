/**
 * Static Juz (Para) data — 30 divisions of the Quran.
 * startVerseKey: the first verse of the juz (used to open reader at that point).
 * surahStart / surahEnd: surah numbers that this juz spans (inclusive).
 * nameArabic: traditional name of the juz (the opening Arabic word).
 */
export const JUZ_DATA = [
  { number: 1,  nameArabic: "الم",            surahStart: 1,   surahEnd: 2,   startSurah: 1,   startAyah: 1,   endSurah: 2,   endAyah: 141 },
  { number: 2,  nameArabic: "سَيَقُولُ",       surahStart: 2,   surahEnd: 2,   startSurah: 2,   startAyah: 142, endSurah: 2,   endAyah: 252 },
  { number: 3,  nameArabic: "تِلْكَ الرُّسُلُ", surahStart: 2,   surahEnd: 3,   startSurah: 2,   startAyah: 253, endSurah: 3,   endAyah: 91  },
  { number: 4,  nameArabic: "لَن تَنَالُوا",   surahStart: 3,   surahEnd: 4,   startSurah: 3,   startAyah: 92,  endSurah: 4,   endAyah: 23  },
  { number: 5,  nameArabic: "وَالْمُحْصَنَاتُ", surahStart: 4,   surahEnd: 4,   startSurah: 4,   startAyah: 24,  endSurah: 4,   endAyah: 147 },
  { number: 6,  nameArabic: "لَا يُحِبُّ",     surahStart: 4,   surahEnd: 5,   startSurah: 4,   startAyah: 148, endSurah: 5,   endAyah: 81  },
  { number: 7,  nameArabic: "وَإِذَا سَمِعُوا", surahStart: 5,   surahEnd: 6,   startSurah: 5,   startAyah: 82,  endSurah: 6,   endAyah: 110 },
  { number: 8,  nameArabic: "وَلَوْ أَنَّنَا",  surahStart: 6,   surahEnd: 7,   startSurah: 6,   startAyah: 111, endSurah: 7,   endAyah: 87  },
  { number: 9,  nameArabic: "قَالَ الْمَلَأُ",  surahStart: 7,   surahEnd: 8,   startSurah: 7,   startAyah: 88,  endSurah: 8,   endAyah: 40  },
  { number: 10, nameArabic: "وَاعْلَمُوا",      surahStart: 8,   surahEnd: 9,   startSurah: 8,   startAyah: 41,  endSurah: 9,   endAyah: 92  },
  { number: 11, nameArabic: "يَعْتَذِرُونَ",    surahStart: 9,   surahEnd: 11,  startSurah: 9,   startAyah: 93,  endSurah: 11,  endAyah: 5   },
  { number: 12, nameArabic: "وَمَا مِن دَابَّةٍ", surahStart: 11,  surahEnd: 12,  startSurah: 11,  startAyah: 6,   endSurah: 12,  endAyah: 52  },
  { number: 13, nameArabic: "وَمَا أُبَرِّئُ",  surahStart: 12,  surahEnd: 14,  startSurah: 12,  startAyah: 53,  endSurah: 14,  endAyah: 52  },
  { number: 14, nameArabic: "رُبَمَا",          surahStart: 15,  surahEnd: 16,  startSurah: 15,  startAyah: 1,   endSurah: 16,  endAyah: 128 },
  { number: 15, nameArabic: "سُبْحَانَ",        surahStart: 17,  surahEnd: 18,  startSurah: 17,  startAyah: 1,   endSurah: 18,  endAyah: 74  },
  { number: 16, nameArabic: "قَالَ أَلَمْ",     surahStart: 18,  surahEnd: 20,  startSurah: 18,  startAyah: 75,  endSurah: 20,  endAyah: 135 },
  { number: 17, nameArabic: "اقْتَرَبَ",        surahStart: 21,  surahEnd: 22,  startSurah: 21,  startAyah: 1,   endSurah: 22,  endAyah: 78  },
  { number: 18, nameArabic: "قَدْ أَفْلَحَ",    surahStart: 23,  surahEnd: 25,  startSurah: 23,  startAyah: 1,   endSurah: 25,  endAyah: 20  },
  { number: 19, nameArabic: "وَقَالَ الَّذِينَ", surahStart: 25,  surahEnd: 27,  startSurah: 25,  startAyah: 21,  endSurah: 27,  endAyah: 55  },
  { number: 20, nameArabic: "أَمَّنْ خَلَقَ",   surahStart: 27,  surahEnd: 29,  startSurah: 27,  startAyah: 56,  endSurah: 29,  endAyah: 45  },
  { number: 21, nameArabic: "اتْلُ مَا أُوحِيَ", surahStart: 29,  surahEnd: 33,  startSurah: 29,  startAyah: 46,  endSurah: 33,  endAyah: 30  },
  { number: 22, nameArabic: "وَمَن يَقْنُتْ",   surahStart: 33,  surahEnd: 36,  startSurah: 33,  startAyah: 31,  endSurah: 36,  endAyah: 27  },
  { number: 23, nameArabic: "وَمَا لِيَ",       surahStart: 36,  surahEnd: 39,  startSurah: 36,  startAyah: 28,  endSurah: 39,  endAyah: 31  },
  { number: 24, nameArabic: "فَمَنْ أَظْلَمُ",  surahStart: 39,  surahEnd: 41,  startSurah: 39,  startAyah: 32,  endSurah: 41,  endAyah: 46  },
  { number: 25, nameArabic: "إِلَيْهِ يُرَدُّ", surahStart: 41,  surahEnd: 45,  startSurah: 41,  startAyah: 47,  endSurah: 45,  endAyah: 37  },
  { number: 26, nameArabic: "حم",               surahStart: 46,  surahEnd: 51,  startSurah: 46,  startAyah: 1,   endSurah: 51,  endAyah: 30  },
  { number: 27, nameArabic: "قَالَ فَمَا",       surahStart: 51,  surahEnd: 57,  startSurah: 51,  startAyah: 31,  endSurah: 57,  endAyah: 29  },
  { number: 28, nameArabic: "قَدْ سَمِعَ",       surahStart: 58,  surahEnd: 66,  startSurah: 58,  startAyah: 1,   endSurah: 66,  endAyah: 12  },
  { number: 29, nameArabic: "تَبَارَكَ",         surahStart: 67,  surahEnd: 77,  startSurah: 67,  startAyah: 1,   endSurah: 77,  endAyah: 50  },
  { number: 30, nameArabic: "عَمَّ",             surahStart: 78,  surahEnd: 114, startSurah: 78,  startAyah: 1,   endSurah: 114, endAyah: 6   },
];

/** Curated "Frequently Read" surahs (pinned chips in browse view). */
export const FREQUENTLY_READ_SURAHS = [1, 18, 36, 55, 56, 67, 112, 113, 114, 2];

/** Curated "Frequently Read" verses — famous standalone ayat. */
export const FREQUENTLY_READ_VERSES = [
  { verseKey: "2:255", label: "Ayatul Kursi" },
  { verseKey: "2:285", label: "Āmanar-Rasūl" },
  { verseKey: "2:286", label: "Lā Yukallifullāh" },
  { verseKey: "1:1",   label: "Al-Fatihah opening" },
  { verseKey: "3:18",  label: "Shahida Allahu" },
  { verseKey: "59:22", label: "Huwa Allahu alladhi" },
];
