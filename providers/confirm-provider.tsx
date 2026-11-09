"use client";
import Dialog from "@/components/ui/dialog";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  // "danger" makes the confirm button red (deleting, removing, signing out).
  tone?: "default" | "danger";
};
type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm>(async () => true);

// One shared "Are you sure?" dialog. Call `await confirm({...})` before any
// action that changes or removes something; it resolves false on cancel.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<{
    options: ConfirmOptions;
    resolve: (answer: boolean) => void;
  } | null>(null);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  function answer(value: boolean) {
    pending?.resolve(value);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Dialog
          label={pending.options.title}
          className="confirm-dialog"
          onClose={() => answer(false)}
        >
          <h2 className="confirm-title">{pending.options.title}</h2>
          {pending.options.message && (
            <p className="subtle-text">{pending.options.message}</p>
          )}
          <div className="confirm-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => answer(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={
                pending.options.tone === "danger" ? "danger-button" : "primary"
              }
              onClick={() => answer(true)}
            >
              {pending.options.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </Dialog>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
