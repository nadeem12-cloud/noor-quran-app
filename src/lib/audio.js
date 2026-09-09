/**
 * Audio helpers for Quran recitation.
 * Audio served from everyayah.com — a free, open CDN for Quran MP3s.
 * URL format: https://everyayah.com/data/{reciterId}/{surah3}{ayah3}.mp3
 */

export const RECITERS = [
  {
    id: "Alafasy_128kbps",
    label: "Mishary Al-Afasy",
    arabicLabel: "مشاري العفاسي",
    style: "Hafs — Murattal",
  },
  {
    id: "Abdul_Basit_Murattal_192kbps",
    label: "Abdul Basit (Murattal)",
    arabicLabel: "عبد الباسط عبد الصمد",
    style: "Hafs — Murattal",
  },
  {
    id: "Minshawy_Murattal_128kbps",
    label: "Mohamed Al-Minshawi",
    arabicLabel: "محمد صديق المنشاوي",
    style: "Hafs — Murattal",
  },
  {
    id: "Husary_128kbps",
    label: "Mahmoud Al-Husary",
    arabicLabel: "محمود خليل الحصري",
    style: "Hafs — Murattal",
  },
  {
    id: "MaherAlMuaiqly128kbps",
    label: "Maher Al-Muaiqly",
    arabicLabel: "ماهر المعيقلي",
    style: "Hafs — Murattal",
  },
  {
    id: "Abu_Bakr_Ash-Shaatree_128kbps",
    label: "Abu Bakr Al-Shatri",
    arabicLabel: "أبو بكر الشاطري",
    style: "Hafs — Murattal",
  },
  {
    id: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    label: "Ahmed Al-Ajamy",
    arabicLabel: "أحمد بن علي العجمي",
    style: "Hafs — Murattal",
  },
  {
    id: "Hudhaify_128kbps",
    label: "Ali Al-Hudhaify",
    arabicLabel: "علي بن عبد الرحمن الحذيفي",
    style: "Hafs — Murattal",
  },
];

export const DEFAULT_RECITER = RECITERS[0].id; // "Alafasy_128kbps"

/**
 * Build the MP3 URL for a specific verse.
 * @param {string} reciterId - One of the ids from RECITERS
 * @param {number} surahNumber - 1–114
 * @param {number} ayah - 1–n
 */
export function getAudioUrl(reciterId, surahNumber, ayah) {
  // Fallback to default if reciterId is invalid or old
  const validId = RECITERS.some((r) => r.id === reciterId) ? reciterId : DEFAULT_RECITER;
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${validId}/${s}${a}.mp3`;
}
