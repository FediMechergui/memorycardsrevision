import { Rank } from "./Rank";
import {
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Cards,
  ChartBar,
  Check,
  CloudArrowDown,
  DownloadSimple,
  FileArrowUp,
  FileText,
  Fire,
  GithubLogo,
  ShieldCheck,
  Sparkle,
  Target,
  UploadSimple,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import type { Store } from "../lib/storage";
import { classifyCourse, parseCatalog, type Catalog } from "../lib/content";
import {
  dayKey,
  downloadJson,
  progressSchema,
  streak,
  type Progress,
} from "../lib/progress";
import {
  APP_VERSION,
  checkRelease,
  fetchCourseUpdate,
  installRelease,
  isAndroid,
  parseRepository,
  type Release,
} from "../lib/updates";
import {
  EmptyState,
  go,
  Modal,
  ProgressBar,
  SectionTitle,
  SubjectIcon,
  Toast,
} from "./UI";
const modeNames: Record<string, string> = {
  flashcards: "Flashcards",
  quiz: "Quiz",
  qa: "Questions & réponses",
  exam: "Examen blanc",
};
export function ProgressPage({ store }: { store: Store }) {
  const { progress, catalog } = store;
  const cards = catalog.subjects.flatMap((s) =>
    s.chapters.flatMap((c) => c.cards),
  );
  const learned = cards.filter(
    (c) => (progress.reviews[c.id]?.interval || 0) >= 3,
  ).length;
  const week = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    return {
      key: dayKey(d),
      name: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      n: progress.activity[dayKey(d)] || 0,
    };
  });
  const max = Math.max(progress.goal, ...week.map((d) => d.n));
  const stats = [
    {
      icon: Fire,
      value: streak(progress.activity),
      label: "jours de suite",
      color: "peach",
    },
    {
      icon: Cards,
      value: learned,
      label: "cartes bien ancrées",
      color: "mint",
    },
    {
      icon: BookOpen,
      value: catalog.subjects
        .flatMap((s) => s.chapters)
        .filter((c) => progress.read.includes(c.id)).length,
      label: "chapitres terminés",
      color: "lavender",
    },
    {
      icon: Target,
      value: progress.results.length,
      label: "sessions terminées",
      color: "blue",
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">LES PETITS EFFORTS S’ADDITIONNENT</div>
        <h1>Ma progression</h1>
        <p>Pas besoin d’aller vite. L’essentiel, c’est de revenir.</p>
      </div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className={`mode-icon ${s.color}`}>
              <s.icon size={24} />
            </span>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <Rank progress={progress} />
      <section className="activity-panel">
        <SectionTitle
          title="Ton rythme, ces 14 derniers jours"
          action={<span className="muted small">Notions travaillées</span>}
        />
        <div className="activity-chart">
          {week.map((d) => (
            <div key={d.key} className="activity-column">
              <span>{d.n || ""}</span>
              <div
                className="activity-bar"
                style={{ height: `${Math.max(3, (d.n / max) * 130)}px` }}
                title={`${d.name} : ${d.n} notions`}
              />
              <small>{d.name}</small>
            </div>
          ))}
        </div>
      </section>
      <SectionTitle title="Matière par matière" />
      <div className="subject-progress-list">
        {catalog.subjects.map((s) => {
          const n = s.chapters.filter((c) =>
            progress.read.includes(c.id),
          ).length;
          return (
            <a href={`#/subject/${s.id}`} key={s.id}>
              <SubjectIcon subject={s} />
              <div>
                <h3>
                  {s.title}
                  <span>
                    {n}/{s.chapters.length} chapitres
                  </span>
                </h3>
                <ProgressBar
                  value={(n / s.chapters.length) * 100}
                  color={s.color}
                />
              </div>
              <ArrowRight size={19} />
            </a>
          );
        })}
      </div>
      <SectionTitle title="Mes dernières sessions" />
      {progress.results.length ? (
        <div className="results-list">
          {progress.results.slice(0, 30).map((r) => (
            <div key={r.id}>
              <span className="result-mode-icon">
                <ChartBar size={23} />
              </span>
              <div>
                <h3>{r.title}</h3>
                <p>
                  {modeNames[r.mode]} ·{" "}
                  {new Date(r.date).toLocaleDateString("fr-FR")} · {r.total}{" "}
                  questions
                </p>
              </div>
              <span className="result-score">
                {r.mode === "flashcards" ? <Check size={22} /> : `${r.score} %`}
                {["exam", "qa"].includes(r.mode) && (
                  <small>autoévaluation</small>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ChartBar size={30} />}
          title="L’histoire commence avec ta première session."
          action={
            <button
              className="button primary"
              onClick={() => go("/practice/flashcards")}
            >
              Réviser quelques cartes
            </button>
          }
        >
          Tes résultats apparaîtront ici après un entraînement terminé.
        </EmptyState>
      )}
      <p className="content-note">
        Une carte est « bien ancrée » quand sa prochaine révision est espacée
        d’au moins 3 jours. Les statistiques restent sur cet appareil.
      </p>
    </>
  );
}
export function Settings({ store }: { store: Store }) {
  const [name, setName] = useState(store.progress.name),
    [goal, setGoal] = useState(store.progress.goal),
    [repo, setRepo] = useState(store.progress.repository);
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [release, setRelease] = useState<Release | null>(null),
    [restore, setRestore] = useState<Progress | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const task = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Action impossible. Vérifie ta connexion puis réessaie.",
      );
    } finally {
      setBusy("");
    }
  };
  const save = () => {
    try {
      const repository = repo.trim() ? parseRepository(repo) : "";
      store.update((p) => ({ ...p, name: name.trim(), goal, repository }));
      setRepo(repository);
      setMessage("Tes préférences sont enregistrées.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">MÉMORA, À TA FAÇON</div>
        <h1>Mes réglages</h1>
        <p>Ton rythme, tes données, tes mises à jour.</p>
      </div>
      <div className="settings-layout">
        <section className="settings-panel">
          <h2>
            <Target size={23} />
            Mes habitudes
          </h2>
          <label className="field">
            Comment t’appeler ?
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom (facultatif)"
            />
          </label>
          <label className="field">
            Mon objectif quotidien
            <select
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 30, 50].map((n) => (
                <option value={n} key={n}>
                  {n} notions par jour
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" onClick={save}>
            Enregistrer
            <Check size={17} />
          </button>
        </section>
        <section className="settings-panel">
          <h2>
            <ShieldCheck size={23} />
            Ma progression m’appartient
          </h2>
          <p>
            Les favoris, résultats et révisions sont conservés sur cet appareil.
            Exporte une sauvegarde pour les transférer vers un autre navigateur
            ou téléphone.
          </p>
          <div className="settings-actions">
            <button
              className="button secondary"
              onClick={() =>
                downloadJson(
                  store.progress,
                  `memora-progression-${dayKey()}.json`,
                )
              }
            >
              <DownloadSimple size={18} />
              Exporter
            </button>
            <button
              className="button secondary"
              onClick={() => fileRef.current?.click()}
            >
              <UploadSimple size={18} />
              Restaurer
            </button>
          </div>
          <input
            className="sr-only"
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                if (file.size > 5_000_000)
                  throw new Error("Fichier trop volumineux (5 Mo maximum).");
                setRestore(progressSchema.parse(JSON.parse(await file.text())));
                setError("");
              } catch {
                setError("Cette sauvegarde de progression est invalide.");
              }
            }}
          />
        </section>
        <section className="settings-panel wide">
          <h2>
            <GithubLogo size={24} />
            Nouveaux cours & mises à jour
          </h2>
          <p>
            Relie un dépôt GitHub public pour récupérer ses cours et les
            nouvelles versions de l’application.
          </p>
          <label className="field">
            Dépôt GitHub
            <input
              value={repo}
              onChange={(e) => {
                setRepo(e.target.value);
                setRelease(null);
              }}
              placeholder="propriétaire/memora"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          <div className="settings-actions wrap">
            <button
              className="button secondary"
              disabled={!!busy || !repo.trim()}
              onClick={() =>
                task("courses", async () => {
                  const repository = parseRepository(repo);
                  const incoming = await fetchCourseUpdate(repository);
                  if (incoming.version <= store.catalog.version) {
                    setMessage("Tes cours sont déjà à jour.");
                    return;
                  }
                  store.importCatalog(incoming);
                  store.update((p) => ({ ...p, repository }));
                  setMessage(
                    `Catalogue v${incoming.version} installé. Ta progression est conservée.`,
                  );
                })
              }
            >
              <CloudArrowDown size={19} />
              {busy === "courses" ? "Vérification…" : "Mettre les cours à jour"}
            </button>
            <button
              className="button secondary"
              disabled={!!busy || !repo.trim()}
              onClick={() =>
                task("release", async () => {
                  const repository = parseRepository(repo);
                  const found = await checkRelease(repository);
                  setRelease(found);
                  store.update((p) => ({ ...p, repository }));
                  if (!found)
                    setMessage("Tu utilises la dernière version publiée.");
                })
              }
            >
              <GithubLogo size={19} />
              {busy === "release"
                ? "Recherche…"
                : "Vérifier la version Android"}
            </button>
            <button className="button primary" onClick={save} disabled={!!busy}>
              Enregistrer le dépôt
            </button>
          </div>
          <p className="small muted">
            Version {APP_VERSION} · Catalogue v{store.catalog.version} · Les
            cours se mettent à jour sans réinstaller l’application.
            L’installation d’un APK demande la confirmation d’Android.
          </p>
          {release && (
            <div className="release-panel">
              <h3>La version {release.version} est disponible</h3>
              <p>
                {release.notes || "Une nouvelle version de Mémora t’attend."}
              </p>
              {isAndroid && release.apk && (
                <button
                  className="button primary"
                  disabled={!!busy}
                  onClick={() =>
                    task("install", async () => {
                      await installRelease(release, repo);
                      setMessage(
                        "APK vérifié. Termine l’installation dans la fenêtre Android.",
                      );
                    })
                  }
                >
                  <DownloadSimple size={18} />
                  {busy === "install"
                    ? "Téléchargement et vérification…"
                    : "Télécharger et installer"}
                </button>
              )}
              <a
                className="text-link"
                href={release.url}
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir la release GitHub
                <ArrowSquareOut size={17} />
              </a>
            </div>
          )}
        </section>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {message && <Toast onClose={() => setMessage("")}>{message}</Toast>}
      {restore && (
        <Modal
          title="Restaurer cette progression ?"
          onClose={() => setRestore(null)}
        >
          <p>
            Cette sauvegarde contient {restore.read.length} chapitres terminés
            et {restore.results.length} sessions. Elle remplacera la progression
            de cet appareil. Exporte d’abord la progression actuelle si tu
            souhaites la garder.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setRestore(null)}
            >
              Annuler
            </button>
            <button
              className="button primary"
              onClick={() => {
                store.update(() => restore);
                setName(restore.name);
                setGoal(restore.goal);
                setRepo(restore.repository);
                setRestore(null);
                setMessage("Progression restaurée.");
              }}
            >
              Restaurer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function ImportPage({ store }: { store: Store }) {
  const [pack, setPack] = useState<Catalog | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [text, setText] = useState(""),
    [subject, setSubject] = useState(""),
    [filename, setFilename] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const suggestion = classifyCourse(text);
  const acceptFile = async (f?: File) => {
    if (!f) return;
    setError("");
    setPack(null);
    setText("");
    setFilename(f.name);
    try {
      if (f.size > 5_000_000)
        throw new Error("Le fichier dépasse la limite de 5 Mo.");
      if (f.name.toLowerCase().endsWith(".json")) {
        setPack(parseCatalog(JSON.parse(await f.text())));
        return;
      }
      if (!/\.(txt|md)$/i.test(f.name))
        throw new Error(
          "Utilise un pack JSON Mémora ou un cours au format texte/Markdown. Les PDF devront être préparés avant import.",
        );
      const value = await f.text();
      setText(value);
      setSubject(classifyCourse(value) || "");
    } catch (e) {
      setError(
        e instanceof Error && !e.message.startsWith("[")
          ? e.message
          : "Ce pack ne respecte pas le format Mémora. Vérifie les matières, chapitres, cartes et identifiants.",
      );
    }
  };
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">FAIS GRANDIR TA BIBLIOTHÈQUE</div>
        <h1>Un nouveau cours, de nouveaux déclics.</h1>
        <p>
          Ajoute un pack de révision préparé, ou repère la matière d’un cours
          texte.
        </p>
      </div>
      <div
        className="import-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void acceptFile(e.dataTransfer.files[0]);
        }}
      >
        <span className="import-icon">
          <FileArrowUp size={36} />
        </span>
        <h2>Dépose ton cours ici</h2>
        <p>Pack Mémora .json · Cours .txt ou .md · 5 Mo maximum</p>
        <button
          className="button primary"
          onClick={() => file.current?.click()}
        >
          <UploadSimple size={18} />
          Choisir un fichier
        </button>
        <input
          className="sr-only"
          ref={file}
          type="file"
          accept=".json,.txt,.md"
          onChange={(e) => {
            void acceptFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {pack && (
        <section className="import-preview">
          <SectionTitle
            title="Ton pack est prêt"
            action={<span className="badge mint">Format vérifié</span>}
          />
          <p>
            {filename} · {pack.subjects.length} matière(s),{" "}
            {pack.subjects.flatMap((s) => s.chapters).length} chapitre(s). Les
            identifiants existants seront mis à jour ; tes révisions seront
            conservées.
          </p>
          {pack.subjects.map((s) => (
            <div className="import-subject" key={s.id}>
              <SubjectIcon subject={s} />
              <div>
                <h3>{s.title}</h3>
                <span>
                  {s.chapters.length} chapitres ·{" "}
                  {s.chapters.flatMap((c) => c.cards).length} cartes
                </span>
              </div>
            </div>
          ))}
          <button
            className="button primary"
            onClick={() => {
              try {
                store.importCatalog(pack);
                setPack(null);
                setMessage("Ton pack a rejoint la bibliothèque.");
              } catch {
                setError(
                  "Import impossible : vérifie l’espace de stockage et les identifiants du pack.",
                );
              }
            }}
          >
            Ajouter à ma bibliothèque
            <ArrowRight size={18} />
          </button>
        </section>
      )}
      {text && (
        <section className="import-preview">
          <h2>
            <FileText size={23} />
            Classer ce cours
          </h2>
          <p>
            {suggestion
              ? `Les mots-clés du document suggèrent ${store.catalog.subjects.find((s) => s.id === suggestion)?.title || suggestion}. Vérifie la matière avant de préparer le pack.`
              : "La matière n’est pas évidente : choisis-la ci-dessous."}
          </p>
          <label className="field">
            Matière
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Choisir une matière</option>
              {store.catalog.subjects.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <pre className="text-preview">
            {text.slice(0, 16000)}
            {text.length > 16000
              ? "\n[Aperçu limité ; le fichier exporté garde le texte complet.]"
              : ""}
          </pre>
          <p>
            Le classement utilise les mots-clés du cours. La création d’un
            résumé fiable, des cartes et du corrigé se fait lors de la
            préparation du pack avec ton cours.
          </p>
          <button
            className="button secondary"
            disabled={!subject}
            onClick={() =>
              downloadJson(
                { type: "memora-course-source", subject, filename, text },
                "memora-cours-a-preparer.json",
              )
            }
          >
            <DownloadSimple size={18} />
            Exporter le cours classé
          </button>
        </section>
      )}
      <div className="import-help">
        <Sparkle size={25} />
        <div>
          <h3>Comment ajouter tes prochains cours ?</h3>
          <p>
            Confie ton cours à l’assistant qui travaille sur ce projet. Il
            identifiera la matière et préparera les résumés, les flashcards, les
            quiz et les sujets rédigés. Tu pourras ensuite importer le pack ici
            ou récupérer la mise à jour depuis GitHub.
          </p>
          <button
            className="text-link"
            onClick={() =>
              downloadJson(
                { ...store.catalog, subjects: [store.catalog.subjects[0]] },
                "memora-exemple-pack.json",
              )
            }
          >
            Télécharger un exemple de pack
            <DownloadSimple size={17} />
          </button>
        </div>
      </div>
      {message && <Toast onClose={() => setMessage("")}>{message}</Toast>}
    </>
  );
}
