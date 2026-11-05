import {
  ArrowRight,
  ArrowUpRight,
  Books,
  Cards,
  Check,
  Clock,
  Fire,
  Lightning,
  ListChecks,
  PencilLine,
  Question,
  Sparkle,
  Target,
  WifiHigh,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { Store } from "../lib/storage";
import type { Subject } from "../lib/content";
import { dayKey, streak } from "../lib/progress";
import { Mascot } from "./Mascot";
import { go, ProgressBar, SectionTitle, SubjectIcon, TextLink } from "./UI";
export const modes = [
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Un recto, un verso. Et ça reste.",
    icon: Cards,
    color: "mint",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Teste tes connaissances.",
    icon: ListChecks,
    color: "lavender",
  },
  {
    id: "qa",
    title: "Questions & réponses",
    description: "Explique avec tes mots.",
    icon: Question,
    color: "peach",
  },
  {
    id: "exam",
    title: "Examen blanc",
    description: "Entraîne-toi en conditions réelles.",
    icon: PencilLine,
    color: "blue",
  },
];
export function CourseCard({
  subject,
  store,
}: {
  subject: Subject;
  store: Store;
}) {
  const completed = subject.chapters.filter((c) =>
    store.progress.read.includes(c.id),
  ).length;
  const cards = subject.chapters.reduce((n, c) => n + c.cards.length, 0);
  return (
    <a
      className={`course-card ${subject.color}`}
      href={`#/subject/${subject.id}`}
    >
      <div className={`course-art ${subject.color}`}>
        <span className="course-category">
          {subject.icon === "code" ? "DÉVELOPPEMENT" : "RÉSEAUX & SYSTÈMES"}
        </span>
        <SubjectIcon subject={subject} size={34} />
        <div className="course-art-lines">
          <i />
          <i />
          <i />
        </div>
        <ArrowUpRight className="course-arrow" size={20} />
      </div>
      <div className="course-content">
        <h3>{subject.title}</h3>
        <p>{subject.subtitle}</p>
        <div className="course-meta">
          <span>
            <Books size={15} />
            {subject.chapters.length} chapitres
          </span>
          <span>
            <Cards size={15} />
            {cards} cartes
          </span>
        </div>
        <div className="course-progress-label">
          <span>{completed ? "Ton avancée" : "Prêt à commencer"}</span>
          <b>{Math.round((completed / subject.chapters.length) * 100)} %</b>
        </div>
        <ProgressBar
          value={(completed / subject.chapters.length) * 100}
          color={subject.color}
        />
      </div>
    </a>
  );
}
export function Dashboard({ store }: { store: Store }) {
  const { progress, catalog } = store;
  const [filter, setFilter] = useState("all");
  const allChapters = catalog.subjects.flatMap((s) =>
    s.chapters.map((c) => ({ ...c, subject: s })),
  );
  const cards = allChapters.flatMap((c) => c.cards);
  const due = cards.filter(
    (c) => !progress.reviews[c.id] || progress.reviews[c.id].due <= Date.now(),
  ).length;
  const today = progress.activity[dayKey()] || 0;
  const current =
    allChapters.find((c) => c.id === progress.lastChapter) ||
    allChapters.find((c) => !progress.read.includes(c.id)) ||
    allChapters[0];
  const days = streak(progress.activity);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      key: dayKey(date),
      name: new Intl.DateTimeFormat("fr", { weekday: "narrow" }).format(date),
      count: progress.activity[dayKey(date)] || 0,
    };
  });
  return (
    <>
      <div className="page-heading home-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-dot" /> TON ESPACE POUR PROGRESSER
          </div>
          <h1>
            Bonjour{progress.name ? ` ${progress.name}` : ""}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Chaque petite révision fait une grande différence.</p>
        </div>
        <div className="date-label">
          {new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </div>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="hero-label">
                <Sparkle size={15} weight="fill" /> UN PEU CHAQUE JOUR
              </span>
              <h2>
                Les petits déclics font
                <br />
                les grandes réussites.
              </h2>
              <p>
                {due > 0
                  ? `${due} cartes t’attendent. Et si on en révisait quelques-unes ?`
                  : "Toutes tes cartes sont à jour. Une belle habitude se construit !"}
              </p>
              <button
                className="button primary"
                onClick={() => go("/study/flashcards/due")}
              >
                C’est parti pour réviser
                <ArrowRight size={18} />
              </button>
              <span className="hero-note">
                <Clock size={14} /> 5 minutes, c’est déjà un bon début.
              </span>
            </div>
            <div className="hero-mascot">
              <div className="mimo-bubble">
                On avance ensemble !<span />
              </div>
              <Mascot />
              <span className="mascot-spark spark-one">✦</span>
              <span className="mascot-spark spark-two">+</span>
              <div className="floating-card card-a">
                <Check size={20} weight="bold" />
              </div>
              <div className="floating-card card-b">
                <Cards size={24} />
              </div>
            </div>
          </section>
          <section className="subjects-section">
            <SectionTitle
              title="Mes matières"
              action={<TextLink to="/library">Tout voir</TextLink>}
            />
            <div className="filter-tabs" aria-label="Filtrer les matières">
              {[
                ["all", "Toutes les matières"],
                ["network", "Réseaux"],
                ["code", "Développement"],
              ].map(([id, text]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={filter === id ? "selected" : ""}
                  aria-pressed={filter === id}
                >
                  {text}
                  {id === "all" && <span>{catalog.subjects.length}</span>}
                </button>
              ))}
            </div>
            <div className="courses-grid">
              {catalog.subjects
                .filter(
                  (s) =>
                    filter === "all" ||
                    (filter === "network"
                      ? ["network", "router"].includes(s.icon)
                      : s.icon === filter),
                )
                .map((subject) => (
                  <CourseCard
                    key={subject.id}
                    subject={subject}
                    store={store}
                  />
                ))}
            </div>
          </section>
          <section>
            <SectionTitle
              title="À chaque envie, son mode"
              action={<span className="muted small">Trouve ton rythme.</span>}
            />
            <div className="mode-grid">
              {modes.map((m) => (
                <a key={m.id} href={`#/practice/${m.id}`} className="mode-card">
                  <span className={`mode-icon ${m.color}`}>
                    <m.icon size={25} />
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <ArrowUpRight className="mode-arrow" size={17} />
                </a>
              ))}
            </div>
          </section>
        </div>
        <aside className="dashboard-rail">
          <section className="goal-panel">
            <div className="rail-heading">
              <h2>Mon objectif du jour</h2>
              <Target size={19} />
            </div>
            <div
              className="goal-ring"
              style={
                {
                  "--progress": `${Math.min(100, (today / progress.goal) * 100)}%`,
                } as React.CSSProperties
              }
            >
              <div>
                <span>
                  <b>{Math.min(today, progress.goal)}</b>
                  <span> / {progress.goal}</span>
                </span>
                <small>notions révisées</small>
              </div>
            </div>
            <p>
              {today >= progress.goal
                ? "Objectif atteint. Bien joué !"
                : today > 0
                  ? "Tu es sur la bonne voie !"
                  : "Le premier pas, c’est maintenant."}
            </p>
            <div className="goal-divider" />
            <div className="streak-label">
              <span>
                <Fire size={21} weight="fill" />
                <b>
                  {days} jour{days > 1 ? "s" : ""}
                </b>{" "}
                de suite
              </span>
              <span className="muted small">Ta série</span>
            </div>
            <div className="week-dots">
              {week.map((d, i) => (
                <div key={d.key}>
                  <span>{d.name}</span>
                  <i
                    className={`${d.count ? "done" : ""} ${i === 6 ? "today" : ""}`}
                  >
                    {d.count ? <Check size={13} weight="bold" /> : ""}
                  </i>
                </div>
              ))}
            </div>
          </section>
          <section className="continue-panel">
            <div className="rail-heading">
              <h2>
                {progress.lastChapter
                  ? "Reprendre le fil"
                  : "Ton prochain déclic"}
              </h2>
              <span className="tiny-dot" />
            </div>
            <span className={`badge ${current.subject.color}`}>
              {current.subject.title}
            </span>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <div className="continue-meta">
              <span>
                <Clock size={14} />
                {current.minutes} min
              </span>
              <span>Résumé de cours</span>
            </div>
            <button
              className="button secondary full"
              onClick={() => go(`/learn/${current.id}`)}
            >
              {progress.lastChapter ? "Reprendre" : "Découvrir le chapitre"}
              <ArrowRight size={17} />
            </button>
          </section>
          <div className="mimo-note">
            <span className="note-spark">
              <Lightning size={21} weight="fill" />
            </span>
            <div>
              <h3>Le conseil de Mimo</h3>
              <p>
                Essaie de retrouver la réponse avant de retourner la carte. Ton
                cerveau retiendra mieux !
              </p>
            </div>
          </div>
          <div className="offline-note">
            <WifiHigh size={15} />
            <span>Tes révisions te suivent, même hors ligne.</span>
          </div>
        </aside>
      </div>
    </>
  );
}
