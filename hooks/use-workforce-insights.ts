"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
import type { ApiInsights } from "@/lib/api-types";
import { useApiResource } from "./use-api-resource";
export type ReportInput = {
  companyId: string;
  eventDate: string;
  rolesAffected: number;
  sourceUrl: string;
  headcount: number | null;
  hires: number | null;
};

export function useWorkforceInsights(
  section: string,
  notify: (message: string) => void,
) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const result = useApiResource<ApiInsights>(
    section === "Workforce insights" ? `/insights?year=${year}` : null,
    {
      year: Number(year),
      notice:
        "User reports may overlap. Figures are not independently verified.",
      monthly: [],
      companies: [],
    },
  );
  async function submitReport(report: ReportInput) {
    try {
      await api("/insights/reports", { method: "POST", body: report });
      invalidate("insights");
      notify("Report submitted. It will appear as user reported.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    }
  }
  return {
    submitReport,
    year,
    setYear,
    insights: result.data,
    insightsLoading: result.loading,
    insightsError: result.error,
  };
}
