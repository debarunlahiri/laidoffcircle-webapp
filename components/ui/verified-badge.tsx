import type { Badge } from "@/types";

const labels: Record<Badge, string> = {
  blue: "Verified member",
  gold: "Verified company",
};

// Blue tick for verified members, gold tick for verified companies/organisations.
export default function VerifiedBadge({
  type,
  size = 15,
}: {
  type?: Badge | null;
  size?: number;
}) {
  if (type !== "blue" && type !== "gold") return null;
  return (
    <svg
      className={`verified-badge verified-${type}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={labels[type]}
    >
      <title>{labels[type]}</title>
      <path
        fill="currentColor"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.8 12.4l3 3 5.4-6"
      />
    </svg>
  );
}
