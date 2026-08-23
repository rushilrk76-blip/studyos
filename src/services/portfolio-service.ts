import {
  createCertificateId,
  createProjectId,
  loadCertificates,
  loadProjects,
  saveCertificates,
  saveProjects,
} from "@/lib/portfolio-storage";
import type {
  Certificate,
  CertificateDraft,
  Project,
  ProjectDraft,
} from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  Portfolio records service — Projects & Certificates.

  These are the only manually-authored portfolio records.
  Everything else (syllabus %, marks averages, practice counts)
  is DERIVED from other systems via their own services.

  Data integrity: update/delete operate on a single record by id.

  FUTURE: methods become async when backed by Supabase
  (`projects` and `certificates` tables).
  ────────────────────────────────────────────────
*/

export const portfolioService = {
  /* ── Projects ── */
  createProjectId(): string {
    return createProjectId();
  },

  getProjects(): Project[] {
    return loadProjects();
  },

  saveProjects(projects: Project[]): void {
    saveProjects(projects);
  },

  addProject(draft: ProjectDraft): Project[] {
    const projects = loadProjects();
    const project: Project = {
      id: createProjectId(),
      ...draft,
      createdAt: new Date().toISOString(),
    };
    const updated = [project, ...projects];
    saveProjects(updated);
    return updated;
  },

  updateProject(id: string, draft: ProjectDraft): Project[] {
    const projects = loadProjects().map((p) =>
      p.id === id ? { ...p, ...draft } : p,
    );
    saveProjects(projects);
    return projects;
  },

  deleteProject(id: string): Project[] {
    const projects = loadProjects().filter((p) => p.id !== id);
    saveProjects(projects);
    return projects;
  },

  /* ── Certificates ── */
  createCertificateId(): string {
    return createCertificateId();
  },

  getCertificates(): Certificate[] {
    return loadCertificates();
  },

  saveCertificates(certificates: Certificate[]): void {
    saveCertificates(certificates);
  },

  addCertificate(draft: CertificateDraft): Certificate[] {
    const certificates = loadCertificates();
    const certificate: Certificate = {
      id: createCertificateId(),
      ...draft,
      createdAt: new Date().toISOString(),
    };
    const updated = [certificate, ...certificates];
    saveCertificates(updated);
    return updated;
  },

  updateCertificate(id: string, draft: CertificateDraft): Certificate[] {
    const certificates = loadCertificates().map((c) =>
      c.id === id ? { ...c, ...draft } : c,
    );
    saveCertificates(certificates);
    return certificates;
  },

  deleteCertificate(id: string): Certificate[] {
    const certificates = loadCertificates().filter((c) => c.id !== id);
    saveCertificates(certificates);
    return certificates;
  },
};
