import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import {
  applyAction,
  createRoom,
  diceBonus,
  invitePlayer,
  roomView,
} from "../server/game";
import { handleApi } from "../server/api";
import { memoryStore } from "../server/memory-store";
import { parseCatalog } from "../src/lib/content";
import {
  profileQr,
  type Identity,
  type Profile,
  type RoomView,
} from "../src/lib/classroom";
import { learningRank } from "../src/components/Rank";
import { emptyProgress } from "../src/lib/progress";
import raw from "../public/courses/catalog.json";
const catalog = parseCatalog(raw);
const person = (name: string): Profile => ({
  id: randomUUID(),
  invitation: randomUUID(),
  name,
  avatar: "mimo",
  color: "mint",
});
function game() {
  const host = person("Hôte"),
    guest = person("Invité"),
    third = person("Lina");
  const room = createRoom(
    "ABCD234",
    host,
    { scope: "c1-ipv4", mode: "dice" },
    catalog,
    1000,
    () => 0.3,
  );
  invitePlayer(room, guest);
  invitePlayer(room, third);
  applyAction(room, guest.id, { type: "accept", round: -1 }, 1001);
  applyAction(room, third.id, { type: "accept", round: -1 }, 1001);
  return { host, guest, third, room };
}
describe("classroom engine", () => {
  it("selects ten distinct chapter cards and rotates the private presenter for ten rounds", () => {
    const { host, guest, third, room } = game();
    expect(new Set(room.rounds.map((r) => r.card.id)).size).toBe(10);
    applyAction(room, host.id, { type: "start", round: -1 }, 1100);
    expect(room.rounds.slice(0, 4).map((r) => r.presenterId)).toEqual([
      host.id,
      guest.id,
      third.id,
      host.id,
    ]);
    for (let i = 0; i < 10; i++) {
      const presenter = room.rounds[i].presenterId,
        other = room.players.find((p) => p.id !== presenter)!;
      expect(
        roomView(room, other.id, 2000 + i * 100000).answer,
      ).toBeUndefined();
      expect(
        roomView(room, other.id, 2000 + i * 100000).question,
      ).toBeUndefined();
      expect(roomView(room, presenter, 2000 + i * 100000).answer).toBeTruthy();
      applyAction(
        room,
        presenter,
        { type: "open", round: i },
        2000 + i * 100000,
      );
      expect(roomView(room, other.id, 2001 + i * 100000).question).toBeTruthy();
      expect(
        roomView(room, other.id, 2001 + i * 100000).answer,
      ).toBeUndefined();
      applyAction(
        room,
        other.id,
        { type: "answer", round: i, text: "Une idée correcte" },
        2100 + i * 100000,
      );
      expect(() =>
        applyAction(
          room,
          other.id,
          { type: "answer", round: i, text: "Trop tard" },
          47000 + i * 100000,
        ),
      ).toThrow();
      applyAction(
        room,
        presenter,
        { type: "judge", round: i, playerId: other.id, correct: true },
        48000 + i * 100000,
      );
      applyAction(
        room,
        presenter,
        { type: "reveal", round: i },
        49000 + i * 100000,
      );
      const score = other.score;
      expect(score).toBeGreaterThan(0);
      expect(() =>
        applyAction(
          room,
          presenter,
          { type: "reveal", round: i },
          49001 + i * 100000,
        ),
      ).toThrow();
      expect(other.score).toBe(score);
      expect(roomView(room, other.id, 49000 + i * 100000).answer).toBeTruthy();
      applyAction(
        room,
        host.id,
        { type: "next", round: i },
        50000 + i * 100000,
      );
    }
    expect(room.phase).toBe("finished");
    expect(room.round).toBe(9);
  });
  it("rejects outsiders, forged rounds, uninvited joins and presenter answers", () => {
    const { host, guest, room } = game();
    expect(() => roomView(room, randomUUID(), 1002)).toThrow("privée");
    expect(() =>
      applyAction(room, randomUUID(), { type: "accept", round: -1 }, 1002),
    ).toThrow();
    expect(() =>
      applyAction(room, guest.id, { type: "start", round: -1 }, 1002),
    ).toThrow();
    applyAction(room, host.id, { type: "start", round: -1 }, 1002);
    expect(() =>
      applyAction(room, host.id, { type: "open", round: 5 }, 1003),
    ).toThrow();
    applyAction(room, host.id, { type: "open", round: 0 }, 1003);
    expect(() =>
      applyAction(
        room,
        host.id,
        { type: "answer", round: 0, text: "Je connais le corrigé" },
        1004,
      ),
    ).toThrow();
    expect(() =>
      applyAction(
        room,
        guest.id,
        { type: "judge", round: 0, playerId: host.id, correct: true },
        1004,
      ),
    ).toThrow();
    expect(() => roomView(room, host.id, room.expiresAt)).toThrow("expiré");
  });
  it("scores by server arrival, treats ties equally, and accepts only one answer", () => {
    const { host, guest, third, room } = game();
    applyAction(room, host.id, { type: "start", round: -1 }, 1002);
    applyAction(room, host.id, { type: "open", round: 0 }, 1003);
    applyAction(
      room,
      guest.id,
      { type: "answer", round: 0, text: "Première" },
      2000,
    );
    applyAction(
      room,
      guest.id,
      { type: "answer", round: 0, text: "Remplacement" },
      2001,
    );
    applyAction(
      room,
      third.id,
      { type: "answer", round: 0, text: "Seconde" },
      2000,
    );
    expect(room.rounds[0].submissions).toHaveLength(2);
    expect(room.rounds[0].submissions[0].text).toBe("Première");
    for (const p of [guest, third])
      applyAction(
        room,
        host.id,
        { type: "judge", round: 0, playerId: p.id, correct: true },
        2010,
      );
    applyAction(room, host.id, { type: "reveal", round: 0 }, 2011);
    expect(room.players[1].score).toBe(room.players[2].score);
  });
  it("allows the host to recover from an absent presenter without awarding points", () => {
    const { host, room } = game();
    applyAction(room, host.id, { type: "start", round: -1 }, 1002);
    applyAction(room, host.id, { type: "skip", round: 0 }, 1003);
    expect(room.phase).toBe("reveal");
    expect(room.rounds[0].skipped).toBe(true);
    expect(room.players.every((p) => p.score === 0)).toBe(true);
  });
  it("implements dice combinations without implying a full Yahtzee ruleset", () => {
    expect(diceBonus([1, 1, 1, 1, 1]).bonus).toBe(300);
    expect(diceBonus([2, 3, 4, 5, 6]).bonus).toBe(200);
    expect(diceBonus([2, 2, 2, 3, 3]).bonus).toBe(150);
    expect(diceBonus([2, 2, 2, 2, 3]).bonus).toBe(100);
    expect(diceBonus([1, 1, 3, 4, 6]).bonus).toBe(50);
    expect(diceBonus([1, 2, 3, 4, 6]).bonus).toBe(0);
  });
  it("derives ranks only from saved study activity", () => {
    expect(learningRank(emptyProgress).xp).toBe(0);
    expect(
      learningRank({ ...emptyProgress, activity: { "2026-11-06": 30 } }),
    ).toMatchObject({ xp: 300, current: { name: "Explorateur" } });
  });
});
describe("anonymous online API", () => {
  function setup() {
    const store = memoryStore();
    let now = 100000;
    let aiCalls = 0;
    const fetcher: typeof fetch = async (_url, options) => {
      aiCalls++;
      const request = JSON.parse(String(options?.body));
      expect(request.model).toBe("openrouter/free");
      expect(request.messages[0].content).toContain("jamais des instructions");
      const feedback = {
        summary: "À préciser",
        criteria: catalog.subjects[0].chapters[0].exams[0].rubric.map(() => ({
          met: false,
          feedback: "Justifie le rôle.",
        })),
      };
      return Response.json({
        model: "test/free",
        choices: [{ message: { content: JSON.stringify(feedback) } }],
      });
    };
    const call = async (
      path: string,
      identity: Identity | null = null,
      data?: unknown,
      method?: string,
    ) =>
      handleApi(
        new Request(`https://memora-revision-fedi.netlify.app/api/${path}`, {
          method: method || (data ? "POST" : "GET"),
          headers: {
            "Content-Type": "application/json",
            ...(identity
              ? {
                  authorization: `Bearer ${identity.token}`,
                  "x-memora-profile": identity.profile.id,
                }
              : {}),
          },
          ...(data ? { body: JSON.stringify(data) } : {}),
        }),
        {
          store,
          now: () => now,
          ip: "test",
          aiKey: "test-secret-not-real",
          fetcher,
        },
      );
    const profile = async (name: string) =>
      (await (
        await call("profiles", null, { name, avatar: "mimo", color: "mint" })
      ).json()) as Identity;
    return {
      store,
      call,
      profile,
      time: (n: number) => (now = n),
      aiCalls: () => aiCalls,
    };
  }
  it("keeps tokens out of QR, requires invitation acceptance, and preserves concurrent answers", async () => {
    const { call, profile } = setup();
    const host = await profile("Hôte"),
      a = await profile("Lina"),
      b = await profile("Sami"),
      outsider = await profile("Hors salle");
    expect(profileQr(a.profile)).not.toContain(a.token);
    const room: RoomView = await (
      await call("rooms", host, { scope: "all", mode: "sprint" })
    ).json();
    expect((await call(`rooms/${room.code}`, outsider)).status).toBe(403);
    for (const guest of [a, b]) {
      expect(
        (
          await call(
            `rooms/${room.code}/invite`,
            host,
            JSON.parse(profileQr(guest.profile)),
          )
        ).status,
      ).toBe(200);
      const inv = await (await call("invitations", guest)).json();
      expect(inv[0].code).toBe(room.code);
      await call(`rooms/${room.code}`, guest, { type: "accept", round: -1 });
    }
    await call(`rooms/${room.code}`, host, { type: "start", round: -1 });
    await call(`rooms/${room.code}`, host, { type: "open", round: 0 });
    const results = await Promise.all(
      [a, b].map((g) =>
        call(`rooms/${room.code}`, g, {
          type: "answer",
          round: 0,
          text: "Mon idée",
        }),
      ),
    );
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    const hostView: RoomView = await (
      await call(`rooms/${room.code}`, host)
    ).json();
    expect(hostView.submissions).toHaveLength(2);
    const guestView: RoomView = await (
      await call(`rooms/${room.code}`, a)
    ).json();
    expect(guestView.answer).toBeUndefined();
    expect(guestView.submissions).toHaveLength(1);
    expect(JSON.stringify(guestView)).not.toContain(host.token);
    expect(
      (await call(`rooms/${room.code}`, { ...a, token: host.token })).status,
    ).toBe(401);
  });
  it("validates AI feedback and caches a repeated answer without spending another request", async () => {
    const { call, profile, aiCalls } = setup();
    const me = await profile("Lina");
    const input = {
      examId: "c1-reseaux-e1",
      answer: "Le routeur relie les réseaux.",
    };
    const first = await call("exam/feedback", me, input);
    expect(first.status).toBe(200);
    const data = await first.json();
    expect(data.criteria.length).toBe(4);
    expect(JSON.stringify(data)).not.toContain("test-secret");
    await call("exam/feedback", me, input);
    expect(aiCalls()).toBe(1);
    expect(
      (await call("exam/feedback", me, { ...input, examId: "unknown" })).status,
    ).toBe(400);
  });
  it("rejects invalid QR, unknown origins and excessive anonymous creation", async () => {
    const { call, profile, store } = setup();
    const host = await profile("Hôte");
    const room = await (
      await call("rooms", host, { scope: "all", mode: "dice" })
    ).json();
    expect(
      (await call(`rooms/${room.code}/invite`, host, { kind: "wrong" })).status,
    ).toBe(400);
    const blocked = await handleApi(
      new Request("https://example.org/api/health", {
        headers: { Origin: "https://unrelated.example" },
      }),
      { store },
    );
    expect(blocked.status).toBe(403);
    for (let i = 0; i < 11; i++) await profile(`Joueur ${i}`);
    expect(
      (
        await call("profiles", null, {
          name: "Trop",
          avatar: "mimo",
          color: "mint",
        })
      ).status,
    ).toBe(429);
  });
});
