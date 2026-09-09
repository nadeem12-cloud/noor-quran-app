import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { downloadAllChapters, getDownloadedChapterCount, getSurahs } from "../lib/quranData";
import { RECITERS } from "../lib/audio";

export default function Settings() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const translationLang = useStore((s) => s.translationLang);
  const setTranslationLang = useStore((s) => s.setTranslationLang);
  const translations = useStore((s) => s.translations);
  const fontScale = useStore((s) => s.fontScale);
  const setFontScale = useStore((s) => s.setFontScale);
  const reciter = useStore((s) => s.reciter);
  const setReciter = useStore((s) => s.setReciter);

  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(114);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getDownloadedChapterCount().then(setDownloaded);
    getSurahs().then((s) => setTotal(s.length));
  }, []);

  const handleDownloadAll = async () => {
    setDownloading(true);
    await downloadAllChapters((done) => setDownloaded(done));
    setDownloading(false);
  };

  return (
    <div>
      <h2 className="section-title">Settings</h2>

      <div className="settings-group">
        <div className="settings-row">
          <div>
            <div className="settings-label">Appearance</div>
            <div className="settings-hint">Dark reads well at night; light suits daytime reading.</div>
          </div>
          <div className="segmented">
            <button className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")}>
              Dark
            </button>
            <button className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")}>
              Light
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Text size</div>
            <div className="settings-hint">Applies to Arabic and translation text.</div>
          </div>
          <div className="segmented">
            <button className={fontScale === 0.9 ? "is-active" : ""} onClick={() => setFontScale(0.9)}>
              A
            </button>
            <button className={fontScale === 1 ? "is-active" : ""} onClick={() => setFontScale(1)}>
              A
            </button>
            <button className={fontScale === 1.25 ? "is-active" : ""} onClick={() => setFontScale(1.25)}>
              A
            </button>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label" style={{ marginBottom: 10 }}>
          Translation
        </div>
        {translations.map((t) => (
          <button
            key={t.lang}
            className="surah-row"
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setTranslationLang(t.lang)}
          >
            <span className="surah-info" style={{ margin: 0 }}>
              {t.label}
            </span>
            {translationLang === t.lang && <span style={{ color: "var(--accent)" }}>✓</span>}
          </button>
        ))}
      </div>

      {/* ── Reciter picker ── */}
      <div className="settings-group">
        <div className="settings-label" style={{ marginBottom: 4 }}>
          Reciter
        </div>
        <div className="settings-hint" style={{ marginBottom: 12 }}>
          Audio served via everyayah.com — requires internet for first play.
        </div>
        {RECITERS.map((r) => (
          <button
            key={r.id}
            className="surah-row reciter-row"
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setReciter(r.id)}
          >
            <span className="surah-info" style={{ margin: 0 }}>
              <span className="surah-name-translit" style={{ fontSize: "0.94rem" }}>
                {r.label}
              </span>
              <span className="surah-name-meta">{r.style}</span>
            </span>
            <span className="reciter-arabic">{r.arabicLabel}</span>
            {reciter === r.id && (
              <span style={{ color: "var(--accent)", marginLeft: 10 }}>✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="settings-group">
        <div className="settings-row" style={{ borderBottom: "none", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div className="settings-label">Offline reading</div>
            <div className="settings-hint">
              {downloaded >= total
                ? "The full Quran is saved on this device."
                : `${downloaded} of ${total} surahs saved on this device.`}
            </div>
            {downloading && (
              <div className="download-progress">
                <div className="download-progress-bar" style={{ width: `${(downloaded / total) * 100}%` }} />
              </div>
            )}
          </div>
          {downloaded < total && (
            <button className="btn btn-ghost" onClick={handleDownloadAll} disabled={downloading}>
              {downloading ? "Saving…" : "Save all"}
            </button>
          )}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label" style={{ marginBottom: 8 }}>
          About the text
        </div>
        <p className="settings-hint" style={{ lineHeight: 1.6 }}>
          Arabic text (Uthmani script) via The Noble Qur'an Encyclopedia. Transliteration via the
          Tanzil Project (tanzil.net). English and Urdu translations via quranenc.com, packaged by
          the open-source <em>quran-json</em> project (CC BY-4.0). Audio via everyayah.com. Daily
          context notes are editorial summaries written for this app — please verify against a
          qualified scholar before relying on them for religious rulings.
        </p>
      </div>
    </div>
  );
}
