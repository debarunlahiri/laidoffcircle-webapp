import { checkPassword } from "@/lib/password-strength";
import { Check, Circle } from "lucide-react";

export default function PasswordStrength({
  password,
  name,
  email,
}: {
  password: string;
  name: string;
  email: string;
}) {
  if (!password) return null;
  const { checks, level, label } = checkPassword(password, { name, email });
  return (
    <div className="pw-strength" aria-live="polite">
      <div className="pw-bars" data-level={level}>
        {[1, 2, 3, 4].map((bar) => (
          <span key={bar} className={bar <= level ? "on" : ""} />
        ))}
        <strong>{label}</strong>
      </div>
      <ul>
        {checks.map((check) => (
          <li key={check.label} className={check.ok ? "ok" : ""}>
            {check.ok ? <Check size={13} /> : <Circle size={13} />}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
