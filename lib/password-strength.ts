// Mirrors the backend rules (laidoff-backend/src/password-strength.js).
const weakParts = [
  "password",
  "passw0rd",
  "qwerty",
  "letmein",
  "welcome",
  "iloveyou",
  "admin",
  "abc123",
  "123456",
  "654321",
  "000000",
  "111111",
  "laidoff",
  "layoff",
];
export type PasswordCheck = { label: string; ok: boolean };
export function checkPassword(
  password: string,
  who: { email?: string; name?: string } = {},
) {
  const flat = password.toLowerCase();
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password),
  ).length;
  const personal = [
    (who.email ?? "").split("@")[0],
    ...(who.name ?? "").split(/\s+/),
  ].filter((part) => part.length >= 4);
  const checks: PasswordCheck[] = [
    { label: "At least 12 characters", ok: password.length >= 12 },
    {
      label: "Three of: lowercase, uppercase, number, symbol",
      ok: classes >= 3,
    },
    {
      label: "No common words or 4+ repeated characters",
      ok:
        password.length > 0 &&
        !weakParts.some((part) => flat.includes(part)) &&
        !/(.)\1{3,}/.test(password),
    },
    {
      label: "Doesn’t contain your name or email",
      ok:
        password.length > 0 &&
        !personal.some((part) => flat.includes(part.toLowerCase())),
    },
  ];
  const score = checks.filter((check) => check.ok).length;
  const level =
    score === 4 && password.length >= 16
      ? 4
      : score === 4
        ? 3
        : score >= 3
          ? 2
          : password
            ? 1
            : 0;
  return {
    checks,
    level, // 0 empty, 1 weak, 2 fair, 3 good, 4 strong
    strong: score === 4,
    label: ["", "Weak", "Fair", "Good", "Strong"][level],
  };
}
