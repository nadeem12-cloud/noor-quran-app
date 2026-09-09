import { useEffect } from "react";
import { useStore } from "./store/useStore";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Home from "./components/Home";
import SurahList from "./components/SurahList";
import VerseViewer from "./components/VerseViewer";
import SearchView from "./components/SearchView";
import Settings from "./components/Settings";
import FavoritesTray from "./components/FavoritesTray";

export default function App() {
  const hydrated = useStore((s) => s.hydrated);
  const hydrate = useStore((s) => s.hydrate);
  const view = useStore((s) => s.view);
  const readerSurah = useStore((s) => s.readerSurah);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        {view === "home" && <Home />}
        {view === "browse" && <SurahList />}
        {view === "reader" && readerSurah && <VerseViewer surahNumber={readerSurah} />}
        {view === "search" && <SearchView />}
        {view === "settings" && <Settings />}
      </main>
      <BottomNav />
      <FavoritesTray />
    </div>
  );
}
