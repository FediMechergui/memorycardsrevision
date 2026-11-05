import { Capacitor } from "@capacitor/core";
import { z } from "zod";
import { profileInput, type Identity, type ProfileStyle } from "./classroom";
const identitySchema = z.object({
  profile: profileInput.extend({
    id: z.string().uuid(),
    invitation: z.string().uuid(),
  }),
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
const key = "memora.identity.v1";
export function readIdentity(): Identity | null {
  try {
    return identitySchema.parse(
      JSON.parse(localStorage.getItem(key) || "null"),
    );
  } catch {
    return null;
  }
}
export function saveIdentity(identity: Identity) {
  localStorage.setItem(key, JSON.stringify(identity));
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (Capacitor.isNativePlatform()
    ? "https://memora-revision-fedi.netlify.app"
    : "");
export async function api<T>(
  path: string,
  identity: Identity | null,
  data?: unknown,
  method?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE}/api/${path}`, {
    method: method || (data === undefined ? "GET" : "POST"),
    headers: {
      "Content-Type": "application/json",
      ...(identity
        ? {
            Authorization: `Bearer ${identity.token}`,
            "X-Memora-Profile": identity.profile.id,
          }
        : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      "Le service en ligne ne répond pas. Réessaie dans un instant.",
      response.status,
    );
  }
  if (!response.ok)
    throw new ApiError(
      result.error || "Connexion impossible.",
      response.status,
    );
  return result as T;
}
let creating: Promise<Identity> | null = null;
export async function ensureIdentity(style: ProfileStyle): Promise<Identity> {
  const saved = readIdentity();
  if (saved) return saved;
  if (!creating)
    creating = api<Identity>("profiles", null, style)
      .then((id) => {
        saveIdentity(id);
        return id;
      })
      .finally(() => {
        creating = null;
      });
  return creating;
}
