"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CircleAlert} from "lucide-react";
import { isValidName, type StudentProfile } from "@/lib/student";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal";

/*
  Edit Profile modal — name + photo only.
  Board, Stream and Student ID are deliberately NOT editable here.
  (Board/Stream change is a separate, warned action.)
*/

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function EditProfileForm({
  profile,
  onSave,
  onClose,
}: {
  profile: StudentProfile;
  onSave: (updated: { name: string; photoDataUrl: string | null }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [photoDataUrl, setPhotoDataUrl] = useState(profile.photoDataUrl);
  const [showErrors, setShowErrors] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const nameInvalid = name.trim().length < 2;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (nameInvalid) {
      setShowErrors(true);
      return;
    }
    onSave({ name: name.trim().replace(/\s+/g, " "), photoDataUrl });
  }

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("That file isn't an image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("That photo is larger than 8 MB.");
      return;
    }
    try {
      setPhotoError(null);
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      const size = 192;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setPhotoDataUrl(dataUrl);
        return;
      }
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.88));
    } catch {
      setPhotoError("That photo couldn't be read.");
    }
  }

  return (
    <ModalShell title="Edit Profile" onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full border-2 border-dashed border-line bg-canvas">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="Profile" className="size-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-medium text-pine-600">
                  {name.trim()[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink/25 hover:bg-canvas"
              >
                <Camera className="size-4 text-pine-600" />
                {photoDataUrl ? "Change photo" : "Upload photo"}
              </button>
              {photoDataUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  Remove
                </button>
              )}
            </div>
            {photoError && (
              <p role="alert" className="flex items-center gap-1.5 text-sm text-ember">
                <CircleAlert className="size-4" /> {photoError}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="text-sm font-semibold text-ink">
              Full name
            </label>
            <input
              id="edit-name"
              ref={nameRef}
              type="text"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={showErrors && nameInvalid}
              className={`${inputBase} h-12 ${showErrors && nameInvalid ? "border-ember" : "border-line focus:border-pine-600"}`}
            />
            {showErrors && nameInvalid && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-ember">
                <CircleAlert className="size-4" /> Please enter at least 2 characters.
              </p>
            )}
          </div>

          {/* Read-only identity */}
          <div className="rounded-2xl border border-line bg-canvas/50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Board · Stream</span>
              <span className="font-medium text-ink">{profile.board.toUpperCase()} · {profile.stream.toUpperCase()}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-ink-muted">Student ID</span>
              <span className="font-mono text-xs font-medium text-ink">{profile.studentId}</span>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Board and Stream can be changed from Settings → Academic Setup.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="lg">Save Changes</Button>
          </div>
        </form>
    </ModalShell>
  );
}
