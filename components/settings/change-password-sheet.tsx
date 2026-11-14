"use client";

import PasswordStrength from "@/components/auth/password-strength";
import BottomSheet from "@/components/ui/bottom-sheet";
import PasswordField from "@/components/ui/password-field";
import { api, apiMessage } from "@/lib/api";
import { checkPassword } from "@/lib/password-strength";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

// Change-your-own-password form in a bottom sheet. Clicking outside does not
// close it, so a half-typed password is never lost to a stray tap.
export default function ChangePasswordSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { notify } = usePlatform();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const who = { name: user?.name ?? "", email: user?.email ?? "" };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!checkPassword(password, who).strong)
      return setError("Please choose a stronger password.");
    if (password !== confirm) return setError("Your passwords don’t match.");
    if (password === current)
      return setError(
        "Your new password must be different from the current one.",
      );
    setSaving(true);
    try {
      await api("/me/password", {
        method: "PUT",
        body: { currentPassword: current, password, confirmPassword: confirm },
      });
      notify("Password changed. Your other devices were signed out.");
      onClose();
    } catch (e) {
      setError(apiMessage(e));
    } finally {
      setSaving(false);
    }
  }
  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    setError("");
  };

  return (
    <BottomSheet title="Change password" onClose={onClose}>
      <form className="pw-form" onSubmit={submit}>
        <PasswordField
          label="Current password"
          value={current}
          onChange={edit(setCurrent)}
          autoFocus
          placeholder="Enter your current password"
          visible={show}
          onToggle={() => setShow(!show)}
        />
        <PasswordField
          label="New password"
          value={password}
          onChange={edit(setPassword)}
          autoComplete="new-password"
          placeholder="At least 12 characters"
          visible={show}
          showToggle={false}
        />
        <PasswordStrength
          password={password}
          name={who.name}
          email={who.email}
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={edit(setConfirm)}
          autoComplete="new-password"
          placeholder="Enter the new password again"
          visible={show}
          showToggle={false}
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <div className="pw-form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="primary"
            disabled={saving || !current || !password || !confirm}
          >
            {saving && <LoaderCircle size={16} className="auth-spinner" />}
            {saving ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
