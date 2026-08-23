"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";

/*
  Lightweight toast system for action feedback:
  "Task created.", "Result saved.", "Backup restored."

  Usage: const { toast } = useToast(); toast("Task created.");
  Toasts auto-dismiss after 3 seconds. Respects reduced motion.
*/

type ToastItem = { id: number; message: string };

const ToastContext = createContext<{ toast: (message: string) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string) => {
    const id = ++nextId.current;
    setItems((current) => [...current.slice(-2), { id, message }]);
    setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  function dismiss(id: number) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* toast viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 pb-2 sm:bottom-5 lg:bottom-6"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-sm animate-step-in items-center gap-2.5 rounded-2xl border border-line bg-ink px-4 py-3 shadow-lg"
          >
            <CheckCircle2 className="size-5 shrink-0 text-pine-200" />
            <p className="min-w-0 flex-1 text-sm font-medium text-white">
              {item.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
