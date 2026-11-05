import { useRef, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import type { Exam } from "../lib/content";
import { aiFeedbackSchema, type AiFeedback } from "../lib/classroom";
import { api, ensureIdentity } from "../lib/online";
export function AiCorrection({
  exam,
  answer,
  name,
  onApply,
}: {
  exam: Exam;
  answer: string;
  name: string;
  onApply: (criteria: boolean[]) => void;
}) {
  const [feedback, setFeedback] = useState<AiFeedback | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  return (
    <div className="ai-correction">
      <h4>
        <Sparkle size={20} />
        Un deuxième regard, avec l’IA
      </h4>
      <p className="small muted">
        En demandant cet avis, tu envoies cette réponse à OpenRouter et au
        fournisseur du modèle gratuit. L’avis peut se tromper : vérifie-le avec
        le corrigé avant de cocher ta grille.
      </p>
      {!feedback && (
        <button
          className="button secondary"
          disabled={busy || answer.trim().length < 10}
          onClick={async () => {
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              const identity = await ensureIdentity({
                name:
                  name.trim().length >= 2
                    ? name.trim().slice(0, 24)
                    : "Apprenant",
                avatar: "mimo",
                color: "mint",
              });
              const response = await api<AiFeedback>(
                "exam/feedback",
                identity,
                { examId: exam.id, answer },
              );
              const checked = aiFeedbackSchema.parse(response);
              if (checked.criteria.length !== exam.rubric.length)
                throw new Error("Grille IA incohérente. Utilise le corrigé.");
              setFeedback({ ...checked, model: response.model });
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "L’IA est indisponible.",
              );
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          {busy ? "Le tuteur lit ta réponse…" : "Demander un avis IA gratuit"}
        </button>
      )}
      {answer.trim().length < 10 && (
        <p className="small muted">
          Rédige au moins dix caractères pour demander un avis.
        </p>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {feedback && (
        <div className="ai-feedback">
          <p>
            <b>Avis indicatif</b> ·{" "}
            {feedback.criteria.filter((c) => c.met).length}/{exam.rubric.length}{" "}
            critères suggérés
          </p>
          <p>{feedback.summary}</p>
          <ul>
            {feedback.criteria.map((c, i) => (
              <li key={i}>
                <b>
                  {c.met ? "Retrouvé" : "À approfondir"} : {exam.rubric[i]}
                </b>
                <p>{c.feedback}</p>
              </li>
            ))}
          </ul>
          <span className="small muted">Modèle : {feedback.model}</span>
          <button
            className="button secondary"
            onClick={() => onApply(feedback.criteria.map((c) => c.met))}
          >
            Reporter ces suggestions dans ma grille
          </button>
          <p className="small muted">
            Tu peux modifier chaque case. Le résultat enregistré reste ton
            autoévaluation.
          </p>
        </div>
      )}
    </div>
  );
}
