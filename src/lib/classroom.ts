import { z } from "zod";

export const avatarIds = [
  "mimo",
  "fox",
  "cat",
  "owl",
  "robot",
  "rocket",
] as const;
export const profileInput = z.object({
  name: z.string().trim().min(2).max(24),
  avatar: z.enum(avatarIds),
  color: z.enum(["mint", "lavender", "peach", "blue"]),
});
export type ProfileStyle = z.infer<typeof profileInput>;
export type Profile = ProfileStyle & { id: string; invitation: string };
export type Identity = { profile: Profile; token: string };
export const inviteSchema = z.object({
  kind: z.literal("memora-player"),
  v: z.literal(1),
  id: z.string().uuid(),
  invitation: z.string().uuid(),
});
export function profileQr(profile: Profile) {
  return JSON.stringify({
    kind: "memora-player",
    v: 1,
    id: profile.id,
    invitation: profile.invitation,
  });
}
export const roomSettingsSchema = z.object({
  scope: z.string().min(1).max(80),
  mode: z.enum(["sprint", "dice"]),
});
export type RoomSettings = z.infer<typeof roomSettingsSchema>;
export type Player = ProfileStyle & {
  id: string;
  accepted: boolean;
  active: boolean;
  score: number;
};
export type Submission = {
  playerId: string;
  text: string;
  receivedAt: number;
  verdict: boolean | null;
  points: number;
};
export type RoomView = {
  code: string;
  hostId: string;
  title: string;
  mode: RoomSettings["mode"];
  phase:
    | "lobby"
    | "ready"
    | "answering"
    | "judging"
    | "reveal"
    | "finished"
    | "closed";
  players: Player[];
  round: number;
  totalRounds: 10;
  presenterId: string | null;
  question?: string;
  answer?: string;
  explanation?: string;
  subject?: string;
  deadline?: number;
  serverNow: number;
  expiresAt: number;
  submissions: Submission[];
  answeredIds: string[];
  dice: number[];
  bonus: number;
  bonusLabel: string;
  skipped?: boolean;
};
export type RoomAction =
  | {
      type:
        | "accept"
        | "leave"
        | "start"
        | "open"
        | "reveal"
        | "next"
        | "skip"
        | "close";
      round: number;
    }
  | { type: "answer"; round: number; text: string }
  | { type: "judge"; round: number; playerId: string; correct: boolean };
export type Invitation = { code: string; host: string; title: string };
export const actionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum([
      "accept",
      "leave",
      "start",
      "open",
      "reveal",
      "next",
      "skip",
      "close",
    ]),
    round: z.number().int().min(-1).max(9),
  }),
  z.object({
    type: z.literal("answer"),
    round: z.number().int().min(0).max(9),
    text: z.string().trim().min(1).max(800),
  }),
  z.object({
    type: z.literal("judge"),
    round: z.number().int().min(0).max(9),
    playerId: z.string().uuid(),
    correct: z.boolean(),
  }),
]);
export const aiFeedbackSchema = z.object({
  criteria: z
    .array(
      z.object({ met: z.boolean(), feedback: z.string().min(1).max(1200) }),
    )
    .min(1)
    .max(8),
  summary: z.string().min(1).max(2000),
});
export type AiFeedback = z.infer<typeof aiFeedbackSchema> & { model: string };
