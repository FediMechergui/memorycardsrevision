import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Lightbulb,
  PencilLine,
  SpeakerHigh,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Store } from "../lib/storage";
import type { Card, Exam } from "../lib/content";
import {
  addActivity,
  saveResult,
  scheduleReview,
  type Result,
} from "../lib/progress";
import { EmptyState, FavoriteButton, go, Modal, ProgressBar } from "./UI";
import { Mascot } from "./Mascot";
type StudyCard = Card & { subjectTitle: string; chapterTitle: string };
type StudyExam = Exam & { subjectTitle: string; chapterTitle: string };
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function Study({
  store,
  mode,
  scope,
}: {
  store: Store;
  mode: string;
  scope: string;
}) {
  const selectedSubjects = store.catalog.subjects.filter(
    (s) =>
      scope === "due" ||
      scope === "favorites" ||
      s.id === scope ||
      s.chapters.some((c) => c.id === scope),
  );
  const selectedChapters = selectedSubjects.flatMap((s) =>
    s.chapters
      .filter(
        (c) => ["due", "favorites", s.id].includes(scope) || c.id === scope,
      )
      .map((c) => ({ ...c, subjectTitle: s.title })),
  );
  const allCards = selectedChapters.flatMap((c) =>
    c.cards.map((card) => ({
      ...card,
      subjectTitle: c.subjectTitle,
      chapterTitle: c.title,
    })),
  );
  const [cards] = useState(() =>
    shuffle(
      allCards.filter((c) =>
        scope === "favorites"
          ? store.progress.favorites.includes(c.id)
          : scope === "due"
            ? !store.progress.reviews[c.id] ||
              store.progress.reviews[c.id].due <= Date.now()
            : true,
      ),
    ).slice(0, scope === "due" ? store.progress.goal : allCards.length),
  );
  const exams = selectedChapters.flatMap((c) =>
    c.exams.map((exam) => ({
      ...exam,
      subjectTitle: c.subjectTitle,
      chapterTitle: c.title,
    })),
  );
  const title =
    selectedSubjects.length === 1
      ? selectedChapters.length === 1
        ? selectedChapters[0].title
        : selectedSubjects[0].title
      : scope === "favorites"
        ? "Mes favoris"
        : "Révision du jour";
  const [exit, setExit] = useState(false);
  if (!["flashcards", "quiz", "qa", "exam"].includes(mode))
    return (
      <EmptyState
        title="Ce mode n’existe pas."
        action={
          <button className="button primary" onClick={() => go("/")}>
            Retour à l’accueil
          </button>
        }
      >
        Choisis un mode depuis les matières.
      </EmptyState>
    );
  if (mode === "exam" ? !exams.length : !cards.length)
    return (
      <EmptyState
        icon={<CheckCircle size={40} />}
        title={
          scope === "due"
            ? "Tout est à jour !"
            : "Aucune question dans cette sélection."
        }
        action={
          <button className="button primary" onClick={() => go("/library")}>
            Explorer mes matières
          </button>
        }
      >
        {scope === "due"
          ? "Tes prochaines cartes reviendront au bon moment. Tu peux toujours réviser librement depuis une matière."
          : "Choisis une matière ou ajoute des cartes à tes favoris."}
      </EmptyState>
    );
  return (
    <div className="study-container">
      <button className="back-link" onClick={() => setExit(true)}>
        <ArrowLeft size={17} />
        Quitter la session
      </button>
      {mode === "exam" ? (
        <ExamSession
          key={`${mode}-${scope}`}
          store={store}
          exams={exams}
          title={title}
          scope={scope}
        />
      ) : (
        <CardSession
          key={`${mode}-${scope}`}
          store={store}
          cards={cards}
          mode={mode as "flashcards" | "quiz" | "qa"}
          title={title}
        />
      )}
      {exit && (
        <Modal title="Faire une pause ?" onClose={() => setExit(false)}>
          <p>
            Les cartes déjà évaluées sont enregistrées. En examen, tes réponses
            et le chronomètre sont conservés ; le temps continue de s’écouler.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setExit(false)}>
              Continuer
            </button>
            <button className="button primary" onClick={() => go("/library")}>
              Quitter la session
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function ResultScreen({
  score,
  total,
  mode,
  title,
  retry,
}: {
  score: number;
  total: number;
  mode: string;
  title: string;
  retry: () => void;
}) {
  return (
    <div className="result-screen">
      <Mascot celebrate />
      <span className="eyebrow">UN PAS DE PLUS</span>
      <h1>
        {mode === "flashcards"
          ? "Bien joué, session terminée !"
          : score >= 80
            ? "Les notions prennent leur place !"
            : "Chaque essai te fait progresser."}
      </h1>
      <p>{title}</p>
      <div className="result-numbers">
        <div>
          <b>{total}</b>
          <span>
            {mode === "exam" ? "réponses rédigées" : "cartes travaillées"}
          </span>
        </div>
        {mode !== "flashcards" && (
          <div>
            <b>
              {score}
              <small> %</small>
            </b>
            <span>
              {mode === "exam" || mode === "qa"
                ? "autoévaluation"
                : "de bonnes réponses"}
            </span>
          </div>
        )}
      </div>
      <p className="muted">
        {mode === "flashcards"
          ? "Tes prochaines révisions sont programmées selon tes réponses."
          : mode === "quiz"
            ? "Retrouve les notions hésitantes dans les résumés et les flashcards."
            : "Ce résultat reflète ton autoévaluation. Compare bien tes réponses au corrigé."}
      </p>
      <div className="result-actions">
        <button className="button secondary" onClick={retry}>
          <ArrowsClockwise size={18} />
          Nouvelle session
        </button>
        <button className="button primary" onClick={() => go("/")}>
          Retour à l’accueil
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
function CardSession({
  store,
  cards,
  mode,
  title,
}: {
  store: Store;
  cards: StudyCard[];
  mode: "flashcards" | "quiz" | "qa";
  title: string;
}) {
  const [index, setIndex] = useState(0),
    [revealed, setRevealed] = useState(false),
    [selected, setSelected] = useState<number | null>(null);
  const [answer, setAnswer] = useState(""),
    [correctCount, setCorrectCount] = useState(0),
    [done, setDone] = useState(false);
  const id = useRef(crypto.randomUUID());
  const advanceLock = useRef(false);
  useEffect(() => {
    advanceLock.current = false;
  }, [index, done]);
  const card = cards[index];
  const heading =
    mode === "flashcards"
      ? "Une carte, un déclic."
      : mode === "quiz"
        ? "À toi de trouver."
        : "Explique avec tes mots.";
  const next = (
    correct: boolean,
    grade?: "again" | "hard" | "good" | "easy",
  ) => {
    if (advanceLock.current) return;
    advanceLock.current = true;
    const count = correctCount + Number(correct);
    setCorrectCount(count);
    store.update((p) => {
      let nextProgress = addActivity(p);
      if (grade)
        nextProgress = {
          ...nextProgress,
          reviews: {
            ...p.reviews,
            [card.id]: scheduleReview(p.reviews[card.id], grade),
          },
        };
      if (index === cards.length - 1)
        nextProgress = saveResult(nextProgress, {
          id: id.current,
          mode,
          title,
          date: Date.now(),
          score: Math.round((count / cards.length) * 100),
          total: cards.length,
        });
      return nextProgress;
    });
    if (index === cards.length - 1) setDone(true);
    else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setSelected(null);
      setAnswer("");
    }
  };
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input, textarea, button, a"))
        return;
      if (event.code === "Space" && mode === "flashcards" && !done) {
        event.preventDefault();
        setRevealed((v) => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, [mode, done]);
  if (done)
    return (
      <ResultScreen
        mode={mode}
        total={cards.length}
        score={Math.round((correctCount / cards.length) * 100)}
        title={title}
        retry={() => {
          setIndex(0);
          setDone(false);
          setRevealed(false);
          setSelected(null);
          setCorrectCount(0);
          setAnswer("");
          id.current = crypto.randomUUID();
        }}
      />
    );
  const favorite = store.progress.favorites.includes(card.id);
  return (
    <>
      <div className="study-heading">
        <span className="eyebrow">
          {mode === "qa" ? "QUESTIONS & RÉPONSES" : mode.toUpperCase()}
        </span>
        <h1>{heading}</h1>
        <p>{title}</p>
      </div>
      <div className="session-progress">
        <span>
          {mode === "flashcards" ? "Carte" : "Question"} <b>{index + 1}</b> sur{" "}
          {cards.length}
        </span>
        <span>{Math.round((index / cards.length) * 100)} %</span>
      </div>
      <ProgressBar value={(index / cards.length) * 100} />
      <div className={`study-card ${revealed ? "revealed" : ""} ${mode}`}>
        <div className="study-card-top">
          <span>
            {card.subjectTitle}
            <i />
            {card.chapterTitle}
          </span>
          <div>
            {"speechSynthesis" in window && (
              <button
                className="icon-button"
                aria-label="Écouter la question"
                onClick={() => {
                  speechSynthesis.cancel();
                  const speech = new SpeechSynthesisUtterance(card.question);
                  speech.lang = "fr-FR";
                  speechSynthesis.speak(speech);
                }}
              >
                <SpeakerHigh size={21} />
              </button>
            )}
            <FavoriteButton
              active={favorite}
              onClick={() =>
                store.update((p) => ({
                  ...p,
                  favorites: favorite
                    ? p.favorites.filter((x) => x !== card.id)
                    : [...p.favorites, card.id],
                }))
              }
            />
          </div>
        </div>
        {mode === "flashcards" ? (
          <button
            className="flip-area"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Revoir la question" : "Retourner la carte"}
          >
            <span className="card-side-label">
              {revealed ? "LE DÉCLIC" : "À TOI DE TE SOUVENIR"}
            </span>
            <h2>{revealed ? card.answer : card.question}</h2>
            {revealed ? (
              <p>{card.explanation}</p>
            ) : (
              <div className="flip-hint">
                <ArrowsClockwise size={19} />
                Touche la carte pour voir la réponse
              </div>
            )}
          </button>
        ) : (
          <div className="question-area">
            <span className="card-side-label">
              QUESTION {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{card.question}</h2>
            {mode === "quiz" ? (
              <div className="quiz-choices">
                {card.choices.map((choice, i) => (
                  <button
                    key={i}
                    disabled={selected !== null}
                    className={`quiz-choice ${selected !== null && i === card.correct ? "correct" : selected === i ? "incorrect" : ""}`}
                    onClick={() => {
                      setSelected(i);
                      setRevealed(true);
                    }}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {choice}
                    {selected !== null && i === card.correct ? (
                      <CheckCircle size={21} weight="fill" />
                    ) : selected === i ? (
                      <X size={21} />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <label className="sr-only" htmlFor="qa-answer">
                  Ta réponse
                </label>
                <textarea
                  id="qa-answer"
                  value={answer}
                  disabled={revealed}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Prends un instant. Comment l’expliquerais-tu à quelqu’un ?"
                  rows={5}
                />
                <span className="small muted">
                  Réponse libre · L’objectif est de retrouver la notion.
                </span>
              </>
            )}
            {revealed && (
              <div
                className={`answer-explanation ${mode === "quiz" && selected !== card.correct ? "needs-work" : ""}`}
                role="status"
              >
                <Lightbulb size={23} />
                <div>
                  <h3>
                    {mode === "qa"
                      ? card.answer
                      : selected === card.correct
                        ? "Exactement !"
                        : "La bonne réponse : " + card.choices[card.correct]}
                  </h3>
                  <p>{card.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {mode === "flashcards" ? (
        revealed ? (
          <div className="rating-controls">
            <p>Comment l’avais-tu en mémoire ?</p>
            <div>
              {(
                [
                  { grade: "again", text: "À revoir", sub: "Dans 10 min" },
                  { grade: "hard", text: "Difficile", sub: "Un peu plus tôt" },
                  { grade: "good", text: "Bien", sub: "On espace" },
                  { grade: "easy", text: "Facile", sub: "Bien ancrée" },
                ] as const
              ).map((g) => (
                <button
                  className={`rating ${g.grade}`}
                  key={g.grade}
                  onClick={() => next(g.grade !== "again", g.grade)}
                >
                  <b>{g.text}</b>
                  <span>{g.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            className="button primary reveal-button"
            onClick={() => setRevealed(true)}
          >
            <Eye size={19} />
            Voir la réponse
          </button>
        )
      ) : mode === "quiz" ? (
        <div className="session-bottom">
          <span>
            {correctCount} bonne{correctCount > 1 ? "s" : ""} réponse
            {correctCount > 1 ? "s" : ""} validée{correctCount > 1 ? "s" : ""}
          </span>
          <button
            className="button primary"
            disabled={selected === null}
            onClick={() => next(selected === card.correct)}
          >
            {index === cards.length - 1
              ? "Voir mon résultat"
              : "Question suivante"}
            <ArrowRight size={18} />
          </button>
        </div>
      ) : revealed ? (
        <div className="qa-grade">
          <p>Compare ta réponse avec l’explication, puis évalue-toi.</p>
          <button
            className="button secondary"
            onClick={() => next(false, "again")}
          >
            À retravailler
          </button>
          <button className="button primary" onClick={() => next(true, "good")}>
            J’avais la bonne idée
            <Check size={18} />
          </button>
        </div>
      ) : (
        <button
          className="button primary reveal-button"
          onClick={() => setRevealed(true)}
          disabled={!answer.trim()}
        >
          <Eye size={19} />
          Comparer ma réponse
        </button>
      )}
      {mode === "flashcards" && (
        <p className="keyboard-hint">
          Sur ordinateur, la touche espace retourne la carte.
        </p>
      )}
    </>
  );
}
interface ExamDraft {
  id: string;
  deadline: number;
  answers: Record<string, string>;
  submitted: boolean;
  checks: Record<string, boolean>;
  questionIds: string[];
}
function ExamSession({
  store,
  exams,
  title,
  scope,
}: {
  store: Store;
  exams: StudyExam[];
  title: string;
  scope: string;
}) {
  const draftKey = `memora.exam.${scope}`;
  const makeDraft = (): ExamDraft => ({
    id: crypto.randomUUID(),
    deadline: Date.now() + exams.length * 5 * 60000,
    answers: {},
    submitted: false,
    checks: {},
    questionIds: exams.map((e) => e.id),
  });
  const [draft, setDraft] = useState<ExamDraft>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (
        raw &&
        typeof raw.id === "string" &&
        Number.isFinite(raw.deadline) &&
        typeof raw.submitted === "boolean" &&
        raw.answers &&
        typeof raw.answers === "object" &&
        Object.values(raw.answers).every((a) => typeof a === "string") &&
        raw.checks &&
        typeof raw.checks === "object" &&
        Object.values(raw.checks).every((a) => typeof a === "boolean") &&
        JSON.stringify(raw.questionIds) ===
          JSON.stringify(exams.map((e) => e.id)) &&
        !store.progress.results.some((r) => r.id === raw.id)
      )
        return raw;
    } catch {
      /* Ignore an invalid draft. */
    }
    return makeDraft();
  });
  const [remaining, setRemaining] = useState(
    Math.max(0, draft.deadline - Date.now()),
  );
  const [confirm, setConfirm] = useState(false),
    [done, setDone] = useState(false),
    [saveError, setSaveError] = useState(false);
  useEffect(() => {
    if (done) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [draft, draftKey, done]);
  useEffect(() => {
    if (draft.submitted || done) return;
    const tick = () => {
      const left = Math.max(0, draft.deadline - Date.now());
      setRemaining(left);
      if (left === 0) setDraft((d) => ({ ...d, submitted: true }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [draft.deadline, draft.submitted, done]);
  const totalPoints = exams.reduce((sum, e) => sum + e.rubric.length, 0);
  const earned = exams.reduce(
    (sum, e) =>
      sum +
      (draft.answers[e.id]?.trim()
        ? e.rubric.filter((_, i) => draft.checks[`${e.id}-${i}`]).length
        : 0),
    0,
  );
  const score = Math.round((earned / totalPoints) * 100);
  const finish = () => {
    const result: Result = {
      id: draft.id,
      mode: "exam",
      title,
      date: Date.now(),
      score,
      total: exams.length,
    };
    store.update((p) =>
      p.results.some((r) => r.id === result.id)
        ? p
        : saveResult(
            addActivity(
              p,
              exams.filter((e) => draft.answers[e.id]?.trim()).length,
            ),
            result,
          ),
    );
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* Result is also persisted in the progress store. */
    }
    setDone(true);
  };
  if (done)
    return (
      <ResultScreen
        mode="exam"
        total={exams.length}
        score={score}
        title={title}
        retry={() => {
          const next = makeDraft();
          setDraft(next);
          setRemaining(next.deadline - Date.now());
          setDone(false);
        }}
      />
    );
  return (
    <>
      <div className="exam-heading">
        <div>
          <span className="eyebrow">EXAMEN BLANC · RÉPONSES RÉDIGÉES</span>
          <h1>
            {draft.submitted
              ? "Place à la correction."
              : "Fais le point sur tes acquis."}
          </h1>
          <p>
            {title} · {exams.length} question{exams.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className={`timer ${remaining < 60000 ? "urgent" : ""}`}>
          <Clock size={22} />
          {draft.submitted
            ? "Copie rendue"
            : `${Math.floor(remaining / 60000)
                .toString()
                .padStart(2, "0")}:${Math.floor((remaining / 1000) % 60)
                .toString()
                .padStart(2, "0")}`}
        </div>
      </div>
      <div className="exam-instructions">
        <PencilLine size={24} />
        <p>
          {draft.submitted
            ? "Lis le corrigé, puis coche uniquement les éléments présents dans ta réponse. La note est une autoévaluation, sans correction automatique."
            : "Prends le temps de structurer tes réponses. Elles sont sauvegardées sur cet appareil. Le chronomètre continue si tu quittes la page ; à la fin du temps, ta copie est rendue."}
        </p>
      </div>
      {saveError && (
        <p className="error-message" role="alert">
          La sauvegarde du brouillon est indisponible. Garde cette page ouverte.
        </p>
      )}
      {exams.map((exam, i) => (
        <section className="exam-question" key={exam.id}>
          <div className="exam-question-top">
            <span className="badge neutral">QUESTION {i + 1}</span>
            <span>
              {exam.rubric.length} points · {exam.chapterTitle}
            </span>
          </div>
          <h2>{exam.question}</h2>
          <label htmlFor={`answer-${exam.id}`}>
            {draft.submitted ? "Ta réponse" : "À toi de rédiger"}
          </label>
          <textarea
            id={`answer-${exam.id}`}
            rows={6}
            maxLength={15000}
            value={draft.answers[exam.id] || ""}
            readOnly={draft.submitted}
            placeholder="Explique ton raisonnement, les étapes et les notions importantes…"
            onChange={(e) => {
              if (Date.now() >= draft.deadline) {
                setDraft((d) => ({ ...d, submitted: true }));
                return;
              }
              setDraft((d) => ({
                ...d,
                answers: { ...d.answers, [exam.id]: e.target.value },
              }));
            }}
          />
          <span className="word-count">
            {
              (draft.answers[exam.id] || "").trim().split(/\s+/).filter(Boolean)
                .length
            }{" "}
            mots
          </span>
          {draft.submitted && (
            <div className="exam-correction">
              <h3>
                <CheckCircle size={21} />
                Proposition de corrigé
              </h3>
              <p>{exam.modelAnswer}</p>
              <h4>Dans ma réponse, j’ai bien expliqué…</h4>
              {exam.rubric.map((point, index) => (
                <label className="rubric-check" key={point}>
                  <input
                    type="checkbox"
                    disabled={!draft.answers[exam.id]?.trim()}
                    checked={
                      !!draft.checks[`${exam.id}-${index}`] &&
                      !!draft.answers[exam.id]?.trim()
                    }
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        checks: {
                          ...d.checks,
                          [`${exam.id}-${index}`]: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span>{point}</span>
                  <small>1 point</small>
                </label>
              ))}
              {!draft.answers[exam.id]?.trim() && (
                <span className="small muted">
                  Sans réponse, aucun point ne peut être attribué.
                </span>
              )}
            </div>
          )}
        </section>
      ))}
      <div className="exam-submit">
        {draft.submitted ? (
          <>
            <span>
              <b>
                {earned}/{totalPoints}
              </b>{" "}
              points autoévalués
            </span>
            <button className="button primary" onClick={finish}>
              Enregistrer mon résultat
              <Check size={19} />
            </button>
          </>
        ) : (
          <>
            <span>
              {exams.filter((e) => draft.answers[e.id]?.trim()).length}/
              {exams.length} réponses rédigées
            </span>
            <button className="button primary" onClick={() => setConfirm(true)}>
              Rendre ma copie
              <ArrowRight size={19} />
            </button>
          </>
        )}
      </div>
      {confirm && !draft.submitted && (
        <Modal
          title="Prêt à rendre ta copie ?"
          onClose={() => setConfirm(false)}
        >
          <p>
            Tu ne pourras plus modifier tes réponses. Le corrigé et la grille
            d’autoévaluation seront disponibles immédiatement.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setConfirm(false)}
            >
              Relire mes réponses
            </button>
            <button
              className="button primary"
              onClick={() => {
                setDraft((d) => ({ ...d, submitted: true }));
                setConfirm(false);
              }}
            >
              Rendre ma copie
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
