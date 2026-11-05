import { useEffect, useState } from "react";
import {
  checkRelease,
  installRelease,
  isAndroid,
  type Release,
} from "../lib/updates";
export function AndroidUpdates({ repository }: { repository: string }) {
  const [release, setRelease] = useState<Release | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!isAndroid) return;
    let stopped = false;
    const check = async () => {
      try {
        const last = Number(localStorage.getItem("memora.update-check") || 0);
        if (Date.now() - last < 12 * 3600000) return;
        const next = await checkRelease(repository);
        if (!stopped) {
          localStorage.setItem("memora.update-check", String(Date.now()));
          setRelease(next);
        }
      } catch {
        /* A failed background check must not block offline study. */
      }
    };
    void check();
    window.addEventListener("online", check);
    return () => {
      stopped = true;
      window.removeEventListener("online", check);
    };
  }, [repository]);
  if (!release) return null;
  return (
    <div className="update-banner" role="status">
      <b>Mémora {release.version} est disponible</b>
      <span>Tes cours, ton profil et ta progression sont conservés.</span>
      {error && <span>{error}</span>}
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await installRelease(release, repository);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Vérification de l’APK…" : "Télécharger la mise à jour"}
      </button>
      <button onClick={() => setRelease(null)}>Plus tard</button>
    </div>
  );
}
