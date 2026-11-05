import { useCallback, useState } from "react";
import { parseCatalog, type Catalog } from "./content";
import { emptyProgress, progressSchema, type Progress } from "./progress";
import initial from "../../public/courses/catalog.json";
const PROGRESS_KEY = "memora.progress.v1";
const CATALOG_KEY = "memora.catalog.v1";
function readProgress(): Progress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    const progress = stored
      ? progressSchema.parse(JSON.parse(stored))
      : emptyProgress;
    return {
      ...progress,
      repository: progress.repository || emptyProgress.repository,
    };
  } catch {
    return emptyProgress;
  }
}
function readCatalog(): Catalog {
  try {
    const stored = localStorage.getItem(CATALOG_KEY);
    if (stored) {
      const saved = parseCatalog(JSON.parse(stored));
      if (saved.version >= initial.version) return saved;
      return mergeCatalog(parseCatalog(initial), saved, false);
    }
  } catch {
    /* Invalid cached content falls back to bundled content. */
  }
  return parseCatalog(initial);
}
export function mergeCatalog(
  current: Catalog,
  incoming: Catalog,
  preferIncoming = true,
): Catalog {
  const subjects = [...current.subjects];
  for (const next of incoming.subjects) {
    const index = subjects.findIndex((s) => s.id === next.id);
    if (index < 0) {
      subjects.push(next);
      continue;
    }
    const old = subjects[index];
    const map = new Map(old.chapters.map((c) => [c.id, c]));
    for (const chapter of next.chapters)
      if (preferIncoming || !map.has(chapter.id)) map.set(chapter.id, chapter);
    subjects[index] = {
      ...(preferIncoming ? next : old),
      chapters: [...map.values()],
    };
  }
  return parseCatalog({
    ...current,
    version: Math.max(current.version, incoming.version),
    updatedAt:
      incoming.updatedAt > current.updatedAt
        ? incoming.updatedAt
        : current.updatedAt,
    subjects,
  });
}
export function useStore() {
  const [progress, setProgress] = useState(readProgress);
  const [catalog, setCatalog] = useState(readCatalog);
  const [storageError, setStorageError] = useState("");
  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((p) => {
      const next = fn(p);
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        setStorageError(
          "La sauvegarde locale est indisponible. Exporte ta progression depuis les réglages.",
        );
      }
      return next;
    });
  }, []);
  const importCatalog = useCallback(
    (incoming: Catalog) => {
      const next = mergeCatalog(catalog, incoming);
      localStorage.setItem(CATALOG_KEY, JSON.stringify(next));
      setCatalog(next);
    },
    [catalog],
  );
  return {
    catalog,
    progress,
    update,
    importCatalog,
    storageError,
    clearStorageError: () => setStorageError(""),
  };
}
export type Store = ReturnType<typeof useStore>;
