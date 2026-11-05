import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  Cat,
  DiceFive,
  Dog,
  GameController,
  Bird,
  QrCode,
  Robot,
  Rocket,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react";
import type { Store } from "../lib/storage";
import {
  avatarIds,
  inviteSchema,
  profileQr,
  type Identity,
  type Invitation,
  type Player,
  type Profile,
  type ProfileStyle,
  type RoomAction,
  type RoomView,
} from "../lib/classroom";
import { api, ensureIdentity, readIdentity, saveIdentity } from "../lib/online";
import { Mascot } from "./Mascot";
import { Modal, ProgressBar } from "./UI";
import { QrScanner } from "./QrScanner";
import "../styles-classroom.css";

const avatars = { fox: Dog, cat: Cat, owl: Bird, robot: Robot, rocket: Rocket };
export function Avatar({ profile }: { profile: ProfileStyle }) {
  const Icon = profile.avatar === "mimo" ? null : avatars[profile.avatar];
  return (
    <span className={`player-avatar ${profile.color}`}>
      {Icon ? (
        <Icon size={30} weight="duotone" />
      ) : (
        <span className="mini-mimo">
          m<span>••</span>
        </span>
      )}
    </span>
  );
}
function Scoreboard({ players, me }: { players: Player[]; me: string }) {
  const sorted = [...players]
    .filter((p) => p.accepted)
    .sort((a, b) => b.score - a.score);
  return (
    <ol className="scoreboard">
      {sorted.map((p) => (
        <li key={p.id} className={p.id === me ? "is-me" : ""}>
          <span className="rank-number">
            {sorted.filter((x) => x.score > p.score).length + 1}
          </span>
          <Avatar profile={p} />
          <span>
            <b>
              {p.name}
              {p.id === me ? " · toi" : ""}
            </b>
            <small>{p.active ? "En jeu" : "A quitté la salle"}</small>
          </span>
          <strong>
            {p.score}
            <small> pts</small>
          </strong>
        </li>
      ))}
    </ol>
  );
}
export function Classroom({ store }: { store: Store }) {
  const [identity, setIdentity] = useState(readIdentity);
  const [style, setStyle] = useState<ProfileStyle>(
    () =>
      readIdentity()?.profile || {
        name: store.progress.name || "",
        avatar: "mimo",
        color: "mint",
      },
  );
  const [room, setRoom] = useState<RoomView | null>(null),
    [roomCode, setRoomCode] = useState(
      () => localStorage.getItem("memora.room") || "",
    );
  const [invites, setInvites] = useState<Invitation[]>([]),
    [scope, setScope] = useState("all"),
    [mode, setMode] = useState<"sprint" | "dice">("sprint");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [scan, setScan] = useState(false),
    [edit, setEdit] = useState(!identity),
    [confirmSkip, setConfirmSkip] = useState(false);
  const [answer, setAnswer] = useState(""),
    [clock, setClock] = useState(Date.now()),
    [offset, setOffset] = useState(0);
  const lock = useRef(false);
  const revision = useRef(0);
  const setCurrentRoom = (next: RoomView) => {
    revision.current++;
    setRoom(next);
    setOffset(next.serverNow - Date.now());
    setRoomCode(next.code);
    localStorage.setItem("memora.room", next.code);
  };
  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Connexion interrompue. Réessaie.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };
  const leaveLocal = () => {
    revision.current++;
    setRoom(null);
    setRoomCode("");
    localStorage.removeItem("memora.room");
  };
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => setAnswer(""), [room?.round, room?.code]);
  useEffect(() => {
    if (!identity) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const version = revision.current;
      try {
        if (roomCode) {
          const current = await api<RoomView>(`rooms/${roomCode}`, identity);
          if (!stopped && version === revision.current) {
            setRoom(current);
            setOffset(current.serverNow - Date.now());
          }
        } else {
          const next = await api<Invitation[]>("invitations", identity);
          if (!stopped) setInvites(next);
        }
      } catch (err) {
        if (!stopped)
          setError(
            err instanceof Error ? err.message : "Connexion interrompue.",
          );
      }
      if (!stopped)
        timer = setTimeout(
          poll,
          document.hidden ? 8000 : roomCode ? 1500 : 3500,
        );
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [identity, roomCode]);
  const act = (action: RoomAction) =>
    run(async () => {
      if (!identity || !room) return;
      const next = await api<RoomView>(`rooms/${room.code}`, identity, action);
      setCurrentRoom(next);
    });
  const simple = (
    type: "accept" | "start" | "open" | "reveal" | "next" | "skip" | "close",
  ) => act({ type, round: room?.round ?? -1 });
  const saveProfile = () =>
    run(async () => {
      if (identity) {
        const profile = await api<Profile>("profile", identity, style, "PATCH");
        const next = { ...identity, profile };
        saveIdentity(next);
        setIdentity(next);
      } else {
        setIdentity(await ensureIdentity(style));
      }
      store.update((p) => ({ ...p, name: style.name.trim() }));
      setEdit(false);
    });
  const profileForm = (
    <div className="profile-form">
      <label className="field">
        Ton pseudo
        <input
          maxLength={24}
          minLength={2}
          value={style.name}
          onChange={(e) => setStyle((s) => ({ ...s, name: e.target.value }))}
          placeholder="Comment t’appelle-t-on ?"
        />
      </label>
      <fieldset>
        <legend>Ton compagnon</legend>
        <div className="avatar-options">
          {avatarIds.map((avatar) => (
            <button
              key={avatar}
              type="button"
              aria-label={`Avatar ${avatar}`}
              aria-pressed={style.avatar === avatar}
              onClick={() => setStyle((s) => ({ ...s, avatar }))}
            >
              <Avatar profile={{ ...style, avatar }} />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Ta couleur</legend>
        <div className="color-options">
          {(["mint", "lavender", "peach", "blue"] as const).map((color, i) => (
            <button
              key={color}
              className={color}
              aria-label={["Vert sauge", "Lavande", "Pêche", "Bleu"][i]}
              aria-pressed={style.color === color}
              onClick={() => setStyle((s) => ({ ...s, color }))}
            >
              {style.color === color ? "✓" : ""}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        className="button primary"
        disabled={busy || style.name.trim().length < 2}
        onClick={saveProfile}
      >
        {busy
          ? "Enregistrement…"
          : identity
            ? "Enregistrer mon profil"
            : "Créer mon profil et mon QR"}
        <ArrowRight size={18} />
      </button>
      <p className="small muted">
        Sans compte ni mot de passe. Ton profil reste associé à cet appareil.
        Ton pseudo et ton avatar sont visibles dans les salles que tu rejoins.
      </p>
    </div>
  );
  const me = identity?.profile.id || "",
    host = room?.hostId === me,
    presenter = room?.presenterId === me;
  const player = room?.players.find((p) => p.id === me),
    lead = room?.players.find((p) => p.id === room.presenterId);
  const sent = room?.answeredIds.includes(me);
  const seconds = room?.deadline
    ? Math.max(0, Math.ceil((room.deadline - clock - offset) / 1000))
    : 45;
  return (
    <div className="classroom">
      <div className="page-heading">
        <span className="eyebrow">LE SALON MIMO · MULTIJOUEUR</span>
        <h1>
          {room
            ? room.phase === "finished"
              ? "La classe a parlé !"
              : `Salle ${room.code}`
            : "Les révisions se jouent ensemble."}
        </h1>
        <p>
          {room
            ? `${room.title} · ${room.mode === "dice" ? "Dés du savoir" : "Sprint"}`
            : "Un QR, quelques amis et dix manches pour faire travailler les idées."}
        </p>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
          <button className="text-link" onClick={() => setError("")}>
            Masquer
          </button>
          {roomCode && (
            <button className="button secondary" onClick={leaveLocal}>
              Revenir au salon
            </button>
          )}
        </div>
      )}
      {!navigator.onLine && (
        <p className="notice">
          Le salon a besoin d’Internet. Les fiches et les révisions restent
          disponibles hors connexion.
        </p>
      )}
      {!identity ? (
        <div className="classroom-intro">
          <section className="panel">
            <h2>Ta place dans la classe.</h2>
            {profileForm}
          </section>
          <div className="classroom-welcome">
            <Mascot />
            <h2>À tour de rôle, c’est toi le meneur.</h2>
            <p>
              Toi seul vois le corrigé. Les autres tapent leur réponse ; tu
              valides les idées justes, puis les points récompensent les plus
              rapides.
            </p>
            <span className="badge mint">2 à 12 joueurs · 10 manches</span>
          </div>
        </div>
      ) : !roomCode ? (
        <>
          <div className="classroom-home">
            <section className={`profile-pass ${identity.profile.color}`}>
              <div className="profile-pass-heading">
                <Avatar profile={identity.profile} />
                <div>
                  <span className="eyebrow">MON PASSEPORT</span>
                  <h2>{identity.profile.name}</h2>
                </div>
              </div>
              <div className="personal-qr">
                <QRCodeSVG
                  value={profileQr(identity.profile)}
                  size={192}
                  marginSize={4}
                  title={`QR personnel de ${identity.profile.name}`}
                />
              </div>
              <p>L’hôte scanne ce QR pour t’inviter.</p>
              <details>
                <summary>Afficher mon code personnel</summary>
                <textarea
                  readOnly
                  aria-label="Mon code personnel"
                  value={profileQr(identity.profile)}
                  rows={4}
                  onFocus={(e) => e.target.select()}
                />
              </details>
              <button
                className="button secondary"
                onClick={() => {
                  setStyle(identity.profile);
                  setEdit(true);
                }}
              >
                Personnaliser mon profil
              </button>
            </section>
            <section className="room-create panel">
              <span className="eyebrow">C’EST TOI QUI INVITES</span>
              <h2>On lance une partie ?</h2>
              <label className="field">
                Terrain de jeu
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                >
                  <option value="all">Mashup fou · toutes les matières</option>
                  {store.catalog.subjects.map((s) => (
                    <optgroup key={s.id} label={s.title}>
                      <option value={s.id}>Tout {s.title}</option>
                      {s.chapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <div className="game-mode-options">
                <button
                  aria-pressed={mode === "sprint"}
                  onClick={() => setMode("sprint")}
                >
                  <GameController size={28} />
                  <b>Sprint</b>
                  <span>La bonne idée, le plus vite.</span>
                </button>
                <button
                  aria-pressed={mode === "dice"}
                  onClick={() => setMode("dice")}
                >
                  <DiceFive size={28} />
                  <b>Dés du savoir</b>
                  <span>Cinq dés, un bonus commun.</span>
                </button>
              </div>
              <p className="small muted">
                45 secondes par question. Une réponse par joueur. Le meneur
                vérifie le sens, même si les mots diffèrent. Les arrivées sont
                départagées par le serveur.
              </p>
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    setCurrentRoom(
                      await api<RoomView>("rooms", identity, { scope, mode }),
                    ),
                  )
                }
              >
                Créer une salle
                <ArrowRight size={18} />
              </button>
            </section>
          </div>
          <section className="invitations panel">
            <h2>
              <UsersThree size={24} />
              Mes invitations
            </h2>
            {invites.length ? (
              invites.map((invite) => (
                <div className="invitation-row" key={invite.code}>
                  <div>
                    <b>{invite.host} t’invite</b>
                    <p>
                      {invite.title} · {invite.code}
                    </p>
                  </div>
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const next = await api<RoomView>(
                          `rooms/${invite.code}`,
                          identity,
                          { type: "accept", round: -1 },
                        );
                        setCurrentRoom(next);
                      })
                    }
                  >
                    Rejoindre
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">
                En attente d’une invitation… Garde ce salon ouvert pendant que
                l’hôte scanne ton QR.
              </p>
            )}
          </section>
        </>
      ) : !room ? (
        <p role="status">Connexion à ta salle…</p>
      ) : (
        <>
          <div className="room-toolbar">
            <span className="badge neutral">
              {room.phase === "lobby"
                ? "SALLE D’ATTENTE"
                : `MANCHE ${room.round + 1} / 10`}
            </span>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (room.phase !== "closed")
                    await api(`rooms/${room.code}`, identity, {
                      type: "leave",
                      round: room.round,
                    });
                  leaveLocal();
                })
              }
            >
              {host && room.phase !== "finished"
                ? "Fermer et quitter"
                : "Quitter la salle"}
            </button>
          </div>
          {room.phase === "lobby" ? (
            <section className="panel lobby">
              <h2>
                {host
                  ? "Rassemble ta petite équipe."
                  : "Tout le monde se prépare."}
              </h2>
              <p>
                {host
                  ? "Scanne le QR de chaque joueur. Ils acceptent ensuite l’invitation sur leur appareil."
                  : "L’hôte lancera les dix manches quand la classe sera prête."}
              </p>
              <ul className="lobby-players">
                {room.players
                  .filter((p) => p.active)
                  .map((p) => (
                    <li key={p.id}>
                      <Avatar profile={p} />
                      <b>{p.name}</b>
                      <span
                        className={`badge ${p.accepted ? "mint" : "neutral"}`}
                      >
                        {p.accepted ? "Prêt" : "Invitation envoyée"}
                      </span>
                    </li>
                  ))}
              </ul>
              {!player?.accepted && (
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => simple("accept")}
                >
                  Accepter l’invitation
                </button>
              )}
              {host && (
                <div className="room-actions">
                  <button
                    className="button secondary"
                    onClick={() => setScan(true)}
                  >
                    <QrCode size={20} />
                    Scanner un joueur
                  </button>
                  <button
                    className="button primary"
                    disabled={
                      busy ||
                      room.players.filter((p) => p.active && p.accepted)
                        .length < 2
                    }
                    onClick={() => simple("start")}
                  >
                    Lancer les 10 manches
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </section>
          ) : room.phase === "closed" ? (
            <section className="panel">
              <h2>La salle est fermée.</h2>
              <p>L’hôte a quitté ou il ne reste plus assez de joueurs.</p>
              <button className="button primary" onClick={leaveLocal}>
                Retour au salon
              </button>
            </section>
          ) : room.phase === "finished" ? (
            <section className="panel final-podium">
              <Trophy size={52} weight="duotone" />
              <h2>
                {[...room.players]
                  .filter(
                    (p) =>
                      p.score === Math.max(...room.players.map((x) => x.score)),
                  )
                  .map((p) => p.name)
                  .join(" & ")}{" "}
                en tête
              </h2>
              <p>
                Dix manches, des idées partagées. Voici les points réellement
                gagnés dans cette partie.
              </p>
              <Scoreboard players={room.players} me={me} />
              <button className="button primary" onClick={leaveLocal}>
                Nouvelle partie
              </button>
            </section>
          ) : (
            <div className="room-game-layout">
              <section className="panel round-panel">
                <div className="round-heading">
                  <span className="badge mint">
                    {presenter
                      ? "TU ES LE MENEUR"
                      : `${lead?.name} mène la manche`}
                  </span>
                  {room.phase === "answering" && (
                    <strong className={seconds < 10 ? "urgent" : ""}>
                      {seconds} s
                    </strong>
                  )}
                </div>
                {room.dice.length > 0 && (
                  <div
                    className="dice-tray"
                    aria-label={`${room.bonusLabel}, bonus ${room.bonus} points`}
                  >
                    <div>
                      {room.dice.map((d, i) => (
                        <span
                          key={i}
                          className="die"
                          aria-label={`Dé ${i + 1} : ${d}`}
                        >
                          {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][d]}
                        </span>
                      ))}
                    </div>
                    <span>
                      {room.bonusLabel} · +{room.bonus} points par bonne réponse
                    </span>
                  </div>
                )}
                <span className="eyebrow">{room.subject}</span>
                <h2>{room.question || "La question arrive…"}</h2>
                {room.answer && (
                  <div className="private-answer">
                    <span className="eyebrow">
                      {room.phase === "reveal"
                        ? "LE CORRIGÉ"
                        : "POUR TOI SEULEMENT"}
                    </span>
                    <h3>{room.answer}</h3>
                    <p>{room.explanation}</p>
                  </div>
                )}
                {room.phase === "ready" &&
                  (presenter ? (
                    <>
                      <p>
                        Lis la question à voix haute, puis ouvre la saisie. Tu
                        valideras les réponses après le chronomètre.
                      </p>
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={() => simple("open")}
                      >
                        Ouvrir les 45 secondes
                      </button>
                    </>
                  ) : (
                    <p>
                      Prépare-toi. {lead?.name} lit la question et ouvrira la
                      saisie.
                    </p>
                  ))}
                {room.phase === "answering" && (
                  <>
                    <ProgressBar value={(seconds / 45) * 100} />
                    {presenter ? (
                      <p>
                        {room.answeredIds.length} réponse(s) reçue(s). Tu
                        corrigeras quand chacun aura répondu ou à la fin des 45
                        secondes.
                      </p>
                    ) : sent ? (
                      <p role="status" className="answer-sent">
                        Réponse envoyée. Le meneur vérifiera ton idée.
                      </p>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void act({
                            type: "answer",
                            round: room.round,
                            text: answer,
                          });
                        }}
                      >
                        <label className="field">
                          Ta réponse rapide
                          <textarea
                            autoFocus
                            rows={3}
                            maxLength={800}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="L’idée juste, avec tes mots…"
                          />
                        </label>
                        <button
                          className="button primary"
                          disabled={busy || !answer.trim() || seconds === 0}
                        >
                          Envoyer ma réponse
                          <ArrowRight size={18} />
                        </button>
                      </form>
                    )}
                  </>
                )}
                {room.phase === "judging" &&
                  (presenter ? (
                    <>
                      <h3>À toi de valider le sens.</h3>
                      <p className="small muted">
                        Accepte les reformulations correctes. La vitesse
                        départage les réponses validées.
                      </p>
                      {room.submissions.map((s) => (
                        <div className="judge-answer" key={s.playerId}>
                          <b>
                            {
                              room.players.find((p) => p.id === s.playerId)
                                ?.name
                            }
                          </b>
                          <p>{s.text}</p>
                          <div>
                            <button
                              disabled={busy}
                              className={`button ${s.verdict === true ? "primary" : "secondary"}`}
                              aria-pressed={s.verdict === true}
                              onClick={() =>
                                act({
                                  type: "judge",
                                  round: room.round,
                                  playerId: s.playerId,
                                  correct: true,
                                })
                              }
                            >
                              Bonne idée
                            </button>
                            <button
                              disabled={busy}
                              className={`button ${s.verdict === false ? "primary" : "secondary"}`}
                              aria-pressed={s.verdict === false}
                              onClick={() =>
                                act({
                                  type: "judge",
                                  round: room.round,
                                  playerId: s.playerId,
                                  correct: false,
                                })
                              }
                            >
                              À revoir
                            </button>
                          </div>
                        </div>
                      ))}
                      {room.submissions.length === 0 && (
                        <p>Aucune réponse reçue cette fois.</p>
                      )}
                      <button
                        className="button primary"
                        disabled={
                          busy ||
                          room.submissions.some((s) => s.verdict === null)
                        }
                        onClick={() => simple("reveal")}
                      >
                        Révéler le corrigé et les points
                      </button>
                    </>
                  ) : (
                    <p role="status">
                      Saisie terminée. {lead?.name} vérifie les réponses.
                    </p>
                  ))}
                {room.phase === "reveal" && (
                  <>
                    {room.skipped && (
                      <p className="notice">
                        Manche passée par l’hôte. Aucun point attribué.
                      </p>
                    )}
                    {room.submissions.map((s) => (
                      <div className="round-result" key={s.playerId}>
                        <b>
                          {room.players.find((p) => p.id === s.playerId)?.name}
                        </b>
                        <p>{s.text}</p>
                        <span
                          className={`badge ${s.verdict ? "mint" : "neutral"}`}
                        >
                          +{s.points} pts · {s.verdict ? "Validée" : "À revoir"}
                        </span>
                      </div>
                    ))}
                    {host ? (
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={() => simple("next")}
                      >
                        {room.round === 9
                          ? "Voir le classement final"
                          : "Manche suivante"}
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <p>L’hôte prépare la suite.</p>
                    )}
                  </>
                )}
                {host &&
                  ["ready", "answering", "judging"].includes(room.phase) && (
                    <button
                      className="text-link skip-round"
                      onClick={() => setConfirmSkip(true)}
                    >
                      Meneur absent ? Passer cette manche
                    </button>
                  )}
              </section>
              <aside className="panel room-scores">
                <h2>
                  <Trophy size={24} />
                  Le classement
                </h2>
                <Scoreboard players={room.players} me={me} />
                <details>
                  <summary>Comment gagner des points ?</summary>
                  <p>
                    Une bonne réponse rapporte 1 000 points à la première
                    arrivée, puis 800, 600, 400 et au moins 200. Deux réponses
                    reçues au même instant partagent la place. Le meneur ne
                    marque pas pendant son tour.
                  </p>
                  <p>
                    Mode dés : paire +50, brelan ou carré +100, full +150,
                    grande suite +200, quinte +300. Le même lancer s’applique à
                    toute la manche.
                  </p>
                </details>
              </aside>
            </div>
          )}
        </>
      )}
      {identity && edit && (
        <Modal title="Mon profil" onClose={() => setEdit(false)}>
          {profileForm}
        </Modal>
      )}
      {scan && room && (
        <QrScanner
          onClose={() => setScan(false)}
          onRead={(value) => {
            setScan(false);
            void run(async () => {
              let invite;
              try {
                invite = inviteSchema.parse(JSON.parse(value));
              } catch {
                throw new Error(
                  "Ce QR n’est pas un profil Mémora. Demande au joueur d’ouvrir son salon.",
                );
              }
              setCurrentRoom(
                await api<RoomView>(
                  `rooms/${room.code}/invite`,
                  identity,
                  invite,
                ),
              );
            });
          }}
        />
      )}
      {confirmSkip && (
        <Modal
          title="Passer cette manche ?"
          onClose={() => setConfirmSkip(false)}
        >
          <p>
            Le corrigé sera révélé et personne ne marquera de points pour cette
            manche.
          </p>
          <button
            className="button primary"
            disabled={busy}
            onClick={() => {
              setConfirmSkip(false);
              simple("skip");
            }}
          >
            Passer sans points
          </button>
        </Modal>
      )}
    </div>
  );
}
