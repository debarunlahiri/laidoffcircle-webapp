"use client";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

// The one password input used on sign-in, register and the admin console:
// a label, the field and a show/hide button. Pass `visible` and `onToggle`
// to share the show/hide state between several fields (e.g. password + confirm).
export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  autoFocus,
  visible,
  onToggle,
  showToggle = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  autoFocus?: boolean;
  visible?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}) {
  const id = useId();
  const [own, setOwn] = useState(false);
  const shown = visible ?? own;
  return (
    <label htmlFor={id}>
      {label}
      <div className="auth-password">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          minLength={12}
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            onClick={onToggle ?? (() => setOwn(!own))}
          >
            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}
