"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { queryPath } from "@/lib/api";
import type {
  ApiReferral,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";
import { useApiList, useDebouncedValue } from "./use-api-resource";

export type ReferralView = "all" | "available" | "mine" | "requested";
export type ReferralFilters = {
  view: ReferralView;
  search: string;
  sort: string;
  status: "" | "open" | "closed" | "all";
  companyId: string;
  workMode: ReferralWorkMode | "";
  level: ReferralLevel | "";
  location: string;
  skill: string;
  experience: string;
  postedWithin: string;
  requestStatus: "" | "pending" | "accepted" | "declined";
  topRated: boolean;
};
export const defaultReferralFilters: ReferralFilters = {
  view: "all",
  search: "",
  sort: "newest",
  status: "",
  companyId: "",
  workMode: "",
  level: "",
  location: "",
  skill: "",
  experience: "",
  postedWithin: "",
  requestStatus: "",
  topRated: false,
};

// Filters and sorting are applied by the API so paging stays correct.
export function useReferralBoard() {
  const router = useRouter();
  const pathname = usePathname();
  // Skill chips on a referral link here as /referrals?skill=React.
  const urlSkill = useSearchParams().get("skill") ?? "";
  const [filters, setFilters] = useState({
    ...defaultReferralFilters,
    skill: urlSkill,
  });
  useEffect(() => {
    // Only a new ?skill= from a chip click changes the filter; clearing it never does.
    if (!urlSkill) return;
    setFilters((current) =>
      current.skill === urlSkill
        ? current
        : { ...current, skill: urlSkill, view: "all" },
    );
  }, [urlSkill]);
  // Dropping the skill filter also drops it from the address bar.
  const forgetUrlSkill = () => urlSkill && router.replace(pathname);
  const typed = useDebouncedValue(
    `${filters.search}\u0000${filters.location}\u0000${filters.skill}`,
  );
  const [search, location, skill] = typed.split("\u0000");
  const path = queryPath("/referrals", {
    search,
    location,
    skill,
    experience: filters.experience,
    sort: filters.sort,
    status:
      filters.status ||
      (filters.view === "mine" || filters.view === "requested"
        ? "all"
        : "open"),
    view: filters.view,
    companyId: filters.companyId,
    workMode: filters.workMode,
    level: filters.level,
    postedWithin: filters.postedWithin,
    requestStatus: filters.requestStatus,
    topRated: filters.topRated ? "true" : "",
  });
  const list = useApiList<ApiReferral>(path);
  const items = useMemo(() => list.data.map(toOpportunity), [list.data]);
  const activeCount = [
    filters.status,
    filters.companyId,
    filters.workMode,
    filters.level,
    filters.location.trim(),
    filters.skill.trim(),
    filters.experience,
    filters.postedWithin,
    filters.requestStatus,
    filters.topRated,
  ].filter(Boolean).length;
  return {
    filters,
    setFilters: (patch: Partial<ReferralFilters>) => {
      if (patch.skill !== undefined && patch.skill !== urlSkill)
        forgetUrlSkill();
      setFilters((current) => ({ ...current, ...patch }));
    },
    reset: () => {
      forgetUrlSkill();
      setFilters((current) => ({
        ...defaultReferralFilters,
        view: current.view,
      }));
    },
    items,
    activeCount,
    loading: list.loading,
    error: list.error,
    hasMore: list.hasMore,
    loadMore: list.loadMore,
  };
}
