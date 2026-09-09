import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, X, Loader, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { getAudioUrl, RECITERS } from "../lib/audio";
import { getVerse } from "../lib/quranData";

/**
 * AudioPlayer — sticky mini player that sits just above the bottom nav
 * when a verse is loaded. Manages the single global <audio> element.
 */
export default function AudioPlayer() {
  const playerVerseKey = useStore((s) => s.playerVerseKey);
  const isPlaying = useStore((s) => s.isPlaying);
  const reciter = useStore((s) => s.reciter);
  const pauseAudio = useStore((s) => s.pauseAudio);
  const resumeAudio = useStore((s) => s.resumeAudio);
  const stopAudio = useStore((s) => s.stopAudio);
  const nextVerse = useStore((s) => s.nextVerse);
  const prevVerse = useStore((s) => s.prevVerse);

  const audioRef = useRef(null);
  const [verseInfo, setVerseInfo] = useState(null);
  const [buffering, setBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load verse metadata whenever the playing verse changes
  useEffect(() => {
    if (!playerVerseKey) {
      setVerseInfo(null);
      return;
    }
    let cancelled = false;
    getVerse(playerVerseKey)
      .then((v) => {
        if (!cancelled) setVerseInfo(v);
      })
      .catch(() => {
        if (!cancelled) setVerseInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [playerVerseKey]);

  // Sync audio src whenever the verse or reciter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!playerVerseKey) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }

    const [surah, ayah] = playerVerseKey.split(":").map(Number);
    const url = getAudioUrl(reciter, surah, ayah);

    setHasError(false);
    setBuffering(true);

    audio.src = url;
    audio.load();

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setBuffering(false);
          })
          .catch((err) => {
            console.warn("Audio playback interrupted or blocked:", err);
            // If autoplay was blocked, don't show error immediately unless persistent
          });
      }
    }
  }, [playerVerseKey, reciter]);

  // Handle play / pause toggle from store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playerVerseKey) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setBuffering(false))
          .catch((err) => {
            console.warn("Audio play failed:", err);
          });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleEnded = () => {
    nextVerse();
  };

  const handleCanPlay = () => setBuffering(false);
  const handleWaiting = () => setBuffering(true);
  const handlePlaying = () => setBuffering(false);
  const handleError = (e) => {
    console.error("Audio error event:", e);
    setBuffering(false);
    setHasError(true);
  };

  const reciterObj = RECITERS.find((r) => r.id === reciter) || RECITERS[0];
  const reciterLabel = reciterObj?.label ?? "Mishary Al-Afasy";
  const surahName = verseInfo?.surahName ?? "…";

  return (
    <>
      {/* Permanent hidden audio engine */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        preload="auto"
      />

      {/* Visual player bar (rendered only when an active verse is loaded) */}
      {playerVerseKey && (
        <div className="audio-player" role="region" aria-label="Audio player">
          {/* Waveform decoration */}
          <div className="audio-waveform" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={`audio-bar ${isPlaying && !buffering && !hasError ? "audio-bar--active" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              />
            ))}
          </div>

          {/* Verse info */}
          <div className="audio-info">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="audio-verse-key">{playerVerseKey}</span>
              {hasError && (
                <span title="Audio stream error" style={{ color: "#ef4444", display: "inline-flex" }}>
                  <AlertCircle size={13} />
                </span>
              )}
            </div>
            <span className="audio-surah-name">{surahName}</span>
            <span className="audio-reciter">{reciterLabel}</span>
          </div>

          {/* Controls */}
          <div className="audio-controls">
            <button
              className="audio-ctrl-btn"
              onClick={prevVerse}
              aria-label="Previous verse"
            >
              <SkipBack size={16} />
            </button>

            <button
              className="audio-play-btn"
              onClick={isPlaying ? pauseAudio : resumeAudio}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {buffering ? (
                <Loader size={18} className="audio-spinner" />
              ) : isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
            </button>

            <button
              className="audio-ctrl-btn"
              onClick={nextVerse}
              aria-label="Next verse"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Close */}
          <button
            className="audio-close-btn"
            onClick={stopAudio}
            aria-label="Stop and close player"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
