import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Cards,
  Check,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  Plus,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { Store } from "../lib/storage";
import type { Chapter, Subject } from "../lib/content";
import { normalize } from "../lib/content";
import { addActivity } from "../lib/progress";
import { CourseCard, modes } from "./Dashboard";
import {
  EmptyState,
  FavoriteButton,
  go,
  ProgressBar,
  SectionTitle,
  SubjectIcon,
} from "./UI";

export function Library({
  store,
  search = "",
}: {
  store: Store;
  search?: string;
}) {
  const [query, setQuery] = useState(search);
  useEffect(() => setQuery(search), [search]);
  const subjects = store.catalog.subjects.filter((s) =>
    normalize(
      `${s.title} ${s.subtitle} ${s.chapters.map((c) => c.title).join(" ")}`,
    ).includes(normalize(query)),
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">TA BIBLIOTHÈQUE</div>
        <h1>Un chapitre à la fois.</h1>
        <p>Des notions claires, du premier déclic à la maîtrise.</p>
      </div>
      <div className="library-toolbar">
        <label className="search-box">
          <MagnifyingGlass size={20} />
          <input
            aria-label="Rechercher une matière ou un chapitre"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Une matière, un chapitre, une notion…"
          />
        </label>
        <button className="button primary" onClick={() => go("/import")}>
          <Plus size={18} />
          Ajouter un cours
        </button>
      </div>
      <div className="courses-grid library-grid">
        {subjects.map((s) => (
          <CourseCard key={s.id} subject={s} store={store} />
        ))}
      </div>
      {subjects.length === 0 && (
        <EmptyState title="Aucune matière trouvée">
          Essaie un autre mot, comme « IPv4 » ou « JavaFX ».
        </EmptyState>
      )}
      {query && (
        <div className="search-chapters">
          <SectionTitle title="Chapitres correspondants" />
          {store.catalog.subjects.flatMap((s) =>
            s.chapters
              .filter((c) =>
                normalize(`${c.title} ${c.description}`).includes(
                  normalize(query),
                ),
              )
              .map((c) => (
                <a className="chapter-row" key={c.id} href={`#/learn/${c.id}`}>
                  <SubjectIcon subject={s} />
                  <div>
                    <h3>{c.title}</h3>
                    <p>
                      {s.title} · {c.minutes} min
                    </p>
                  </div>
                  <ArrowRight size={20} />
                </a>
              )),
          )}
        </div>
      )}
      <p className="content-note">
        Fiches de révision originales et synthétiques. Elles complètent tes
        cours ; les références sont disponibles dans chaque matière.
      </p>
    </>
  );
}
export function SubjectPage({
  subject,
  store,
}: {
  subject: Subject;
  store: Store;
}) {
  const count = subject.chapters.filter((c) =>
    store.progress.read.includes(c.id),
  ).length;
  const next =
    subject.chapters.find((c) => !store.progress.read.includes(c.id)) ||
    subject.chapters[0];
  return (
    <>
      <a href="#/library" className="back-link">
        <ArrowLeft size={17} />
        Mes matières
      </a>
      <div className={`subject-banner ${subject.color}`}>
        <div>
          <div className="eyebrow">{subject.subtitle}</div>
          <h1>{subject.title}</h1>
          <p>{subject.description}</p>
          <div className="subject-banner-meta">
            <span>
              <BookOpen size={17} />
              {subject.chapters.length} chapitres
            </span>
            <span>
              <Cards size={17} />
              {subject.chapters.flatMap((c) => c.cards).length} flashcards
            </span>
          </div>
          <button
            className="button primary"
            onClick={() => go(`/learn/${next.id}`)}
          >
            {count ? "Continuer à apprendre" : "Commencer à apprendre"}
            <ArrowRight size={18} />
          </button>
        </div>
        <SubjectIcon subject={subject} size={80} />
      </div>
      <div className="subject-layout">
        <section>
          <SectionTitle
            title="Le parcours, chapitre par chapitre"
            action={
              <span className="muted small">
                {count}/{subject.chapters.length} terminés
              </span>
            }
          />
          <ProgressBar
            value={(count / subject.chapters.length) * 100}
            color={subject.color}
          />
          <div className="chapter-list">
            {subject.chapters.map((c, i) => (
              <a href={`#/learn/${c.id}`} key={c.id} className="chapter-row">
                <span
                  className={`chapter-number ${store.progress.read.includes(c.id) ? "completed" : ""}`}
                >
                  {store.progress.read.includes(c.id) ? (
                    <Check size={21} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <span className="small muted">
                    {c.minutes} min de lecture · {c.cards.length} cartes
                  </span>
                </div>
                <ArrowRight size={19} />
              </a>
            ))}
          </div>
        </section>
        <aside className="subject-side">
          <h2>À toi de jouer</h2>
          <p>Entraîne-toi sur toute la matière.</p>
          {modes.map((m) => (
            <a
              key={m.id}
              href={`#/study/${m.id}/${subject.id}`}
              className="practice-row"
            >
              <span className={`mode-icon ${m.color}`}>
                <m.icon size={22} />
              </span>
              <div>
                <h3>{m.title}</h3>
                <span>{m.description}</span>
              </div>
              <ArrowRight size={16} />
            </a>
          ))}
          <div className="sources">
            <h3>Pour aller plus loin</h3>
            {subject.sources.map((s) => (
              <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
                {s.title}
                <ArrowRight size={14} />
              </a>
            ))}
            <p>
              Synthèses indépendantes. Mémora n’est affiliée ni à Cisco ni à
              OpenJFX.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
export function Lesson({
  chapter,
  subject,
  store,
}: {
  chapter: Chapter;
  subject: Subject;
  store: Store;
}) {
  useEffect(() => {
    store.update((p) =>
      p.lastChapter === chapter.id ? p : { ...p, lastChapter: chapter.id },
    );
  }, [chapter.id, store.update]);
  const done = store.progress.read.includes(chapter.id);
  const index = subject.chapters.findIndex((c) => c.id === chapter.id);
  const next = subject.chapters[index + 1];
  return (
    <>
      <a href={`#/subject/${subject.id}`} className="back-link">
        <ArrowLeft size={17} />
        {subject.title} · Tous les chapitres
      </a>
      <div className="lesson-layout">
        <article className="lesson">
          <div className="lesson-meta">
            <span className={`badge ${subject.color}`}>{subject.title}</span>
            <span>Chapitre {String(index + 1).padStart(2, "0")}</span>
            <span>
              <Clock size={15} />
              {chapter.minutes} min
            </span>
          </div>
          <h1>{chapter.title}</h1>
          <p className="lesson-lead">{chapter.description}</p>
          <div className="lesson-rule" />
          {chapter.sections.map((section, i) => (
            <section className="lesson-section" id={`section-${i}`} key={i}>
              <span className="lesson-section-number">0{i + 1}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.bullets && (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {section.code && (
                <div className="code-block">
                  <div>
                    <span>
                      {subject.id === "javafx"
                        ? "JAVA / JAVAFX"
                        : "COMMANDES · EXEMPLE"}
                    </span>
                    <span>À comprendre, puis à pratiquer</span>
                  </div>
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
            </section>
          ))}
          <div className="takeaway">
            <Sparkle size={24} weight="duotone" />
            <div>
              <h3>Le déclic à retenir</h3>
              <p>{chapter.takeaway}</p>
            </div>
          </div>
          <div className="lesson-completion">
            <button
              className={`button ${done ? "secondary" : "primary"}`}
              onClick={() => {
                if (!done)
                  store.update((p) =>
                    p.read.includes(chapter.id)
                      ? p
                      : addActivity({ ...p, read: [...p.read, chapter.id] }),
                  );
              }}
              disabled={done}
            >
              {done ? <CheckCircle size={20} /> : <Check size={20} />}
              {done ? "Chapitre terminé" : "J’ai compris ce chapitre"}
            </button>
            {next && (
              <a href={`#/learn/${next.id}`} className="text-link">
                Chapitre suivant
                <ArrowRight size={18} />
              </a>
            )}
          </div>
          <div className="lesson-source small muted">
            Références :{" "}
            {subject.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? " · " : ""}
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </span>
            ))}
          </div>
        </article>
        <aside className="lesson-aside">
          <span className="eyebrow">DANS CE CHAPITRE</span>
          <nav>
            {chapter.sections.map((s, i) => (
              <button
                key={s.title}
                onClick={() =>
                  document
                    .getElementById(`section-${i}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {String(i + 1).padStart(2, "0")}
                <span>{s.title}</span>
              </button>
            ))}
          </nav>
          <div className="lesson-practice">
            <h3>Passons à la pratique.</h3>
            <p>
              Les notions sont plus solides quand tu les retrouves toi-même.
            </p>
            {modes.map((m) => (
              <a
                href={`#/study/${m.id}/${chapter.id}`}
                className="lesson-mode"
                key={m.id}
              >
                <m.icon size={19} />
                {m.title}
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
export function PracticePicker({
  store,
  mode,
}: {
  store: Store;
  mode: string;
}) {
  const selected = modes.find((m) => m.id === mode) || modes[0];
  return (
    <>
      <div className="page-heading">
        <span className={`mode-icon ${selected.color}`}>
          <selected.icon size={30} />
        </span>
        <div className="eyebrow">TON TERRAIN D’ENTRAÎNEMENT</div>
        <h1>{selected.title}</h1>
        <p>
          Choisis ta matière. Tu peux aussi lancer une session depuis un
          chapitre.
        </p>
      </div>
      <div className="practice-subjects">
        {store.catalog.subjects.map((s) => (
          <button
            className="practice-subject"
            key={s.id}
            onClick={() => go(`/study/${mode}/${s.id}`)}
          >
            <SubjectIcon subject={s} size={35} />
            <div>
              <h2>{s.title}</h2>
              <p>{s.subtitle}</p>
              <span>
                {mode === "exam"
                  ? `${s.chapters.flatMap((c) => c.exams).length} questions rédigées`
                  : `${s.chapters.flatMap((c) => c.cards).length} questions`}
              </span>
            </div>
            <ArrowRight size={24} />
          </button>
        ))}
      </div>
      <div className="study-tip">
        <Sparkle size={20} />
        <p>
          {mode === "exam"
            ? "Un chronomètre, tes réponses écrites et un corrigé avec grille d’autoévaluation à la fin."
            : "Tu progresses à ton rythme. Tes résultats restent enregistrés sur cet appareil."}
        </p>
      </div>
    </>
  );
}
export function Favorites({ store }: { store: Store }) {
  const cards = store.catalog.subjects.flatMap((s) =>
    s.chapters.flatMap((c) =>
      c.cards
        .filter((card) => store.progress.favorites.includes(card.id))
        .map((card) => ({ ...card, subject: s.title, chapter: c.title })),
    ),
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">À GARDER SOUS LA MAIN</div>
        <h1>Mes favoris</h1>
        <p>Les notions que tu veux retrouver facilement.</p>
      </div>
      {cards.length ? (
        <>
          <div className="favorites-toolbar">
            <span>{cards.length} cartes enregistrées</span>
            <button
              className="button primary"
              onClick={() => go("/study/flashcards/favorites")}
            >
              Réviser mes favoris
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="favorite-grid">
            {cards.map((c) => (
              <div className="favorite-card" key={c.id}>
                <div>
                  <span className="eyebrow">{c.subject}</span>
                  <FavoriteButton
                    active
                    onClick={() =>
                      store.update((p) => ({
                        ...p,
                        favorites: p.favorites.filter((id) => id !== c.id),
                      }))
                    }
                  />
                </div>
                <h3>{c.question}</h3>
                <details>
                  <summary>Voir la réponse</summary>
                  <p>{c.answer}</p>
                  <p className="muted">{c.explanation}</p>
                </details>
                <span className="small muted">{c.chapter}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Star size={34} />}
          title="Tes prochains favoris sont dans les cartes."
          action={
            <button
              className="button primary"
              onClick={() => go("/practice/flashcards")}
            >
              Explorer les flashcards
            </button>
          }
        >
          Touche l’étoile pendant une révision pour garder une notion ici.
        </EmptyState>
      )}
    </>
  );
}
