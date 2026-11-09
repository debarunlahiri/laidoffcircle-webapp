"use client";

import { sectionPaths } from "@/config/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function usePlatformNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [navigationOrigin, setNavigationOrigin] = useState<{
    path: string;
    source: "more" | "bottom-nav" | null;
  } | null>(null);
  const section = pathname.startsWith("/settings")
    ? "Settings"
    : pathname.startsWith("/support")
      ? "Support"
      : pathname.startsWith("/referrals/")
        ? "Referrals"
        : pathname.startsWith("/users/")
          ? "Member profile"
          : pathname.startsWith("/search")
            ? "Search"
            : Object.keys(sectionPaths).find(
                (label) => sectionPaths[label] === pathname,
              ) || "Home";

  function setSection(label: string) {
    const path = sectionPaths[label];
    if (path) router.push(path);
  }

  function navigate(
    label: string,
    source: "more" | "bottom-nav" | null = null,
  ) {
    const path = sectionPaths[label];
    if (path) setNavigationOrigin({ path, source });
    setSection(label);
    setSearch("");
    setMobileNav(false);
  }

  return {
    navigationSource:
      navigationOrigin?.path === pathname ? navigationOrigin.source : null,
    section,
    setSection,
    search,
    setSearch,
    mobileNav,
    setMobileNav,
    navigate,
  };
}
