"use client";

import { useRef, useState } from "react";
import { Camera, CircleAlert, Pencil, User, X } from "lucide-react";
import {
  getBoard,
  getStream,
  isValidName,
  MIN_NAME_LENGTH,
  type BoardId,
  type StreamId,
} from "@/lib/student";

/* ── helpers ─────────────────────────────────── */

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/*
  Photos go into localStorage, which is tiny — so we shrink
  any image to a 192×192 square JPEG before saving it.
*/
async function resizeToAvatar(file: File, size = 192): Promise<string> {
  const dataUrl = await readAsDataUrl(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const side = Math.min(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  // center-crop to a square, then scale down
  ctx.drawImage(
    image,
    (image.width - side) / 2,
    (image.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.88);
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/* ── the step ────────────────────────────────── */

export function StepProfile({
  name,
  photoDataUrl,
  board,
  stream,
  onNameChange,
  onPhotoChange,
  onEditBoard,
  onEditStream,
  onContinue,
}: {
  name: string;
  photoDataUrl: string | null;
  board: BoardId | null;
  stream: StreamId | null;
  onNameChange: (name: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onEditBoard: () => void;
  onEditStream: () => void;
  onContinue: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const nameInvalid = touched && !isValidName(name);
  const initials = initialsOf(name);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("That file isn’t an image — pick a photo instead.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("That photo is larger than 8 MB — pick a smaller one.");
      return;
    }
    try {
      setPhotoError(null);
      onPhotoChange(await resizeToAvatar(file));
    } catch {
      setPhotoError("That photo couldn’t be read — try another one.");
    }
  }

  const selections = [
    {
      label: "Board",
      value: board ? getBoard(board).name : "—",
      fullName: board ? getBoard(board).fullName : "",
      onEdit: onEditBoard,
    },
    {
      label: "Stream",
      value: stream ? getStream(stream).name : "—",
      fullName: stream ? getStream(stream).description : "",
      onEdit: onEditStream,
    },
  ];

  return (
    <section aria-labelledby="profile-heading">
      <h2
        id="profile-heading"
        className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
      >
        Create Your Student Profile
      </h2>
      <p className="mt-2 text-ink-soft">
        Almost done — this is how StudyOS will greet you every day.
      </p>

      {/* Selection summary */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {selections.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {item.label}
              </p>
              <p className="truncate font-semibold text-ink">{item.value}</p>
              <p className="truncate text-xs text-ink-muted">{item.fullName}</p>
            </div>
            <button
              type="button"
              onClick={item.onEdit}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-pine-600 hover:text-pine-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
            >
              <Pencil className="size-3" />
              Change
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-7">
        {/* Full name */}
        <div>
          <label
            htmlFor="student-name"
            className="text-sm font-semibold text-ink"
          >
            Full name
          </label>
          <input
            id="student-name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && isValidName(name)) onContinue();
            }}
            placeholder="e.g., Aarav Sharma"
            autoComplete="name"
            maxLength={60}
            aria-invalid={nameInvalid}
            aria-describedby={nameInvalid ? "name-error" : undefined}
            className={`mt-2 h-12 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/30 ${
              nameInvalid
                ? "border-ember focus:border-ember"
                : "border-line focus:border-pine-600"
            }`}
          />
          {nameInvalid && (
            <p
              id="name-error"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-sm text-ember"
            >
              <CircleAlert className="size-4 shrink-0" />
              Please enter your name — at least {MIN_NAME_LENGTH} characters.
            </p>
          )}
        </div>

        {/* Optional photo */}
        <div>
          <p className="text-sm font-semibold text-ink">
            Profile photo{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-line bg-surface">
              {photoDataUrl ? (
                // plain <img>: data-URLs can't be optimized by next/image
                <img
                  src={photoDataUrl}
                  alt="Profile preview"
                  className="size-full object-cover"
                />
              ) : initials ? (
                <span className="grid size-full place-items-center rounded-full bg-pine-600 text-xl font-bold text-white">
                  {initials}
                </span>
              ) : (
                <User className="size-7 text-ink-muted" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload profile photo"
                onChange={(event) => {
                  handleFile(event.target.files?.[0]);
                  event.target.value = ""; // allow re-picking the same file
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink/25 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
              >
                <Camera className="size-4 text-pine-600" />
                {photoDataUrl ? "Change photo" : "Upload photo"}
              </button>
              {photoDataUrl && (
                <button
                  type="button"
                  onClick={() => onPhotoChange(null)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
                >
                  <X className="size-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="mt-2.5 text-xs text-ink-muted">
            Square photos look best. It’s resized and stored on this device
            only.
          </p>
          {photoError && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-ember">
              <CircleAlert className="size-4 shrink-0" />
              {photoError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
