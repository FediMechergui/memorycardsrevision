import type { Card, Catalog } from "../src/lib/content";
import type {
  Player,
  Profile,
  RoomAction,
  RoomSettings,
  RoomView,
  Submission,
} from "../src/lib/classroom";

export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export type Round = {
  card: Card;
  subject: string;
  presenterId: string;
  deadline?: number;
  submissions: Submission[];
  dice: number[];
  skipped?: boolean;
};
export type Room = {
  code: string;
  hostId: string;
  title: string;
  settings: RoomSettings;
  players: Player[];
  phase: RoomView["phase"];
  round: number;
  rounds: Round[];
  createdAt: number;
  expiresAt: number;
};
function requireGame(
  condition: unknown,
  message: string,
  status = 409,
): asserts condition {
  if (!condition) throw new GameError(message, status);
}
export function diceBonus(dice: number[]) {
  if (!dice.length) return { bonus: 0, bonusLabel: "Sprint" };
  const counts = [...new Set(dice)]
    .map((n) => dice.filter((d) => d === n).length)
    .sort((a, b) => b - a);
  const sorted = [...new Set(dice)].sort().join("");
  if (counts[0] === 5) return { bonus: 300, bonusLabel: "Quinte !" };
  if (sorted === "12345" || sorted === "23456")
    return { bonus: 200, bonusLabel: "Grande suite" };
  if (counts[0] === 3 && counts[1] === 2)
    return { bonus: 150, bonusLabel: "Full" };
  if (counts[0] >= 3)
    return { bonus: 100, bonusLabel: counts[0] === 4 ? "Carré" : "Brelan" };
  if (counts[0] === 2) return { bonus: 50, bonusLabel: "Paire" };
  return { bonus: 0, bonusLabel: "Chance · sans bonus" };
}
export function createRoom(
  code: string,
  host: Profile,
  settings: RoomSettings,
  catalog: Catalog,
  now: number,
  random: () => number,
): Room {
  const pool = catalog.subjects.flatMap((s) =>
    s.chapters
      .filter(
        (c) =>
          settings.scope === "all" ||
          settings.scope === s.id ||
          settings.scope === c.id,
      )
      .flatMap((c) => c.cards.map((card) => ({ card, subject: s.title }))),
  );
  requireGame(
    pool.length >= 10,
    "Cette sélection doit contenir au moins dix cartes différentes.",
    400,
  );
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const subject = catalog.subjects.find((s) => s.id === settings.scope);
  const chapter = catalog.subjects
    .flatMap((s) => s.chapters)
    .find((c) => c.id === settings.scope);
  return {
    code,
    hostId: host.id,
    title: subject?.title || chapter?.title || "Mashup · toutes les matières",
    settings,
    players: [
      {
        id: host.id,
        name: host.name,
        avatar: host.avatar,
        color: host.color,
        accepted: true,
        active: true,
        score: 0,
      },
    ],
    phase: "lobby",
    round: -1,
    createdAt: now,
    expiresAt: now + 6 * 60 * 60 * 1000,
    rounds: pool
      .slice(0, 10)
      .map((q) => ({
        ...q,
        presenterId: "",
        submissions: [],
        dice:
          settings.mode === "dice"
            ? Array.from({ length: 5 }, () => 1 + Math.floor(random() * 6))
            : [],
      })),
  };
}
export function invitePlayer(room: Room, profile: Profile) {
  requireGame(room.phase === "lobby", "La partie a déjà commencé.");
  const old = room.players.find((p) => p.id === profile.id);
  if (old?.active) return;
  requireGame(
    room.players.filter((p) => p.active).length < 12,
    "La salle est limitée à 12 joueurs.",
  );
  const player: Player = {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    accepted: false,
    active: true,
    score: 0,
  };
  if (old) Object.assign(old, player);
  else room.players.push(player);
}
export function effectivePhase(room: Room, now: number): RoomView["phase"] {
  if (
    room.phase === "answering" &&
    now >= (room.rounds[room.round]?.deadline || 0)
  )
    return "judging";
  return room.phase;
}
export function applyAction(
  room: Room,
  userId: string,
  action: RoomAction,
  now: number,
) {
  requireGame(now < room.expiresAt, "Cette salle a expiré.", 410);
  const player = room.players.find((p) => p.id === userId && p.active);
  requireGame(player, "Tu ne fais pas partie de cette salle.", 403);
  if (action.type === "accept") {
    requireGame(room.phase === "lobby", "La partie a commencé.");
    player.accepted = true;
    return;
  }
  if (action.type === "leave") {
    player.active = false;
    if (
      userId === room.hostId ||
      (room.players.filter((p) => p.active && p.accepted).length < 2 &&
        room.phase !== "lobby")
    )
      room.phase = "closed";
    return;
  }
  requireGame(player.accepted, "Accepte d’abord l’invitation.", 403);
  const host = userId === room.hostId;
  if (action.type === "close") {
    requireGame(host, "Seul l’hôte peut fermer la salle.", 403);
    room.phase = "closed";
    return;
  }
  requireGame(
    room.phase !== "closed" && room.phase !== "finished",
    "Cette partie est terminée.",
  );
  requireGame(
    action.round === room.round,
    "La manche a changé. Actualise la salle.",
  );
  if (action.type === "start") {
    requireGame(
      host && room.phase === "lobby",
      "Seul l’hôte peut lancer cette partie.",
      403,
    );
    const players = room.players.filter((p) => p.accepted && p.active);
    requireGame(players.length >= 2, "Il faut au moins deux joueurs prêts.");
    room.players = players;
    room.rounds.forEach(
      (r, i) => (r.presenterId = players[i % players.length].id),
    );
    room.round = 0;
    room.phase = "ready";
    return;
  }
  const round = room.rounds[room.round];
  const presenter = userId === round.presenterId;
  const phase = effectivePhase(room, now);
  if (action.type === "open") {
    requireGame(
      presenter && phase === "ready",
      "Le meneur ouvre la question.",
      403,
    );
    round.deadline = now + 45000;
    room.phase = "answering";
    return;
  }
  if (action.type === "answer") {
    requireGame(
      !presenter && phase === "answering",
      "La saisie est fermée pour cette manche.",
    );
    if (round.submissions.some((s) => s.playerId === userId)) return;
    round.submissions.push({
      playerId: userId,
      text: action.text,
      receivedAt: now,
      verdict: null,
      points: 0,
    });
    if (
      room.players
        .filter((p) => p.active && p.accepted && p.id !== round.presenterId)
        .every((p) => round.submissions.some((s) => s.playerId === p.id))
    )
      room.phase = "judging";
    return;
  }
  if (action.type === "judge") {
    requireGame(
      presenter && phase === "judging",
      "Le meneur valide les réponses après la saisie.",
      403,
    );
    const response = round.submissions.find(
      (s) => s.playerId === action.playerId,
    );
    requireGame(response, "Réponse introuvable.", 404);
    response.verdict = action.correct;
    return;
  }
  if (action.type === "reveal") {
    requireGame(
      presenter && phase === "judging",
      "Le meneur termine la correction.",
      403,
    );
    requireGame(
      round.submissions.every((s) => s.verdict !== null),
      "Valide ou refuse chaque réponse avant de révéler.",
    );
    const correct = round.submissions
      .filter((s) => s.verdict)
      .sort(
        (a, b) =>
          a.receivedAt - b.receivedAt || a.playerId.localeCompare(b.playerId),
      );
    // Equal server timestamps share the same place; client clocks never affect scores.
    correct.forEach((s) => {
      const place = correct.filter(
        (other) => other.receivedAt < s.receivedAt,
      ).length;
      s.points =
        Math.max(200, 1000 - place * 200) + diceBonus(round.dice).bonus;
      const target = room.players.find((p) => p.id === s.playerId);
      if (target) target.score += s.points;
    });
    room.phase = "reveal";
    return;
  }
  if (action.type === "skip") {
    requireGame(host, "Seul l’hôte peut passer une manche.", 403);
    requireGame(
      ["ready", "judging", "answering"].includes(phase),
      "Cette manche est déjà terminée.",
    );
    round.skipped = true;
    round.submissions.forEach((s) => {
      s.verdict = false;
      s.points = 0;
    });
    room.phase = "reveal";
    return;
  }
  if (action.type === "next") {
    requireGame(
      host && phase === "reveal",
      "L’hôte passe à la manche suivante.",
      403,
    );
    if (room.round === 9) {
      room.phase = "finished";
      return;
    }
    room.round++;
    const next = room.rounds[room.round];
    if (!room.players.some((p) => p.id === next.presenterId && p.active))
      next.presenterId = room.players.filter((p) => p.active)[
        room.round % room.players.filter((p) => p.active).length
      ].id;
    room.phase = "ready";
  }
}
export function roomView(room: Room, userId: string, now: number): RoomView {
  requireGame(now < room.expiresAt, "Cette salle a expiré.", 410);
  const player = room.players.find((p) => p.id === userId && p.active);
  requireGame(player, "Cette salle est privée.", 403);
  const r = room.rounds[room.round];
  const phase = effectivePhase(room, now);
  const reveal = phase === "reveal" || phase === "finished";
  const presenter = r?.presenterId === userId;
  const visible = phase !== "ready" && phase !== "closed";
  return {
    code: room.code,
    hostId: room.hostId,
    title: room.title,
    mode: room.settings.mode,
    phase,
    players: room.players,
    round: room.round,
    totalRounds: 10,
    presenterId: r?.presenterId || null,
    serverNow: now,
    expiresAt: room.expiresAt,
    deadline: r?.deadline,
    question: r && (presenter || visible) ? r.card.question : undefined,
    answer: r && (presenter || reveal) ? r.card.answer : undefined,
    explanation: r && (presenter || reveal) ? r.card.explanation : undefined,
    subject: r?.subject,
    submissions:
      r?.submissions.filter(
        (s) => presenter || reveal || s.playerId === userId,
      ) || [],
    answeredIds: r?.submissions.map((s) => s.playerId) || [],
    dice: r?.dice || [],
    ...diceBonus(r?.dice || []),
    skipped: r?.skipped,
  };
}
