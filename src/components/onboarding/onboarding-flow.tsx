"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  EMPTY_DRAFT,
  generateStudentId,
  isValidName,
  normalizeName,
  type OnboardingDraft,
  type StudentProfile,
} from "@/lib/student";
import { studentService } from "@/services";
import { routes } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { SetupProgress } from "@/components/onboarding/setup-progress";
import { StepBoard } from "@/components/onboarding/step-board";
import { StepStream } from "@/components/onboarding/step-stream";
import { StepProfile } from "@/components/onboarding/step-profile";

/*
  ────────────────────────────────────────────────
  The onboarding state machine.

  step 0 → board      (valid when a board is picked)
  step 1 → stream     (valid when a stream is picked)
  step 2 → profile    (valid when a name is entered)
  finish → save profile, then land on the dashboard

  The draft is mirrored to localStorage on every change,
  so a browser refresh mid-setup loses nothing.
  ────────────────────────────────────────────────
*/

const STEP_LABELS = ["Board", "Stream", "Profile"];

const STEP_HINTS = [
  "Select your board to continue.",
  "Select your stream to continue.",
  "Enter your name to continue.",
];

export function OnboardingFlow() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);

  /*
    Load once, on the client only. (Server + first client render must
    match to avoid hydration errors — that's why we read storage in
    useEffect instead of useState's initializer.)
  */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const savedDraft = studentService.getDraft();
          const savedProfile = studentService.getProfile();
          if (savedDraft) {
            setDraft(savedDraft);
          } else if (savedProfile) {
            setDraft(studentService.getDraftFromProfile(savedProfile)); // prefill to allow edits
          }
          setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Mirror the draft to localStorage after every change. */
  useEffect(() => {
    if (hydrated) studentService.saveDraft(draft);
  }, [draft, hydrated]);

  const stepValid = [
    draft.board !== null,
    draft.stream !== null,
    isValidName(draft.name),
  ];
  const canContinue = stepValid[step] ?? false;

  function goNext() {
    if (!canContinue) return;
    if (step < STEP_LABELS.length - 1) {
      setStep(step + 1);
      return;
    }
    /* Final step → freeze the draft into a profile, then enter the app. */
    if (!draft.board || !draft.stream) return;
    const profile: StudentProfile = {
      name: normalizeName(draft.name),
      board: draft.board,
      stream: draft.stream,
      photoDataUrl: draft.photoDataUrl,
      createdAt: new Date().toISOString(),
      studentId: generateStudentId(draft.board, draft.stream),
    };
    studentService.saveProfile(profile);
    studentService.clearDraft();
    router.replace(routes.dashboard);
  }

  if (!hydrated) return <OnboardingSkeleton />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <SetupProgress
        step={step + 1}
        total={STEP_LABELS.length}
        label={STEP_LABELS[step]}
      />

      {/* `key` re-mounts the step so the step-in animation replays */}
      <div key={step} className="mt-10 animate-step-in sm:mt-12">
        {step === 0 && (
          <StepBoard
            value={draft.board}
            onChange={(board) => setDraft((d) => ({ ...d, board }))}
          />
        )}
        {step === 1 && (
          <StepStream
            value={draft.stream}
            onChange={(stream) => setDraft((d) => ({ ...d, stream }))}
          />
        )}
        {step === 2 && (
          <StepProfile
            name={draft.name}
            photoDataUrl={draft.photoDataUrl}
            board={draft.board}
            stream={draft.stream}
            onNameChange={(name) => setDraft((d) => ({ ...d, name }))}
            onPhotoChange={(photoDataUrl) =>
              setDraft((d) => ({ ...d, photoDataUrl }))
            }
            onEditBoard={() => setStep(0)}
            onEditStream={() => setStep(1)}
            onContinue={goNext}
          />
        )}
      </div>

      {/* Footer navigation */}
      <div className="mt-12 flex items-center justify-between gap-4 border-t border-line/70 pt-6">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4">
          {!canContinue && (
            <p className="hidden text-sm text-ink-muted sm:block">
              {STEP_HINTS[step]}
            </p>
          )}
          <Button size="lg" onClick={goNext} disabled={!canContinue}>
            {step === STEP_LABELS.length - 1
              ? "Continue to StudyOS"
              : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/*
  Placeholder shown for the split second before we read localStorage —
  keeps the layout stable instead of flashing empty or wrong content.
*/
function OnboardingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse" aria-hidden>
      <div className="flex items-baseline justify-between">
        <span className="h-4 w-20 rounded bg-line" />
        <span className="h-4 w-14 rounded bg-line" />
      </div>
      <div className="mt-3 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full bg-line" />
        ))}
      </div>
      <span className="mt-12 block h-9 w-72 max-w-full rounded-lg bg-line" />
      <span className="mt-3 block h-5 w-96 max-w-full rounded bg-line/70" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <span className="h-40 rounded-3xl border border-line bg-surface" />
        <span className="h-40 rounded-3xl border border-line bg-surface" />
      </div>
      <div className="mt-12 flex justify-end border-t border-line/70 pt-6">
        <span className="h-12 w-36 rounded-full bg-line" />
      </div>
    </div>
  );
}
