import Link from "next/link";
import type { ReactNode } from "react";

// Links a person's name/avatar to their profile. Anonymous authors have no id,
// so their content renders as plain, non-clickable markup.
export default function UserLink({
  id,
  username,
  children,
}: {
  id?: string | null;
  username?: string | null;
  children: ReactNode;
}) {
  if (!id) return <>{children}</>;
  return (
    <Link href={`/users/${username || id}`} className="user-link">
      {children}
    </Link>
  );
}
