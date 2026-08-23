import type { Certificate, Project } from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  localStorage for portfolio Projects & Certificates.

  Two keys, separate from every other system. Only metadata is
  stored — no file uploads, no images, no cloud. Each record
  optionally holds a URL/link string the student typed in.
  ────────────────────────────────────────────────
*/

const PROJECTS_KEY = "studyos:projects:v1";
const CERTIFICATES_KEY = "studyos:certificates:v1";

/* ── Projects ───────────────────────────────── */
function parseProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.title !== "string") return null;
  return {
    id: o.id,
    title: o.title,
    description: typeof o.description === "string" ? o.description : "",
    subject: typeof o.subject === "string" ? o.subject : "",
    date: typeof o.date === "string" ? o.date : "",
    link: typeof o.link === "string" ? o.link : "",
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
  };
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseProject)
      .filter((p): p is Project => p !== null);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // Storage full / private mode — UI still works this session.
  }
}

/* ── Certificates ───────────────────────────── */
function parseCertificate(value: unknown): Certificate | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.title !== "string") return null;
  return {
    id: o.id,
    title: o.title,
    organization: typeof o.organization === "string" ? o.organization : "",
    date: typeof o.date === "string" ? o.date : "",
    link: typeof o.link === "string" ? o.link : "",
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
  };
}

export function loadCertificates(): Certificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CERTIFICATES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseCertificate)
      .filter((c): c is Certificate => c !== null);
  } catch {
    return [];
  }
}

export function saveCertificates(certificates: Certificate[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
  } catch {
    // Storage full / private mode — UI still works this session.
  }
}

/* ── Stable IDs ─────────────────────────────── */
export function createProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCertificateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
