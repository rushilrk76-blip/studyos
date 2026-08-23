"use client";

import { useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  Pencil,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import { getBoard, getStream, type StudentProfile } from "@/lib/student";
import { SUBJECTS, subjectsForStream } from "@/lib/subjects";
import { useStudent } from "@/components/app/student-context";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

/*
  The Profile page — a polished identity card plus a subject
  list. All data comes from the single StudentProfile source
  via the context, so editing the name here instantly updates
  the Dashboard greeting, Portfolio, sidebar, etc.
*/
export function ProfileView() {
  const student = useStudent();
  const [editing, setEditing] = useState(false);

  if (student.status !== "ready") {
    return (
      <div className="space-y-6" aria-hidden>
        <span className="block h-56 animate-pulse rounded-3xl border border-line bg-surface" />
        <span className="block h-40 animate-pulse rounded-3xl border border-line bg-surface" />
      </div>
    );
  }

  const { profile, updateProfile } = student;
  const board = getBoard(profile.board);
  const stream = getStream(profile.stream);
  const subjects = subjectsForStream(profile.stream);
  const firstName = profile.name.trim().split(/\s+/)[0];
  const createdOn = profile.createdAt
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" })
        .format(new Date(profile.createdAt))
    : null;

  function handleSave(updates: { name: string; photoDataUrl: string | null }) {
    updateProfile({ ...profile, ...updates });
    setEditing(false);
  }

  return (
    <div className="space-y-8">
      {/* header banner */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="dot-grid border-b border-line bg-pine-900 px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <span className="grid size-24 shrink-0 overflow-hidden rounded-full border-4 border-white/15 bg-white/10">
                {profile.photoDataUrl ? (
                  <img src={profile.photoDataUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center font-display text-4xl font-medium text-white">
                    {firstName[0]?.toUpperCase() ?? <User className="size-10" />}
                  </span>
                )}
              </span>
              <div className="text-center sm:text-left">
                <h1 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  {profile.name}
                </h1>
                <p className="mt-1.5 text-sm text-white/70">
                  Class 12 · {board.name} · {stream.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                  <GraduationCap className="size-3.5" />
                  {profile.studentId}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-10">
            <p className="text-sm text-ink-muted">
              {createdOn ? `Joined StudyOS on ${createdOn}` : "Welcome to StudyOS"}
            </p>
            <Button variant="secondary" size="md" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          </div>
        </section>
      </Reveal>

      {/* subjects */}
      <Reveal delay={60}>
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Your Subjects</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${subject.accent.tile}`}>
                  <subject.icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{subject.name}</p>
                  <p className="text-xs text-ink-muted">Class 12 · {board.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* quick links */}
      <Reveal delay={80}>
        <div className="flex flex-wrap gap-3">
          <Button href="/settings" variant="secondary" size="lg">
            <SettingsIcon className="size-4" />
            Settings
          </Button>
          <Button href="/portfolio" variant="secondary" size="lg">
            View Portfolio
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </Reveal>

      {editing && (
        <EditProfileForm
          profile={profile}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
