"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { appStackDepth } from "./navigation-history";

export default function AppHeader({
  title,
  back,
  children,
  actions,
  className = "",
}: {
  title?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={`topbar app-header${back ? " has-back" : ""} ${className}`}
    >
      {back && (
        <button
          type="button"
          className="topbar-back"
          aria-label="Go back"
          onClick={() => {
            if (appStackDepth() > 0) router.back();
            else router.replace(back.href);
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
      {title ? <h1 className="topbar-title">{title}</h1> : children}
      {actions && <div className="app-header-actions">{actions}</div>}
    </header>
  );
}
