import {
  BookOpen,
  Cards,
  ChartBar,
  CaretDown,
  DownloadSimple,
  GearSix,
  House,
  List,
  MagnifyingGlass,
  Plus,
  Sparkle,
  Star,
  WifiHigh,
  WifiSlash,
  X,
  UsersThree,
} from "@phosphor-icons/react";
import {
  Component,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import { PwaUpdates } from "./components/PwaUpdates";
import { useStore } from "./lib/storage";
import { Dashboard, modes } from "./components/Dashboard";
import {
  Favorites,
  Library,
  Lesson,
  PracticePicker,
  SubjectPage,
} from "./components/Learning";
import { ImportPage, ProgressPage, Settings } from "./components/Manage";
import { Study } from "./components/Study";
import { Classroom } from "./components/Classroom";
import { AndroidUpdates } from "./components/AndroidUpdates";
import { EmptyState, go, Toast } from "./components/UI";
function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return route;
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Mémora", error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <div className="fatal-error">
        <h1>Un petit contretemps.</h1>
        <p>
          Tes données enregistrées sont conservées. Recharge l’application pour
          reprendre.
        </p>
        <button className="button primary" onClick={() => location.reload()}>
          Recharger
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
function AppContent() {
  const store = useStore();
  const route = useRoute();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(""),
    [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<
    | (Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      })
    | null
  >(null);
  useEffect(() => {
    setMenu(false);
  }, [route]);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    const prompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as typeof installPrompt);
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", prompt);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", prompt);
    };
  }, []);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = NativeApp.addListener("backButton", () => {
      if (window.location.hash && window.location.hash !== "#/")
        window.history.back();
      else NativeApp.exitApp();
    });
    return () => {
      void listener.then((l) => l.remove());
    };
  }, []);
  const [kind, param, scope] = route.split("?")[0].split("/").filter(Boolean);
  const subject = store.catalog.subjects.find((s) => s.id === param);
  const chapterSubject = store.catalog.subjects.find((s) =>
    s.chapters.some((c) => c.id === param),
  );
  const chapter = chapterSubject?.chapters.find((c) => c.id === param);
  const navItems = [
    { path: "/", label: "Vue d’ensemble", icon: House },
    { path: "/library", label: "Mes matières", icon: BookOpen },
    { path: "/classroom", label: "Le salon Mimo", icon: UsersThree },
    { path: "/favorites", label: "Mes favoris", icon: Star },
    { path: "/progress", label: "Ma progression", icon: ChartBar },
  ];
  const currentTitle = !kind
    ? "Mon espace"
    : kind === "library" || kind === "subject" || kind === "learn"
      ? "Mes matières"
      : kind === "classroom"
        ? "Le salon Mimo"
        : kind === "settings"
          ? "Réglages"
          : kind === "import"
            ? "Ajouter un cours"
            : kind === "progress"
              ? "Ma progression"
              : kind === "favorites"
                ? "Mes favoris"
                : "Entraînement";
  let page: ReactNode;
  if (!kind) page = <Dashboard store={store} />;
  else if (kind === "library")
    page = (
      <Library
        store={store}
        search={new URLSearchParams(route.split("?")[1]).get("q") || ""}
      />
    );
  else if (kind === "subject" && subject)
    page = <SubjectPage store={store} subject={subject} />;
  else if (kind === "learn" && chapter && chapterSubject)
    page = <Lesson store={store} subject={chapterSubject} chapter={chapter} />;
  else if (kind === "practice")
    page = <PracticePicker store={store} mode={param} />;
  else if (kind === "study")
    page = (
      <Study
        key={`${param}-${scope}`}
        store={store}
        mode={param}
        scope={scope}
      />
    );
  else if (kind === "favorites") page = <Favorites store={store} />;
  else if (kind === "classroom") page = <Classroom store={store} />;
  else if (kind === "progress") page = <ProgressPage store={store} />;
  else if (kind === "settings") page = <Settings store={store} />;
  else if (kind === "import") page = <ImportPage store={store} />;
  else
    page = (
      <EmptyState
        title="Cette page s’est égarée."
        action={
          <a className="button primary" href="#/">
            Revenir à l’accueil
          </a>
        }
      >
        Retrouve tes cours depuis la bibliothèque.
      </EmptyState>
    );
  return (
    <div className="app-shell">
      <AndroidUpdates
        repository={
          store.progress.repository || "FediMechergui/memorycardsrevision"
        }
      />
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Aller au contenu
      </a>
      {menu && (
        <button
          className="sidebar-scrim"
          onClick={() => setMenu(false)}
          aria-label="Fermer le menu"
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a className="brand" href="#/">
          <span className="brand-icon">
            m<span />
          </span>
          <span>
            mémora<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-icon">
            <Sparkle size={19} weight="fill" />
          </span>
          <div>
            <b>Mon espace de révision</b>
            <small>Master · Expert réseaux</small>
          </div>
        </div>
        <span className="nav-section-label">MON APPRENTISSAGE</span>
        <nav aria-label="Navigation principale">
          {navItems.map((n) => (
            <a
              className={`nav-link ${route === n.path || route.startsWith(n.path + "?") ? "active" : ""}`}
              href={`#${n.path}`}
              key={n.path}
              aria-current={route === n.path ? "page" : undefined}
            >
              <n.icon
                size={21}
                weight={route === n.path ? "fill" : "regular"}
              />
              {n.label}
              {n.path === "/favorites" &&
                store.progress.favorites.length > 0 && (
                  <span className="nav-count">
                    {store.progress.favorites.length}
                  </span>
                )}
            </a>
          ))}
        </nav>
        <span className="nav-section-label practice-label">À TOI DE JOUER</span>
        <nav aria-label="Modes de révision">
          {modes.map((m) => (
            <a
              className={`nav-link ${param === m.id ? "active" : ""}`}
              href={`#/practice/${m.id}`}
              key={m.id}
            >
              <m.icon size={21} />
              {m.title}
              {m.id === "flashcards" && <span className="new-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-graphic">
              <Cards size={25} />
            </span>
            <h3>Tes cours, ta méthode.</h3>
            <p>Un nouveau cours ? Fais grandir ta bibliothèque.</p>
            <a href="#/import">
              <Plus size={16} />
              Ajouter un cours
            </a>
          </div>
          <a
            className={`nav-link ${kind === "settings" ? "active" : ""}`}
            href="#/settings"
          >
            <GearSix size={21} />
            Réglages
          </a>
          <div className="sidebar-footer">
            <span className="tiny-dot" />
            Un peu mieux chaque jour.
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Ouvrir le menu"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              <List size={24} />
            </button>
            <span className="breadcrumb">
              Mon espace<span>/</span>
              <b>
                {currentTitle === "Mon espace"
                  ? "Vue d’ensemble"
                  : currentTitle}
              </b>
            </span>
          </div>
          <div className="topbar-right">
            <form
              className="top-search"
              onSubmit={(e) => {
                e.preventDefault();
                go(`/library?q=${encodeURIComponent(search)}`);
              }}
            >
              <MagnifyingGlass size={17} />
              <input
                aria-label="Rechercher dans les cours"
                placeholder="Rechercher un cours…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <span
              className={`connection-status ${online ? "" : "offline"}`}
              title={online ? "Connexion disponible" : "Mode hors connexion"}
            >
              {online ? <WifiHigh size={17} /> : <WifiSlash size={17} />}
            </span>
            <a href="#/settings" className="avatar" aria-label="Mon profil">
              {store.progress.name ? store.progress.name[0].toUpperCase() : "M"}
            </a>
          </div>
        </header>
        <main
          id="main-content"
          className={`main-content ${kind === "study" ? "study-main" : ""}`}
          tabIndex={-1}
        >
          {page}
        </main>
        <footer className="page-footer">
          <span>
            mémora<span className="brand-dot">.</span>
          </span>
          <span>Apprendre. Réviser. Retenir.</span>
          <span>Fait pour tes prochains déclics.</span>
        </footer>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        {navItems.map((n) => (
          <a
            key={n.path}
            href={`#${n.path}`}
            className={route === n.path ? "active" : ""}
          >
            <n.icon size={23} weight={route === n.path ? "fill" : "regular"} />
            <span>
              {n.path === "/"
                ? "Accueil"
                : n.path === "/library"
                  ? "Matières"
                  : n.path === "/classroom"
                    ? "Salon"
                    : n.path === "/favorites"
                      ? "Favoris"
                      : "Progrès"}
            </span>
          </a>
        ))}
      </nav>
      {installPrompt && !Capacitor.isNativePlatform() && (
        <button
          className="install-app"
          onClick={async () => {
            await installPrompt.prompt();
            await installPrompt.userChoice;
            setInstallPrompt(null);
          }}
        >
          <DownloadSimple size={17} />
          Installer Mémora
        </button>
      )}
      {store.storageError && (
        <Toast onClose={store.clearStorageError}>{store.storageError}</Toast>
      )}
      {!Capacitor.isNativePlatform() && <PwaUpdates />}
    </div>
  );
}
