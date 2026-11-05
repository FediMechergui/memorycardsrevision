import { Medal } from "@phosphor-icons/react";
import type { Progress } from "../lib/progress";
import { ProgressBar } from "./UI";
export const ranks = [
  { name: "Curieux", xp: 0 },
  { name: "Explorateur", xp: 250 },
  { name: "Technicien", xp: 1000 },
  { name: "Architecte", xp: 2500 },
  { name: "Expert en devenir", xp: 5000 },
];
export function learningRank(progress: Progress) {
  const xp = Object.values(progress.activity).reduce((a, b) => a + b, 0) * 10;
  const index = ranks.filter((r) => xp >= r.xp).length - 1;
  return { xp, current: ranks[index], next: ranks[index + 1] };
}
export function Rank({ progress }: { progress: Progress }) {
  const { xp, current, next } = learningRank(progress);
  return (
    <section className="rank-banner">
      <Medal size={46} weight="duotone" />
      <div>
        <span className="eyebrow">TON RANG DE RÉVISION</span>
        <h2>{current.name}</h2>
        <p>{xp} XP · 10 XP par notion travaillée enregistrée.</p>
        {next && (
          <>
            <ProgressBar
              value={((xp - current.xp) / (next.xp - current.xp)) * 100}
            />
            <small>
              Encore {next.xp - xp} XP avant {next.name}.
            </small>
          </>
        )}
        <p className="small muted">
          Un repère de régularité, pas une certification de compétence.
        </p>
      </div>
    </section>
  );
}
