"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
import { useApiResource } from "./use-api-resource";

export type ReportCategory = {
  value: string;
  label: string;
  icon?: string;
  subcategories?: { value: string; label: string }[];
};

export function usePostReports(notify: (message: string) => void) {
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // The allowed categories come from the backend, so they are never duplicated here.
  const categories = useApiResource<ReportCategory[]>(
    reportPostId ? "/posts/report-categories" : null,
    [],
  );

  async function submitPostReport(
    category: string,
    reason: string,
    subcategory?: string,
  ) {
    if (!reportPostId || saving) return;
    setSaving(true);
    try {
      await api(`/posts/${reportPostId}/reports`, {
        method: "POST",
        body: { category, subcategory: subcategory || undefined, reason: reason.trim() },
      });
      setReportPostId(null);
      invalidate("posts");
      notify("Thanks. Your report was submitted for review.");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return {
    reportPostId,
    openReportDialog: setReportPostId,
    closeReportDialog: () => setReportPostId(null),
    reportCategories: categories.data,
    reportCategoriesLoading: categories.loading,
    reportSaving: saving,
    submitPostReport,
  };
}
