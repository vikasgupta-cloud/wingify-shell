import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CURRENT_USER } from "@/config/navigation";
import { nextVersionFoldKey } from "@/config/editorFirstFold";

export type EditorSaveAuthor = {
  name: string;
  initials: string;
};

export type EditorSaveVersion = {
  id: string;
  message: string;
  createdAt: number;
  author: EditorSaveAuthor;
  /** Key into VERSION_FIRST_FOLD — drives first-fold preview for this save. */
  foldKey: string;
};

type EditorSavesState = {
  versions: EditorSaveVersion[];
  activeVersionId: string | null;
  save: (message?: string) => EditorSaveVersion;
  /** Switch the editor to viewing / editing this version. */
  switchTo: (id: string) => void;
  /** Promote a historical version to a new latest working version. */
  restoreAsCurrent: (id: string) => EditorSaveVersion | null;
  exitToLatest: () => void;
};

function makeId() {
  return `save-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function currentAuthor(): EditorSaveAuthor {
  return {
    name: CURRENT_USER.name,
    initials: CURRENT_USER.initials,
  };
}

const SEED: EditorSaveVersion[] = [
  {
    id: "save-seed-3",
    message: "Adjusted hero headline spacing",
    createdAt: Date.now() - 1000 * 60 * 12,
    author: { name: CURRENT_USER.name, initials: CURRENT_USER.initials },
    foldKey: "headline-spacing",
  },
  {
    id: "save-seed-2",
    message: "Updated CTA copy on Variation 01",
    createdAt: Date.now() - 1000 * 60 * 55,
    author: { name: "Randeep Singh", initials: "RS" },
    foldKey: "cta-copy",
  },
  {
    id: "save-seed-1",
    message: "Initial editor draft",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    author: { name: "Aayush Agarwal", initials: "AA" },
    foldKey: "initial",
  },
];

function foldKeyForSeedId(id: string): string {
  if (id === "save-seed-1") return "initial";
  if (id === "save-seed-2") return "cta-copy";
  if (id === "save-seed-3") return "headline-spacing";
  return "initial";
}

function parseAuthor(raw: unknown): EditorSaveAuthor {
  if (raw && typeof raw === "object") {
    const a = raw as Partial<EditorSaveAuthor>;
    if (typeof a.name === "string" && a.name.trim()) {
      return {
        name: a.name.trim(),
        initials:
          typeof a.initials === "string" && a.initials.trim()
            ? a.initials.trim()
            : a.name
                .split(/\s+/)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
      };
    }
  }
  if (typeof raw === "string" && raw.trim() && raw !== "You") {
    return {
      name: raw.trim(),
      initials: raw
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  }
  return currentAuthor();
}

function parseVersions(raw: unknown): EditorSaveVersion[] {
  if (!Array.isArray(raw)) return SEED;
  const next: EditorSaveVersion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const v = item as Partial<EditorSaveVersion>;
    if (typeof v.id !== "string" || typeof v.createdAt !== "number") continue;
    next.push({
      id: v.id,
      message:
        typeof v.message === "string" &&
        v.message.trim() &&
        v.message.trim() !== "Untitled save"
          ? v.message.trim()
          : "",
      createdAt: v.createdAt,
      author: parseAuthor(v.author),
      foldKey:
        typeof v.foldKey === "string" && v.foldKey.trim()
          ? v.foldKey.trim()
          : foldKeyForSeedId(v.id),
    });
  }
  return next.length > 0 ? next : SEED;
}

export function formatSaveTime(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSaveStamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSaveRelative(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return formatSaveStamp(ts);
}

export function versionTitle(version: EditorSaveVersion): string {
  const titled = version.message.trim();
  return titled || formatSaveStamp(version.createdAt);
}

export function selectLatestVersion(
  versions: EditorSaveVersion[]
): EditorSaveVersion | null {
  return versions[0] ?? null;
}

export function selectActiveVersion(
  versions: EditorSaveVersion[],
  activeVersionId: string | null
): EditorSaveVersion | null {
  if (activeVersionId) {
    const found = versions.find((v) => v.id === activeVersionId);
    if (found) return found;
  }
  return selectLatestVersion(versions);
}

export function isViewingOlderVersion(
  versions: EditorSaveVersion[],
  activeVersionId: string | null
): boolean {
  const latest = selectLatestVersion(versions);
  if (!latest) return false;
  const active = selectActiveVersion(versions, activeVersionId);
  return Boolean(active && active.id !== latest.id);
}

export const useEditorSavesStore = create<EditorSavesState>()(
  persist(
    (set, get) => ({
      versions: SEED,
      activeVersionId: SEED[0]?.id ?? null,
      save: (message) => {
        const foldKey = nextVersionFoldKey(
          get().versions.map((v) => v.foldKey)
        );
        const version: EditorSaveVersion = {
          id: makeId(),
          message: message?.trim() || "",
          createdAt: Date.now(),
          author: currentAuthor(),
          foldKey,
        };
        set((state) => ({
          versions: [version, ...state.versions],
          activeVersionId: version.id,
        }));
        return version;
      },
      switchTo: (id) => {
        const exists = get().versions.some((v) => v.id === id);
        if (!exists) return;
        set({ activeVersionId: id });
      },
      restoreAsCurrent: (id) => {
        const source = get().versions.find((v) => v.id === id);
        if (!source) return null;
        const latest = get().versions[0];
        if (latest?.id === source.id) {
          set({ activeVersionId: source.id });
          return source;
        }
        const version: EditorSaveVersion = {
          id: makeId(),
          message: source.message.trim()
            ? `Restored “${source.message.trim()}”`
            : "",
          createdAt: Date.now(),
          author: currentAuthor(),
          foldKey: source.foldKey,
        };
        set((state) => ({
          versions: [version, ...state.versions],
          activeVersionId: version.id,
        }));
        return version;
      },
      exitToLatest: () => {
        const latest = get().versions[0];
        if (!latest) return;
        set({ activeVersionId: latest.id });
      },
    }),
    {
      name: "wingify-editor-saves-v3",
      partialize: (s) => ({
        versions: s.versions,
        activeVersionId: s.activeVersionId,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<EditorSavesState>;
        const versions = parseVersions(saved.versions);
        const activeVersionId =
          typeof saved.activeVersionId === "string" &&
          versions.some((v) => v.id === saved.activeVersionId)
            ? saved.activeVersionId
            : versions[0]?.id ?? null;
        return {
          ...current,
          versions,
          activeVersionId,
        };
      },
    }
  )
);
