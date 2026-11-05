import { Capacitor, CapacitorHttp, registerPlugin } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import { parseCatalog, type Catalog } from "./content";
export const APP_VERSION = "1.0.0";
export const isAndroid = Capacitor.getPlatform() === "android";
const updater = registerPlugin<{
  install(options: {
    url: string;
    sha256: string;
    repository: string;
  }): Promise<void>;
}>("ApkUpdater");
export interface Release {
  version: string;
  notes: string;
  url: string;
  apk?: { url: string; sha256: string };
}
export function parseRepository(value: string): string {
  const repo = value
    .trim()
    .replace(/^https:\/\/github\.com\//i, "")
    .replace(/\.git\/?$/, "")
    .replace(/\/$/, "");
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(
      repo,
    )
  )
    throw new Error("Indique un dépôt GitHub au format propriétaire/dépôt.");
  return repo;
}
export function newerVersion(candidate: string, installed: string): boolean {
  const parse = (v: string) =>
    /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)?.slice(1).map(Number);
  const a = parse(candidate),
    b = parse(installed);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}
async function getJson(url: string): Promise<unknown> {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({
      url,
      connectTimeout: 15000,
      readTimeout: 15000,
      responseType: "json",
      headers: { Accept: "application/json" },
    });
    if (res.status < 200 || res.status >= 300)
      throw new Error(
        res.status === 404
          ? "Aucune publication trouvée dans ce dépôt public."
          : `Le serveur répond ${res.status}. Réessaie plus tard.`,
      );
    return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
  }
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok)
    throw new Error(
      res.status === 404
        ? "Aucune publication trouvée dans ce dépôt public."
        : `Le serveur répond ${res.status}. Réessaie plus tard.`,
    );
  const body = await res.text();
  if (body.length > 5_000_000)
    throw new Error("Le catalogue dépasse la limite de 5 Mo.");
  return JSON.parse(body);
}
export async function checkRelease(
  repository: string,
): Promise<Release | null> {
  const repo = parseRepository(repository);
  const data = (await getJson(
    `https://api.github.com/repos/${repo}/releases/latest`,
  )) as Record<string, unknown>;
  const installed = isAndroid
    ? (await NativeApp.getInfo()).version
    : APP_VERSION;
  if (
    data.draft ||
    data.prerelease ||
    typeof data.tag_name !== "string" ||
    !newerVersion(data.tag_name, installed)
  )
    return null;
  const prefix = `https://github.com/${repo}/releases/download/`;
  const assets = Array.isArray(data.assets)
    ? (data.assets as {
        name: string;
        browser_download_url: string;
        digest?: string;
      }[])
    : [];
  const asset = assets.find(
    (a) =>
      a.name === "memora.apk" &&
      a.browser_download_url?.startsWith(prefix) &&
      /^sha256:[a-f0-9]{64}$/.test(a.digest || ""),
  );
  return {
    version: data.tag_name,
    notes: typeof data.body === "string" ? data.body.slice(0, 5000) : "",
    url: `https://github.com/${repo}/releases/latest`,
    apk: asset
      ? { url: asset.browser_download_url, sha256: asset.digest!.slice(7) }
      : undefined,
  };
}
export async function fetchCourseUpdate(repository: string): Promise<Catalog> {
  const repo = parseRepository(repository);
  const metadata = (await getJson(`https://api.github.com/repos/${repo}`)) as {
    default_branch?: unknown;
  };
  if (typeof metadata.default_branch !== "string")
    throw new Error("La branche du dépôt est introuvable.");
  return parseCatalog(
    await getJson(
      `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(metadata.default_branch)}/public/courses/catalog.json`,
    ),
  );
}
export async function installRelease(release: Release, repository: string) {
  if (!isAndroid || !release.apk)
    throw new Error("Ouvre la release GitHub pour télécharger cette version.");
  await updater.install({
    ...release.apk,
    repository: parseRepository(repository),
  });
}
